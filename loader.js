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
      transition: width 0.3s ease;
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

  // Random quotes by completely random people
  const quotes = [
    { text: "I once ate a whole lemon just to see what would happen. Nothing happened.", author: "Gary from the bus stop" },
    { text: "If you walk backwards long enough, you eventually end up where you started, but tired.", author: "A guy named Kevin" },
    { text: "My microwave makes a noise like a dying seagull, but it still heats the soup.", author: "Brenda, 2nd floor" },
    { text: "Sometimes I forget why I walked into a room, so I just stand there to assert dominance.", author: "Local Skater" },
    { text: "The sky isn't actually blue, it's just reflecting my mood on a good Tuesday.", author: "A very confused toddler" },
    { text: "I found a dollar in a dryer once. It was the peak of my financial career.", author: "Dave (unemployed)" },
    { text: "If cats could talk, they wouldn't. They'd just judge your outfit in silence.", author: "The lady with 12 cats" },
    { text: "I've never been to space, but I did fall off a very tall ladder once. Same vibe.", author: "My Uncle Terry" },
    { text: "Coffee is just bean water that makes the heart go fast. I love bean water.", author: "Barista at the airport" },
    { text: "I thought I saw a ghost, but it was just my own reflection in a very clean window.", author: "Anxious Greg" }
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

  // Asset Loading Logic
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
    if (progressElement) progressElement.style.width = progress + '%';
    
    if (loadedCount >= totalAssets) {
      setTimeout(hideLoader, 500);
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
