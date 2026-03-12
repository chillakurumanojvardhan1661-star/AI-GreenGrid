document.addEventListener('DOMContentLoaded', () => {
    console.log('AI GreenGrid Initialized');
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Simple fade-in animation on scroll
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

    // --- AUTH UI SYNC ---
    const userEmail = localStorage.getItem('userEmail');
    const loginBtn = document.getElementById('nav-login-btn');
    const logoutBtn = document.getElementById('nav-logout-btn');
    const citizenStatus = document.getElementById('citizen-portal-status');

    if (userEmail) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) {
            logoutBtn.style.display = 'inline-block';
            logoutBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${userEmail.split('@')[0]} (Logout)`;
        }
        if (citizenStatus) citizenStatus.innerHTML = 'Enter Dashboard <i class="fas fa-arrow-right"></i>';
    }
});

function enterPortal(type) {
    const userRole = localStorage.getItem('userRole');
    if (type === 'citizen') {
        if (userRole === 'user' || userRole === 'admin') {
            window.location.href = 'user/dashboard.html';
        } else {
            window.location.href = 'login.html';
        }
    } else if (type === 'admin') {
        window.location.href = 'admin/dashboard.html';
    }
}
