// ===== UNIFIED SIDEBAR =====
function initUnifiedSidebar() {
    // Update all nav links to active state based on current page
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-item').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '/' && href === '/')) {
            link.classList.add('active');
        } else if (currentPath !== '/' && href !== '/' && currentPath.startsWith(href)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ===== LOGO HANDLING =====
function handleLogo() {
    const logos = document.querySelectorAll('.buddy-logo img, .mob-topbar-logo');
    logos.forEach(img => {
        img.onerror = function() {
            this.style.display = 'none';
            const fallback = this.parentElement?.querySelector('.logo-fallback, .mob-topbar-logo-fallback');
            if (fallback) fallback.style.display = 'flex';
        };
    });
}

// ===== MOBILE SIDEBAR =====
function initMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    // Create backdrop if not exists
    let backdrop = document.querySelector('.mob-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'mob-backdrop';
        backdrop.onclick = closeMobileSidebar;
        document.body.appendChild(backdrop);
    }
    
    // Create menu button if not exists
    let menuBtn = document.getElementById('mobMenuBtn');
    if (!menuBtn) {
        menuBtn = document.querySelector('.mob-icon-btn');
    }
    
    if (menuBtn) {
        menuBtn.onclick = openMobileSidebar;
    }
    
    // Close sidebar when nav item is clicked
    document.querySelectorAll('.sidebar .nav-item').forEach(link => {
        link.addEventListener('click', closeMobileSidebar);
    });
}

function openMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.querySelector('.mob-backdrop');
    if (sidebar) sidebar.classList.add('mobile-open');
    if (backdrop) backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.querySelector('.mob-backdrop');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('show');
    document.body.style.overflow = '';
}

// ===== MOBILE DRAWER (Profile Menu) =====
function initMobileDrawer() {
    const drawer = document.getElementById('mobDrawer');
    const backdrop = document.getElementById('mobDrawerBd');
    
    if (!drawer) return;
    
    // Handle swipe to close
    let startY = 0;
    drawer.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    });
    
    drawer.addEventListener('touchend', (e) => {
        const endY = e.changedTouches[0].clientY;
        if (endY - startY > 60) {
            closeMobileDrawer();
        }
    });
}

function openMobileDrawer() {
    const drawer = document.getElementById('mobDrawer');
    const backdrop = document.getElementById('mobDrawerBd');
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('show');
}

function closeMobileDrawer() {
    const drawer = document.getElementById('mobDrawer');
    const backdrop = document.getElementById('mobDrawerBd');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('show');
}

// ===== EXPORT =====
window.initUnifiedSidebar = initUnifiedSidebar;
window.handleLogo = handleLogo;
window.initMobileSidebar = initMobileSidebar;
window.initMobileDrawer = initMobileDrawer;
window.openMobileSidebar = openMobileSidebar;
window.closeMobileSidebar = closeMobileSidebar;
window.openMobileDrawer = openMobileDrawer;
window.closeMobileDrawer = closeMobileDrawer;