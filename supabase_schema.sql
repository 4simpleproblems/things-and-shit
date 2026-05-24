-- Create tables for Dead Man's Button

-- 1. CLEANUP OLD TABLES (Ensures new column structures like family_id are applied)
DROP TABLE IF EXISTS public.discovery_pulses CASCADE;
DROP TABLE IF EXISTS public.family_members CASCADE;
DROP TABLE IF EXISTS public.family_codes CASCADE;
DROP TABLE IF EXISTS public.families CASCADE;
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.tas_tracker_entries CASCADE;
DROP TABLE IF EXISTS public.board_items CASCADE;

-- 2. CREATE TABLES

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Named Families
CREATE TABLE public.families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.family_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes')
);

CREATE TABLE public.family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nickname TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, member_id)
);

-- Local Discovery Pulses
CREATE TABLE public.discovery_pulses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  network_id TEXT NOT NULL, -- Hashed Public IP
  local_name TEXT NOT NULL,
  status TEXT DEFAULT 'paused',
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_pulses ENABLE ROW LEVEL SECURITY;

-- 4. CREATE POLICIES

-- Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Contacts
CREATE POLICY "Users can view their own contacts" ON public.contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own contacts" ON public.contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contacts" ON public.contacts FOR DELETE USING (auth.uid() = user_id);

-- Families
CREATE POLICY "Users can view their families" ON public.families FOR SELECT USING (true);
CREATE POLICY "Users can create families" ON public.families FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their families" ON public.families FOR UPDATE USING (auth.uid() = creator_id);

-- Family Codes
CREATE POLICY "Users can manage their own codes" ON public.family_codes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.families WHERE id = family_id AND creator_id = auth.uid())
);
CREATE POLICY "Everyone can view codes to join" ON public.family_codes FOR SELECT USING (true);

-- Family Members
CREATE POLICY "Users can view members of their families" ON public.family_members FOR SELECT USING (true);
CREATE POLICY "Users can add members to families" ON public.family_members FOR INSERT WITH CHECK (auth.uid() = member_id);
CREATE POLICY "Owners can remove members" ON public.family_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.families WHERE id = family_id AND creator_id = auth.uid())
);

-- Discovery Pulses
CREATE POLICY "Users can view pulses" ON public.discovery_pulses FOR SELECT USING (true);
CREATE POLICY "Users can manage their pulses" ON public.discovery_pulses FOR ALL USING (auth.uid() = user_id);

-- Linked Friends
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  friend_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_email)
);

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their friends" ON public.friends;
CREATE POLICY "Users can view their friends" ON public.friends FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can add friends" ON public.friends;
CREATE POLICY "Users can add friends" ON public.friends FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete friends" ON public.friends;
CREATE POLICY "Users can delete friends" ON public.friends FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.tas_tracker_entries (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  weight NUMERIC NOT NULL,
  mood TEXT NOT NULL,
  image_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, log_date)
);

ALTER TABLE public.tas_tracker_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own tracker entries" ON public.tas_tracker_entries FOR ALL USING (auth.uid() = user_id);

CREATE TABLE public.board_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  short_desc TEXT,
  full_desc TEXT,
  log_date TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  tag TEXT,
  tag_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.board_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own board items" ON public.board_items FOR ALL USING (auth.uid() = user_id);

-- 5. FUNCTIONS & TRIGGERS

-- Add HTTP extension for Resend API calls
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Function to send alert emails via Resend with minimalistic layout
CREATE OR REPLACE FUNCTION public.send_alert_email(contact_emails TEXT[], sender_name TEXT)
RETURNS JSON AS $$
DECLARE
  resend_key TEXT;
  response JSON;
BEGIN
  -- Retrieve Resend API Key from Supabase Vault
  SELECT decrypted_secret INTO resend_key 
  FROM vault.decrypted_secrets 
  WHERE id = 'e19dd560-da60-4912-8071-0301d9960431';

  IF resend_key IS NULL THEN
    RAISE EXCEPTION 'Resend API key not found in vault. Ensure the ID is correct and the secret exists.';
  END IF;

  -- Call Resend API using the http extension
  -- Using minimalist style requested by user
  SELECT content::json INTO response
  FROM extensions.http((
    'POST',
    'https://api.resend.com/emails',
    ARRAY[
      extensions.http_header('Authorization', 'Bearer ' || resend_key), 
      extensions.http_header('Content-Type', 'application/json')
    ],
    'application/json',
    jsonb_build_object(
      'from', 'Dead Mans Button <alerts@things-and-shit.org>',
      'to', to_jsonb(contact_emails),
      'subject', 'URGENT: Dead Mans Button Alert from ' || sender_name,
      'html', format(
        '<!DOCTYPE html><html lang="en"><body style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 40px 20px; background-color: #ffffff;">' ||
        '<div style="display: none; max-height: 0px; overflow: hidden;">Emergency alert triggered for %s. Please check in immediately. %s</div>' ||
        '<div style="max-width: 600px; margin: 0 auto; text-align: left;">' ||
          '<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">' ||
            '<tr>' ||
              '<td><img src="https://dmb.things-and-shit.org/favicon.ico" width="80" height="80" alt="DMB" style="border-radius: 8px; display: block;"></td>' ||
              '<td style="padding: 0 15px; color: #999999; font-size: 20px;">&bull;</td>' ||
              '<td><img src="https://things-and-shit.org/favicon.ico" width="80" height="80" alt="TAS" style="border-radius: 8px; display: block;"></td>' ||
            '</tr>' ||
          '</table>' ||
          '<h2 style="font-size: 20px; color: #111111; margin: 0 0 20px 0; font-weight: 600;">Emergency Alert Triggered</h2>' ||
          '<p style="font-size: 14px; margin: 0 0 16px 0;">An automated emergency alert was triggered for <strong>%s</strong>.</p>' ||
          '<p style="font-size: 14px; margin: 0 0 24px 0;">Their 10-second timer has run out. Please check in on them immediately to verify their safety.</p>' ||
          '<p style="font-size: 12px; color: #888888; margin: 40px 0 0 0;">Dead Man''s Button &bull; A safety tool by 4SP</p>' ||
          '<p style="color: #eeeeee; font-size: 8px; margin-top: 20px;">Ref: %s</p>' ||
        '</div></body></html>',
        sender_name, EXTRACT(EPOCH FROM now())::text, sender_name, 'DMB-' || EXTRACT(EPOCH FROM now())::text
      )
    )::text
  ));

  RETURN response;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = extensions, public, vault;

CREATE OR REPLACE FUNCTION public.urlencode(uri text)
RETURNS text AS $$
DECLARE
  i int;
  char text;
  encoded text := '';
BEGIN
  FOR i IN 1..length(uri) LOOP
    char := substr(uri, i, 1);
    IF char ~ '[a-zA-Z0-9\-_\.!~*''()]' THEN
      encoded := encoded || char;
    ELSIF char = ' ' THEN
      encoded := encoded || '+';
    ELSE
      encoded := encoded || '%' || lpad(to_hex(ascii(char)), 2, '0');
    END IF;
  END LOOP;
  RETURN encoded;
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

CREATE OR REPLACE FUNCTION public.send_alert_sms(contact_phones TEXT[], sender_name TEXT)
RETURNS JSON AS $$
DECLARE
  account_sid TEXT := 'AC00000000000000000000000000000000';
  twilio_auth_token TEXT;
  auth_header TEXT;
  http_resp record;
  response JSON;
  from_number TEXT;
  messaging_service_sid TEXT;
  phone TEXT;
  message_body TEXT;
  post_data TEXT;
  result JSON;
  results JSON[] := ARRAY[]::JSON[];
BEGIN
  SELECT decrypted_secret INTO twilio_auth_token 
  FROM vault.decrypted_secrets 
  WHERE id = '9199ec84-e840-459e-b401-701313945a0b';

  IF twilio_auth_token IS NULL THEN
    RAISE EXCEPTION 'Twilio Auth Token not found in vault. Ensure the ID is correct and the secret exists.';
  END IF;

  auth_header := replace(encode((account_sid || ':' || twilio_auth_token)::bytea, 'base64'), E'\n', '');

  BEGIN
    SELECT * INTO http_resp
    FROM extensions.http((
      'GET',
      'https://api.twilio.com/2010-04-01/Accounts/' || account_sid || '/IncomingPhoneNumbers.json',
      ARRAY[
        extensions.http_header('Authorization', 'Basic ' || auth_header)
      ],
      NULL,
      NULL
    ));

    IF http_resp.status = 200 THEN
      response := http_resp.content::json;
      IF response IS NOT NULL AND response ? 'incoming_phone_numbers' AND json_typeof(response->'incoming_phone_numbers') = 'array' AND json_array_length(response->'incoming_phone_numbers') > 0 THEN
        from_number := response->'incoming_phone_numbers'->0->>'phone_number';
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
  END;

  IF from_number IS NULL THEN
    BEGIN
      SELECT * INTO http_resp
      FROM extensions.http((
        'GET',
        'https://messaging.twilio.com/v1/Services',
        ARRAY[
          extensions.http_header('Authorization', 'Basic ' || auth_header)
        ],
        NULL,
        NULL
      ));

      IF http_resp.status = 200 THEN
        response := http_resp.content::json;
        IF response IS NOT NULL AND response ? 'services' AND json_typeof(response->'services') = 'array' AND json_array_length(response->'services') > 0 THEN
          messaging_service_sid := response->'services'->0->>'sid';
        END IF;
      END IF;
    EXCEPTION WHEN OTHERS THEN
    END;
  END IF;

  IF from_number IS NULL AND messaging_service_sid IS NULL THEN
    from_number := '+18557033732';
  END IF;

  message_body := 'URGENT: Dead Mans Button Alert for ' || sender_name || '. Their 10-second timer has run out. Please check in on them immediately.';

  FOREACH phone IN ARRAY contact_phones LOOP
    IF from_number IS NOT NULL THEN
      post_data := 'To=' || public.urlencode(phone) || '&From=' || public.urlencode(from_number) || '&Body=' || public.urlencode(message_body);
    ELSE
      post_data := 'To=' || public.urlencode(phone) || '&MessagingServiceSid=' || public.urlencode(messaging_service_sid) || '&Body=' || public.urlencode(message_body);
    END IF;

    SELECT content::json INTO result
    FROM extensions.http((
      'POST',
      'https://api.twilio.com/2010-04-01/Accounts/' || account_sid || '/Messages.json',
      ARRAY[
        extensions.http_header('Authorization', 'Basic ' || auth_header), 
        extensions.http_header('Content-Type', 'application/x-www-form-urlencoded')
      ],
      'application/x-www-form-urlencoded',
      post_data
    ));

    results := array_append(results, result);
  END LOOP;

  RETURN to_json(results);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = extensions, public, vault;

CREATE OR REPLACE FUNCTION delete_expired_codes() RETURNS void AS $$
BEGIN
  DELETE FROM public.family_codes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
