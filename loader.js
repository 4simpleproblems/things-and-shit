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

  // Satirical British stereotype quotes
  const quotes = [
    { text: "I've had four cups of tea today and I still haven't reached peak politeness.", author: "A very hydrated Londoner" },
    { text: "It's slightly drizzling, which means it's a perfect day for a 12-mile hike in shorts.", author: "Proper Northern Dad" },
    { text: "I apologized to a lamp post after walking into it. It didn't apologize back. RUDE.", author: "Polite Citizen" },
    { text: "The queue is 40 people long. This is the most exciting thing that's happened all week.", author: "Professional Queuer" },
    { text: "Beans on toast is a culinary masterpiece and I will not hear otherwise.", author: "Student from Birmingham" },
    { text: "I've misplaced my umbrella, so I guess I live under this bus stop now.", author: "Damp Commuter" },
    { text: "Is it 'scone' or 'scone'? Either way, the jam goes on first. Or is it the cream?", author: "Person having a crisis" },
    { text: "I said 'right then' and stood up, but I've been standing here for 10 minutes because I can't actually leave.", author: "Awkward Guest" },
    { text: "It's 18 degrees Celsius. Summer is here. Fetch the sun cream and the emergency fan.", author: "Optimistic Southerner" },
    { text: "I’m not angry, I’m just 'a bit disappointed,' which is actually much worse.", author: "Every British Mum" }
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
