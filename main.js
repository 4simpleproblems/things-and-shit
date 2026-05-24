(function() {
  if (window.location.hash.startsWith('##')) {
    window.history.replaceState(
      null,
      document.title,
      window.location.pathname + window.location.search + window.location.hash.substring(1)
    );
  }

  const sidebarHTML = `
    <nav id="sidebar">
      <div class="control-deck">
        <button class="deck-btn" onclick="toggleSidebar()">
          <i class="fa-solid fa-chevron-left" id="toggleIcon"></i>
        </button>
      </div>
      <a href="index.html" class="nav-logo">t.a.s.</a>
      <a href="index.html" class="nav-hitbox">
        <div class="nav-blob"></div>
        <div class="nav-link"><i class="fa-solid fa-house"></i> <span>Home</span></div>
      </a>
      <a href="board.html" class="nav-hitbox">
        <div class="nav-blob"></div>
        <div class="nav-link"><i class="fa-solid fa-chalkboard-user"></i> <span>My Board</span></div>
      </a>
      <a href="about.html" class="nav-hitbox">
        <div class="nav-blob"></div>
        <div class="nav-link"><i class="fa-solid fa-face-smile-wink"></i> <span>About</span></div>
      </a>
      <a href="favorites.html" class="nav-hitbox">
        <div class="nav-blob"></div>
        <div class="nav-link"><i class="fa-solid fa-bolt"></i> <span>Pet Peeves</span></div>
      </a>
      <a href="dedication.html" class="nav-hitbox">
        <div class="nav-blob"></div>
        <div class="nav-link"><i class="fa-solid fa-heart"></i> <span>4SP Dedication</span></div>
      </a>
      <a href="creations.html" class="nav-hitbox">
        <div class="nav-blob"></div>
        <div class="nav-link"><i class="fa-solid fa-briefcase"></i> <span>Creations and s***</span></div>
      </a>
      <div class="sidebar-auth" id="sidebarAuth"></div>
    </nav>
  `;

  const footerHTML = `
    <div class="footer-bar">
      <div>Made with ❤ from 4SP. &copy; 2026</div>
      <a href="terms.html">Terms & Privacy</a>
      <a href="mailto:hello@things-and-shit.org">hello@things-and-shit.org</a>
    </div>
  `;

  // Inject Styles
  const style = document.createElement('style');
  style.textContent = `
    /* sidebar */
    #sidebar {
      width: 260px; height: 100vh; background: #ffffff; border-right: 5px solid #1a1a1a;
      position: fixed; left: 0; top: 0; padding: 40px 20px;
      display: flex; flex-direction: column; z-index: 1000;
      transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    }
    #sidebar.collapsed { transform: translateX(-100%); }

    .nav-logo { font-family: 'Alfa Slab One', serif; font-size: 32px; margin-bottom: 50px; text-align: left; color: #1a1a1a; text-decoration: none; }
    .nav-hitbox { position: relative; margin-bottom: 20px; padding: 15px; cursor: pointer; display: block; text-decoration: none; color: inherit;}
    .nav-blob { position: absolute; inset: 0; background: #fff; border: 4px solid #1a1a1a; border-radius: 15px; z-index: -1; transform: rotate(-2deg); transition: 0.3s; }
    .nav-hitbox:hover .nav-blob { background: #FFB703; transform: rotate(0deg) scale(1.05); box-shadow: 6px 6px 0px #1a1a1a; }
    .nav-hitbox.active .nav-blob { background: #1a1a1a; transform: rotate(0deg); }
    .nav-link { font-family: 'Alfa Slab One', serif; font-size: 16px; display: flex; align-items: center; justify-content: flex-start; gap: 12px; }
    .nav-hitbox.active .nav-link { color: #fff; }

    .control-deck { position: absolute; bottom: 24px; right: -65px; display: flex; gap: 15px; }
    .deck-btn {
      width: 50px; height: 50px; background: #fff; border: 5px solid #1a1a1a;
      border-radius: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 20px; box-shadow: 4px 4px 0px #f0f0f0; transition: 0.3s; color: #1a1a1a; text-decoration: none;
    }
    .deck-btn:hover { transform: translateY(-4px); box-shadow: 8px 8px 0px #e8e8e8; }

    /* Core Layout Styles */
    body { 
      font-family: 'Nunito', sans-serif; 
      background: #ffffff; 
      color: #1a1a1a; 
      overflow-x: hidden;
      min-height: 100vh;
      display: flex;
      margin: 0;
    }
    .main-wrapper { 
      flex: 1; 
      margin-left: 260px; 
      transition: margin-left 0.4s cubic-bezier(0.19, 1, 0.22, 1); 
      position: relative; 
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    body.sidebar-closed .main-wrapper { margin-left: 0 !important; }

    /* footer */
    .footer-bar { 
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex; 
      flex-direction: column; 
      align-items: flex-end; 
      gap: 8px; 
      color: #1a1a1a; 
      font-size: 11px; 
      font-weight: 900; 
      text-transform: uppercase;
      letter-spacing: 1px;
      z-index: 100;
      pointer-events: none;
    }
    .footer-bar > * { pointer-events: auto; }
    .footer-bar a { 
      background: #fff; 
      color: #1a1a1a; 
      padding: 8px 16px; 
      border-radius: 12px; 
      text-decoration: none; 
      transition: 0.3s;
      border: 3px solid #1a1a1a;
      font-family: 'Alfa Slab One', serif;
      font-size: 11px;
    }
    .footer-bar a:hover { 
      background: #FFB703; 
      transform: translateY(-3px) rotate(2deg);
      box-shadow: 4px 4px 0px #1a1a1a;
    }
    @media (max-width: 1000px) {
      .footer-bar {
        position: static;
        margin-top: 40px;
        align-items: center;
        padding-bottom: 40px;
        pointer-events: auto;
      }
      .main-wrapper { margin-left: 0 !important; }
    }
    @media (max-width: 1000px) {
      #sidebar { width: 100%; height: 70px; flex-direction: row; bottom: 0; top: auto; border-right: none; border-top: 5px solid #1a1a1a; transform: none !important; padding: 0 10px; justify-content: space-around; align-items: center; }
      .control-deck, .nav-logo { display: none; }
      .nav-hitbox { margin-bottom: 0; }
      .nav-link span { display: none; }
    }

    .sidebar-auth {
      margin-top: auto;
      padding-top: 20px;
      border-top: 5px solid #1a1a1a;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .auth-user-info {
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #666;
      text-align: center;
      word-break: break-all;
    }
    @media (max-width: 1000px) {
      .sidebar-auth {
        margin-top: 0;
        padding-top: 0;
        border-top: none;
        flex-direction: row;
        align-items: center;
        gap: 0;
      }
      .auth-user-info {
        display: none;
      }
      .auth-trigger span, .auth-logout span {
        display: none;
      }
    }
  `;
  document.head.appendChild(style);

  // Inject HTML
  document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
  
  const mainWrapper = document.querySelector('.main-wrapper');
  if (mainWrapper) {
    mainWrapper.insertAdjacentHTML('beforeend', footerHTML);
  } else {
    document.body.insertAdjacentHTML('beforeend', footerHTML);
  }

  // Highlight active link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-hitbox').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path) {
      link.classList.add('active');
    }
  });

  // Sidebar toggle function
  window.toggleSidebar = function() {
    const sb = document.getElementById('sidebar');
    const body = document.body;
    const icon = document.getElementById('toggleIcon');
    
    sb.classList.toggle('collapsed');
    body.classList.toggle('sidebar-closed');
    if (icon) {
      icon.className = sb.classList.contains('collapsed') ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-left';
    }
  };

  const authModalHTML = `
    <div id="authModalDimmer" onclick="closeAuthModal()" style="position: fixed; inset: 0; background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); opacity: 0; pointer-events: none; z-index: 19998; transition: opacity 0.5s ease;"></div>
    <div id="authModal" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); width: calc(100vw - 40px); max-width: 400px; background: #ffffff; border: 5px solid #1a1a1a; border-radius: 40px; box-shadow: 15px 15px 0px #1a1a1a; padding: 40px; z-index: 19999; display: none; opacity: 0; transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1); flex-direction: column; gap: 20px;">
      <div style="position: absolute; top: 15px; right: 15px; cursor: pointer; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;" onclick="closeAuthModal()">
        <div style="background: #ffffff; border: 4px solid #1a1a1a; border-radius: 10px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold;"><i class="fa-solid fa-xmark"></i></div>
      </div>
      <h2 style="font-family: 'Alfa Slab One', serif; font-size: 28px; line-height: 1.1; margin-bottom: 5px; color: #1a1a1a;">Sign In</h2>
      <p style="font-size: 14px; font-weight: 700; color: #666; margin-bottom: 10px; line-height: 1.4;">Access your board and synced services across all domains.</p>
      <button onclick="loginGoogle()" style="width: 100%; padding: 15px; background: #ffffff; color: #1a1a1a; border: 4px solid #1a1a1a; border-radius: 15px; font-family: 'Alfa Slab One', serif; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 4px 4px 0px #1a1a1a; transition: 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='6px 6px 0px #1a1a1a';" onmouseout="this.style.transform='none'; this.style.boxShadow='4px 4px 0px #1a1a1a';">
        <i class="fa-brands fa-google"></i> Continue with Google
      </button>
      <button onclick="loginEmailPrompt()" style="width: 100%; padding: 15px; background: #1a1a1a; color: #ffffff; border: 4px solid #1a1a1a; border-radius: 15px; font-family: 'Alfa Slab One', serif; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 4px 4px 0px #cccccc; transition: 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='6px 6px 0px #cccccc';" onmouseout="this.style.transform='none'; this.style.boxShadow='4px 4px 0px #cccccc';">
        <i class="fa-solid fa-envelope"></i> Continue with Email
      </button>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', authModalHTML);

  window.openAuthModal = function() {
    const modal = document.getElementById('authModal');
    const dimmer = document.getElementById('authModalDimmer');
    modal.style.display = 'flex';
    void modal.offsetWidth;
    requestAnimationFrame(() => {
      dimmer.style.opacity = '1';
      dimmer.style.pointerEvents = 'auto';
      modal.style.opacity = '1';
      modal.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    document.body.style.overflow = 'hidden';
  };

  window.closeAuthModal = function() {
    const modal = document.getElementById('authModal');
    const dimmer = document.getElementById('authModalDimmer');
    dimmer.style.opacity = '0';
    dimmer.style.pointerEvents = 'none';
    modal.style.opacity = '0';
    modal.style.transform = 'translate(-50%, -50%) scale(0.9)';
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }, 400);
  };

  window.loginGoogle = async function() {
    if (!window.supabase) return;
    const cleanUrl = window.location.href.split('#')[0];
    await window.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: cleanUrl }
    });
  };

  window.loginEmailPrompt = async function() {
    if (!window.supabase) return;
    const email = prompt("What's your email?");
    if (email) {
      const cleanUrl = window.location.href.split('#')[0];
      const { error } = await window.supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: cleanUrl }
      });
      if (error) {
        alert("Error: " + error.message);
      } else {
        alert("Magic link sent! Check your inbox.");
      }
    }
  };

  window.logoutSupabase = async function() {
    if (!window.supabase) return;
    await window.supabase.auth.signOut();
    window.location.reload();
  };

  function updateAuthUI(session) {
    const container = document.getElementById('sidebarAuth');
    if (!container) return;
    if (session && session.user) {
      container.innerHTML = `
        <div class="auth-user-info">
          <span>${session.user.email}</span>
        </div>
        <div class="nav-hitbox auth-logout" onclick="logoutSupabase()">
          <div class="nav-blob" style="border-color: #FF0054;"></div>
          <div class="nav-link" style="color: #FF0054;"><i class="fa-solid fa-right-from-bracket"></i> <span>Sign Out</span></div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="nav-hitbox auth-trigger" onclick="openAuthModal()">
          <div class="nav-blob"></div>
          <div class="nav-link"><i class="fa-solid fa-key"></i> <span>Sync Board</span></div>
        </div>
      `;
    }
  }

  function initSupabase() {
    const SUPABASE_URL = 'https://epnjfsfveqbvoimpstbd.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_12ymAaNfKTNDknIvcDVdEQ_l7P8jfdr';
    const customStorage = {
      getItem(key) {
        const name = key + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i].trim();
          if (c.indexOf(name) === 0) {
            try {
              return decodeURIComponent(c.substring(name.length));
            } catch (e) {
              return null;
            }
          }
        }
        try { return window.localStorage.getItem(key); } catch (e) { return null; }
      },
      setItem(key, value) {
        const d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        let domain = "";
        if (window.location.hostname.endsWith("things-and-shit.org")) {
          domain = ";domain=.things-and-shit.org";
        }
        const secureFlag = window.location.protocol === 'https:' ? ';Secure' : '';
        document.cookie = key + "=" + encodeURIComponent(value) + ";" + expires + ";path=/" + domain + ";SameSite=Lax" + secureFlag;
        try { window.localStorage.setItem(key, value); } catch (e) {}
      },
      removeItem(key) {
        let domain = "";
        if (window.location.hostname.endsWith("things-and-shit.org")) {
          domain = ";domain=.things-and-shit.org";
        }
        document.cookie = key + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/" + domain;
        try { window.localStorage.removeItem(key); } catch (e) {}
      }
    };

    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: customStorage,
        autoRefreshToken: true,
        persistSession: true
      }
    });

    window.supabase.auth.onAuthStateChange((event, session) => {
      updateAuthUI(session);
      const authEvent = new CustomEvent('supabaseAuthChange', { detail: { session } });
      window.dispatchEvent(authEvent);
    });
  }

  const supabaseScript = document.createElement('script');
  supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  supabaseScript.onload = () => {
    initSupabase();
  };
  document.head.appendChild(supabaseScript);
})();
