// Authentication Management
class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.checkExistingAuth();
    }

    checkExistingAuth() {
        const auth = localStorage.getItem('hrAuth');
        if (auth) {
            const authData = JSON.parse(auth);
            // Check if session is still valid (24 hours)
            if (Date.now() - authData.timestamp < 24 * 60 * 60 * 1000) {
                this.isAuthenticated = true;
                this.updateUI();
            } else {
                this.logout();
            }
        }
    }

    login(password) {
        const settings = db.getHRSettings();
        if (password === settings.password) {
            this.isAuthenticated = true;
            localStorage.setItem('hrAuth', JSON.stringify({
                loggedIn: true,
                timestamp: Date.now()
            }));
            this.updateUI();
            return true;
        }
        return false;
    }

    logout() {
        this.isAuthenticated = false;
        localStorage.removeItem('hrAuth');
        this.updateUI();
        showSection('analyzer');
    }

    updateUI() {
        const logoutBtn = document.getElementById('logoutBtn');
        const hrTab = document.querySelector('.nav-tab[onclick="requestHRAccess()"]');
        
        if (this.isAuthenticated) {
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (hrTab) {
                hrTab.textContent = 'HR Dashboard';
                hrTab.setAttribute('onclick', "showSection('hr-dashboard')");
            }
        } else {
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (hrTab) {
                hrTab.textContent = 'HR Dashboard';
                hrTab.setAttribute('onclick', "requestHRAccess()");
            }
        }
    }

    changePassword(newPassword) {
        if (this.isAuthenticated) {
            db.updateHRSettings({ password: newPassword });
            return true;
        }
        return false;
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Login modal functions
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'block';
}

function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'none';
}

function requestHRAccess() {
    if (authManager.isAuthenticated) {
        showSection('hr-dashboard');
    } else {
        showLoginModal();
    }
}

// Login form handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.getElementById('hrPassword').value;
            
            if (authManager.login(password)) {
                hideLoginModal();
                showSection('hr-dashboard');
                loginForm.reset();
            } else {
                alert('Invalid password. Please try again.');
            }
        });
    }

    // Close modal when clicking outside
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideLoginModal();
            }
        });
    }
});

// Global logout function
function logout() {
    authManager.logout();
}