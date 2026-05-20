(function() {
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
})();
