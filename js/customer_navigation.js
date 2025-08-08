// ===================== CUSTOMER NAVIGATION UTILITIES =====================
// Common navigation functionality for customer pages

class CustomerNavigation {
  constructor() {
    this.API_BASE_URL = 'http://localhost:8001';
    this.token = localStorage.getItem('access_token');
    this.currentPage = this.getCurrentPage();
  }

  // Get current page name from URL
  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);
    return page.replace('.html', '');
  }

  // Get navigation HTML template
  getNavigationHTML() {
    return `
    <!-- ===================== CUSTOMER NAVIGATION BAR ===================== -->
    <header>
      <nav class="navbar navbar-expand-lg navbar-dark">
        <div class="container-fluid">
          <!-- Brand -->
          <a class="navbar-brand fw-bold me-3 d-flex flex-column align-items-start p-0" href="customer_dashboard.html">
            <span>MapleMesh</span>
            <span>AutoRepair</span>
          </a>

          <!-- Left-side Navigation Links -->
          <div class="navbar-nav d-none d-lg-flex me-auto">
            <a class="nav-link fw-bold" href="customer_dashboard.html" id="nav-dashboard">Dashboard</a>
            <a class="nav-link fw-bold" href="customer_service.html" id="nav-service">Service</a>
            <a class="nav-link fw-bold" href="customer_billing.html" id="nav-billing">Billing</a>
          </div>

          <!-- Welcome Message (Center) -->
          <div class="navbar-text d-none d-lg-block mx-auto text-center text-white">
            <h4 class="mb-0 fw-bold">Welcome Back!</h4>
            <small>Your Trusted Auto Service Partner</small>
          </div>

          <!-- Right-side Navigation Links -->
          <div class="collapse navbar-collapse flex-grow-0" id="mainNavbar">
            <ul class="navbar-nav align-items-center">
              <li class="nav-item dropdown hover-dropdown">
                <a class="nav-link fw-bold" href="customer_profile.html" id="profileLink">Profile</a>
                <div class="dropdown-menu dropdown-menu-end" aria-labelledby="profileLink" style="background-color:#041B15; min-width:12rem;">
                  <a class="dropdown-item text-white d-flex align-items-center" href="#" id="help-support-link">
                    <i class="fas fa-question-circle me-2 text-primary"></i>Help & Support
                  </a>
                  <div class="dropdown-divider" style="border-color: rgba(255,255,255,0.15)"></div>
                  <a class="dropdown-item text-white d-flex align-items-center" href="#" id="sign-out-btn">
                    <i class="fas fa-sign-out-alt me-2 text-danger"></i>Sign Out
                  </a>
                </div>
              </li>
            </ul>
          </div>

          <!-- Mobile Toggle Button -->
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" 
                  data-bs-target="#mainNavbar" aria-controls="mainNavbar" 
                  aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
        </div>
      </nav>
    </header>
    <!-- ===================== END CUSTOMER NAVIGATION BAR ===================== -->
    `;
  }

  // Load navigation bar
  loadNavigation() {
    try {
      const navHTML = this.getNavigationHTML();
      
      // Insert navigation at the beginning of body
      const body = document.body;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = navHTML;
      
      // Insert the header element
      const header = tempDiv.querySelector('header');
      if (header) {
        body.insertBefore(header, body.firstChild);
      }
      
      // Initialize navigation after loading
      this.initializeNavigation();
      
    } catch (error) {
      console.error('Error loading navigation:', error);
    }
  }

  // Initialize navigation functionality
  initializeNavigation() {
    // Set active navigation link
    this.setActiveNavLink();
    
    // Load user profile data for navigation
    this.loadUserProfileForNav();
    
    // Setup sign out functionality
    this.setupSignOut();

    // Setup hover behavior for dropdown
    this.setupHoverDropdown();
  }

  // Set active navigation link based on current page
  setActiveNavLink() {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      // Remove any existing active classes
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });

      // Add active class to current page
      let activeNavId = '';
      switch (this.currentPage) {
        case 'customer_dashboard':
          activeNavId = 'nav-dashboard';
          break;
        case 'customer_service':
          activeNavId = 'nav-service';
          break;
        case 'customer_billing':
          activeNavId = 'nav-billing';
          break;
        case 'customer_profile':
          activeNavId = 'profileLink';
          break;
      }

      if (activeNavId) {
        const activeLink = document.getElementById(activeNavId);
        if (activeLink) {
          activeLink.classList.add('active');
        }
      }
    }, 100);
  }

  // Load user profile data for navigation dropdown
  async loadUserProfileForNav() {
    if (!this.token) {
      window.location.href = 'sign-in.html';
      return;
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/api/customer/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
        window.location.href = 'sign-in.html';
        return;
      }

      if (response.ok) {
        const profile = await response.json();
        
        // Update navigation name on the dropdown trigger
        setTimeout(() => {
          const profileLink = document.getElementById('profileLink');
          if (profileLink) {
            profileLink.textContent = profile.first_name || 'Profile';
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error loading profile for navigation:', error);
    }
  }

  // Setup sign out functionality
  setupSignOut() {
    // Add delay to ensure navigation is loaded
    setTimeout(() => {
      const signOutBtn = document.getElementById('sign-out-btn');
      if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (confirm('Are you sure you want to sign out?')) {
            const toastId = window.statusNotify ? statusNotify.loading('Signing out...', { title: 'Please wait' }) : null;
            // Remove authentication data
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_info');
            if (toastId) {
              statusNotify.update(toastId, 'Signed out', 'success');
              setTimeout(() => { window.location.href = 'sign-in.html'; }, 600);
            } else if (typeof showAlert === 'function') {
              showAlert('Signing out...', 'info');
              setTimeout(() => { window.location.href = 'sign-in.html'; }, 1000);
            } else {
              window.location.href = 'sign-in.html';
            }
          }
        });
      }

      // Optional: Help & Support click handler (placeholder)
      const helpLink = document.getElementById('help-support-link');
      if (helpLink) {
        helpLink.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.statusNotify) {
            statusNotify.info('Help & Support coming soon');
          }
        });
      }
    }, 100);
  }

  // Show dropdown on hover while keeping link navigation on click
  setupHoverDropdown() {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const dropdown = document.querySelector('.nav-item.dropdown.hover-dropdown');
      const menu = dropdown ? dropdown.querySelector('.dropdown-menu') : null;
      const trigger = dropdown ? dropdown.querySelector('#profileLink') : null;
      if (!dropdown || !menu || !trigger) return;

      let hoverTimeout;

      const showMenu = () => {
        clearTimeout(hoverTimeout);
        dropdown.classList.add('show');
        menu.classList.add('show');
        // Positioning compatibility
        menu.setAttribute('data-bs-popper', 'none');
      };

      const hideMenu = () => {
        hoverTimeout = setTimeout(() => {
          dropdown.classList.remove('show');
          menu.classList.remove('show');
          menu.removeAttribute('data-bs-popper');
        }, 150);
      };

      dropdown.addEventListener('mouseenter', showMenu);
      dropdown.addEventListener('mouseleave', hideMenu);
      // Keep menu open when hovering over it directly
      menu.addEventListener('mouseenter', showMenu);
      menu.addEventListener('mouseleave', hideMenu);
    }, 100);
  }

  // Check authentication status
  checkAuth() {
    if (!this.token) {
      window.location.href = 'sign-in.html';
      return false;
    }
    return true;
  }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const customerNav = new CustomerNavigation();
  
  // Check authentication first
  if (customerNav.checkAuth()) {
    // Load navigation
    customerNav.loadNavigation();
  }
});

// Export for use in other scripts
window.CustomerNavigation = CustomerNavigation;
