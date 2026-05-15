(function() {
  // Styles for the loader
  const style = document.createElement('style');
  style.textContent = `
    #loader-overlay {
      position: fixed;
      inset: 0;
      background: #ffffff;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      transition: opacity 0.6s cubic-bezier(0.19, 1, 0.22, 1);
    }
    #loader-overlay.hidden {
      opacity: 0;
      pointer-events: none;
    }
    .loader-content {
      width: 100%;
      max-width: 500px;
      text-align: center;
    }
    .loader-title {
      font-family: 'Alfa Slab One', serif;
      font-size: 32px;
      margin-bottom: 20px;
      color: #1a1a1a;
    }
    .loader-bar-container {
      width: 100%;
      height: 12px;
      background: #f0f0f0;
      border: 3px solid #1a1a1a;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 30px;
    }
    #loader-progress {
      height: 100%;
      width: 0%;
      background: #FFB703;
      transition: width 1.2s ease-in-out;
    }
    .loader-quote {
      font-weight: 800;
      font-size: 16px;
      color: #666;
      line-height: 1.5;
      min-height: 50px;
    }
    .loader-author {
      font-family: 'Alfa Slab One', serif;
      font-size: 12px;
      color: #ccc;
      margin-top: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  `;
  document.head.appendChild(style);

  // Harsher Stupid Tech Tips & Dark Humor
  const quotes = [
    { text: "I put maple syrup on my maple syrup. It's the only way to feel anything anymore.", author: "Canadian Lumberjack" },
    { text: "If the server starts smoking, just ignore it. It's probably just entering puberty.", author: "Dead-eyed SysAdmin" },
    { text: "I deleted the production database because the silence was the only thing I could control.", author: "Ex-Employee" },
    { text: "If your code is failing, it's not a bug. The computer just doesn't like you personally.", author: "Sentient Compiler" },
    { text: "I replaced my social life with an RGB keyboard. Now I can be lonely in 16.8 million colors.", author: "Gamer with no regrets" },
    { text: "Your data isn't in the 'cloud.' It's just on someone else's computer in a room that smells like ozone and despair.", author: "The Architect" },
    { text: "I tried to 'debug' my life, but I realized the source code was written in a language I don't speak.", author: "Burnt-out Senior Dev" },
    { text: "If your fan is too loud, just pour some water on it. It'll never make a sound again. Problem solved.", author: "Aggressive IT Support" },
    { text: "I spent 4 hours automating a task that takes 30 seconds. I am a god of efficiency.", author: "Average Script Writer" },
    { text: "Privacy is a myth we tell ourselves so we don't have to acknowledge that a fridge knows our search history.", author: "Cyber Security Realist" },
    { text: "I told the printer I loved it. It still jammed. Love is a lie, but 404 errors are forever.", author: "Heartbroken Office Worker" },
    { text: "If you're ever feeling useful, just remember that someone is paid to write 'Terms and Conditions' that no one reads.", author: "Legal Intern" }
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  // HTML structure
  const loaderHTML = `
    <div id="loader-overlay">
      <div class="loader-content">
        <div class="loader-title">things and s***.</div>
        <div class="loader-bar-container">
          <div id="loader-progress"></div>
        </div>
        <div class="loader-quote">"${randomQuote.text}"</div>
        <div class="loader-author">— ${randomQuote.author}</div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('afterbegin', loaderHTML);

  // Asset Loading Logic with Minimum Time (so they can read the quote)
  const startTime = Date.now();
  const minDisplayTime = 3800; // 3.8 seconds minimum
  
  const assets = [
    ...Array.from(document.querySelectorAll('img')).map(img => img.src),
    ...Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => link.href)
  ];

  let loadedCount = 0;
  const totalAssets = assets.length || 1;
  const progressElement = document.getElementById('loader-progress');

  function updateProgress() {
    loadedCount++;
    const progress = (loadedCount / totalAssets) * 100;
    
    // Smooth progress even if it loads fast
    if (progressElement) progressElement.style.width = progress + '%';
    
    if (loadedCount >= totalAssets) {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
      setTimeout(hideLoader, remainingTime);
    }
  }

  function hideLoader() {
    const loader = document.getElementById('loader-overlay');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 600);
    }
  }

  if (assets.length === 0) {
    // No assets to track, just fake it for a moment for the vibe
    let fakeProgress = 0;
    const interval = setInterval(() => {
      fakeProgress += 10;
      if (progressElement) progressElement.style.width = fakeProgress + '%';
      if (fakeProgress >= 100) {
        clearInterval(interval);
        setTimeout(hideLoader, 400);
      }
    }, 100);
  } else {
    assets.forEach(url => {
      const img = new Image();
      img.onload = updateProgress;
      img.onerror = updateProgress;
      img.src = url;
    });
  }

  // Fallback timeout in case something hangs
  setTimeout(hideLoader, 5000);

})();
