(function() {
  // Styles for the minimal spinner
  const style = document.createElement('style');
  style.textContent = `
    #loader-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 100000;
      pointer-events: none;
      transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
    }
    #loader-container.hidden {
      opacity: 0;
      transform: scale(0.8) translateY(20px);
    }
    .spinner {
      width: 50px;
      height: 50px;
      background: #FFB703;
      border: 4px solid #1a1a1a;
      border-radius: 15px; /* Matches sidebar highlights */
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 4px 4px 0px #1a1a1a;
      animation: spin-and-pulse 1.5s infinite cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    .spinner i {
      font-size: 20px;
      color: #1a1a1a;
    }
    @keyframes spin-and-pulse {
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.1); }
      100% { transform: rotate(360deg) scale(1); }
    }
  `;
  document.head.appendChild(style);

  // HTML structure
  const loaderHTML = `
    <div id="loader-container">
      <div class="spinner">
        <i class="fa-solid fa-spinner"></i>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('afterbegin', loaderHTML);

  // Loading Logic
  const assets = [
    ...Array.from(document.querySelectorAll('img')).map(img => img.src),
    ...Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => link.href)
  ];

  let loadedCount = 0;
  const totalAssets = assets.length || 1;
  const startTime = Date.now();
  const minTime = 1200; // Keep it visible for at least 1.2s for the "vibe"

  function updateProgress() {
    loadedCount++;
    if (loadedCount >= totalAssets) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minTime - elapsed);
      setTimeout(hideLoader, remaining);
    }
  }

  function hideLoader() {
    const loader = document.getElementById('loader-container');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 600);
    }
  }

  if (assets.length === 0) {
    setTimeout(hideLoader, minTime);
  } else {
    assets.forEach(url => {
      const img = new Image();
      img.onload = updateProgress;
      img.onerror = updateProgress;
      img.src = url;
    });
  }

  // Safety timeout
  setTimeout(hideLoader, 5000);

})();
