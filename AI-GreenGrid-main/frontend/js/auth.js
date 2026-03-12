// [Stage 2+] Transitioning to Backend API for Auth
const API_BASE = 'http://localhost:3000/api';

async function login(email, password, gate) {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, gate })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userEmail', data.email);
            
            const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html');
            let redirectPath = '';
            
            if (data.role === 'admin') {
                redirectPath = isAuthPage ? 'admin/dashboard.html' : 'dashboard.html';
            } else {
                redirectPath = isAuthPage ? 'user/dashboard.html' : 'dashboard.html';
            }

            return { success: true, redirect: redirectPath };
        } else {
            // [Fallback] Support legacy demo "auto-login" if server says no but gate isn't department
            if (gate !== 'department' && email.length > 0 && password.length > 0) {
                await signup(email, password, 'user'); // Try to create
                return await login(email, password, gate); // Retry login
            }
            return { success: false, message: data.error || 'Authentication failed' };
        }
    } catch (e) {
        return { success: false, message: 'Server unreachable. Ensure node server.js is running.' };
    }
}

async function signup(email, password, role = 'user') {
    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
        });
        return { success: response.ok };
    } catch (e) { return { success: false }; }
}

function logout() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    const path = window.location.pathname;
    const isInsideSubfolder = path.includes('/admin/') || path.includes('/user/');
    window.location.href = isInsideSubfolder ? '../index.html' : 'index.html';
}

function checkAuth(requiredRole) {
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    
    // Required authentication only for citizen portal (/user/)
    const isCitizenPortal = window.location.pathname.includes('/user/');
    
    if (isCitizenPortal && (!role || !email)) {
        console.warn('Unauthorized access to Citizen Portal. Redirecting to login.');
        const isInsideSubfolder = window.location.pathname.includes('/user/');
        window.location.href = isInsideSubfolder ? '../login.html' : 'login.html';
        return;
    }

    if (requiredRole && role && role !== requiredRole) {
        console.warn('Role mismatch. Target:', requiredRole, 'Actual:', role);
        // Not forcing redirect for admin yet as per user request (Admin portal is open)
    }

    console.log('Auth check passed (or optional) for:', requiredRole);
}

// Helper to seed initial admin if server is fresh
async function seedAdmin() {
    await signup('admin@greengrid.ai', 'admin123', 'admin');
}
seedAdmin();
