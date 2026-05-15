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

  // Stupid Tech Tips (and one Canadian)
  const quotes = [
    { text: "If your computer is running slow, try giving it a small piece of cheese as a reward.", author: "IT Support (Level 0)" },
    { text: "I put maple syrup on my maple syrup. It's the only way to feel anything anymore.", author: "Canadian Lumberjack" },
    { text: "Downloading more RAM is the only way to truly ascend to the digital plane.", author: "Chrome User" },
    { text: "If you lose a file, just scream the filename into the cooling fan. It might hear you.", author: "Data Recovery Specialist" },
    { text: "To increase your internet speed, simply paint your router red. Red things go faster.", author: "Pro Gamer" },
    { text: "I tried to cloud compute, but I just ended up staring at a very overcast Tuesday.", author: "Anxious Web Dev" },
    { text: "If your keyboard stops working, try typing 'PLEASE' very, very softly.", author: "Mechanical Keyboard Enthusiast" },
    { text: "Turning it off and on again is basically just a tiny reincarnation for your laptop.", author: "Digital Shaman" },
    { text: "I replaced my mouse with a real one. It was very efficient until it ate the power cable.", author: "Hardware Optimizer" },
    { text: "My password is 'password' but written in invisible ink on the back of my monitor.", author: "Security Architect" },
    { text: "Bluetooth is just magic that only works when you aren't looking directly at it.", author: "Connectivity Expert" },
    { text: "If you run out of storage space, just delete the 'Internet' folder to start fresh.", author: "Efficiency Expert" }
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
