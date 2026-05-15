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

  // Satirical global stereotype quotes
  const quotes = [
    { text: "I've had four cups of tea today and I still haven't reached peak politeness.", author: "A very hydrated Londoner" },
    { text: "I ordered a 'small' soda and they handed me a gallon bucket. God bless the USA.", author: "Tourist in Texas" },
    { text: "I'm 5 minutes early, which in my culture means I'm 10 minutes late.", author: "Stressed German Engineer" },
    { text: "The baguette wasn't crunchy enough, so I've decided to go on strike for the afternoon.", author: "French Revolutionary" },
    { text: "I apologized to a lamp post after walking into it. It didn't apologize back. RUDE.", author: "Polite Citizen" },
    { text: "I put maple syrup on my maple syrup. It's the only way to feel anything anymore.", author: "Canadian Lumberjack" },
    { text: "It's 18 degrees Celsius. Summer is here. Fetch the sun cream and the emergency fan.", author: "Optimistic Southerner" },
    { text: "I told my mum I wasn't hungry, and she took it as a personal declaration of war.", author: "Every Italian Son" },
    { text: "The queue is 40 people long. This is the most exciting thing that's happened all week.", author: "Professional Queuer" },
    { text: "I survived a 100mph sandstorm just to get a specific brand of hummus.", author: "Dubai Local" },
    { text: "I saw a spider the size of a dinner plate and just invited him for dinner. He's my roommate now.", author: "Average Australian" },
    { text: "I spent $200 on a 'minimalist' wallet that holds exactly two cards and no hope.", author: "Silicon Valley Tech Bro" }
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
