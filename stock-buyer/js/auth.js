/**
 * Stock Buyer - Authentication & Saved Login Info Client
 * Manages SQL server communication, user sessions, navbar user section,
 * and saved login credentials.
 */

class AuthManager {
  constructor() {
    this.apiUrl = ["localhost", "127.0.0.1"].includes(window.location.hostname)
      ? "http://localhost:5000/api"
      : null;
    this.serverOnline = false;
    this.currentUser = null;
    this.token = localStorage.getItem("sb_auth_token") || null;

    // LocalStorage fallback user state (for seamless offline demo functionality)
    this.localUserKey = "sb_local_user";
    this.savedCredsKey = "sb_saved_credentials";

    this.init();
  }

  async init() {
    await this.checkServerHealth();
    await this.loadInitialUser();
    this.renderNavbarUserSection();
    this.bindAuthEvents();
  }

  // --- 1. SERVER HEALTH & STATUS ---
  async checkServerHealth() {
    if (!this.apiUrl) {
      this.serverOnline = false;
      this.updateSqlStatusBadge(false);
      return false;
    }

    try {
      const res = await fetch(`${this.apiUrl}/health`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        this.serverOnline = true;
        this.updateSqlStatusBadge(true);
        return true;
      }
    } catch (e) {
      this.serverOnline = false;
      this.updateSqlStatusBadge(false);
      return false;
    }
  }

  updateSqlStatusBadge(isOnline) {
    const badge = document.getElementById("sqlServerStatusBadge");
    if (!badge) return;
    if (isOnline) {
      badge.innerHTML = `<span style="color: #00f0ff;">●</span> SQL Backend Online (localhost:5000)`;
      badge.style.borderColor = "rgba(0, 240, 255, 0.4)";
    } else {
      badge.innerHTML = `<span style="color: #94a3b8;">○</span> Browser-only Demo Mode`;
      badge.style.borderColor = "var(--border-subtle)";
    }
  }

  // --- 2. SESSION & SAVED LOGIN RESTORATION ---
  async loadInitialUser() {
    // If token exists and server online, fetch fresh user from SQL database
    if (this.token && this.serverOnline) {
      try {
        const res = await fetch(`${this.apiUrl}/auth/me`, {
          headers: { "Authorization": `Bearer ${this.token}` }
        });
        const data = await res.json();
        if (data.success && data.user) {
          this.currentUser = data.user;
          return;
        }
      } catch (e) {
        // Fallback to local
      }
    }

    // Check remembered login in local cache
    const saved = localStorage.getItem(this.localUserKey);
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        this.currentUser = null;
      }
    }
  }

  // --- 3. AUTH ACTIONS (REGISTER, LOGIN, UPDATE, LOGOUT) ---
  async register(username, email, password, fullName, avatar, saveLoginInfo) {
    if (this.serverOnline) {
      try {
        const res = await fetch(`${this.apiUrl}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password, fullName, avatar, saveLoginInfo })
        });
        const data = await res.json();
        if (data.success) {
          this.token = data.token;
          this.currentUser = data.user;
          if (saveLoginInfo) {
            localStorage.setItem("sb_auth_token", data.token);
            this.saveRememberedCredentials(email, username);
          }
          localStorage.setItem(this.localUserKey, JSON.stringify(data.user));
          this.renderNavbarUserSection();
          return { success: true, message: data.message };
        } else {
          return { success: false, message: data.message };
        }
      } catch (e) {
        // If server failed mid-request, proceed with local fallback
      }
    }

    // Offline / Local Simulation Mode
    const newUser = {
      id: Math.floor(100 + Math.random() * 900),
      username,
      email,
      fullName: fullName || username,
      avatar: avatar || "👤",
      balance: 100000.00,
      savedLoginInfo: {
        remember_me: !!saveLoginInfo,
        saved_email: email,
        saved_username: username,
        saved_at: new Date().toISOString(),
        mode: "Offline/Local DB"
      },
      createdAt: new Date().toISOString()
    };

    this.currentUser = newUser;
    localStorage.setItem(this.localUserKey, JSON.stringify(newUser));
    if (saveLoginInfo) {
      this.saveRememberedCredentials(email, username);
    }
    this.renderNavbarUserSection();
    return { success: true, message: "Account created successfully (Local Storage Mode)!" };
  }

  async login(loginId, password, saveLoginInfo) {
    if (this.serverOnline) {
      try {
        const res = await fetch(`${this.apiUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login: loginId, password, saveLoginInfo })
        });
        const data = await res.json();
        if (data.success) {
          this.token = data.token;
          this.currentUser = data.user;
          if (saveLoginInfo) {
            localStorage.setItem("sb_auth_token", data.token);
            this.saveRememberedCredentials(data.user.email, data.user.username);
          } else {
            localStorage.removeItem("sb_auth_token");
          }
          localStorage.setItem(this.localUserKey, JSON.stringify(data.user));
          this.renderNavbarUserSection();
          return { success: true, message: data.message };
        } else {
          return { success: false, message: data.message };
        }
      } catch (e) {
        // Server error, fallback to local
      }
    }

    // Local fallback check
    const existing = localStorage.getItem(this.localUserKey);
    if (existing) {
      const user = JSON.parse(existing);
      if (user.email.toLowerCase() === loginId.toLowerCase() || user.username.toLowerCase() === loginId.toLowerCase()) {
        this.currentUser = user;
        if (saveLoginInfo) {
          this.saveRememberedCredentials(user.email, user.username);
        }
        this.renderNavbarUserSection();
        return { success: true, message: `Welcome back, ${user.fullName}!` };
      }
    }

    // Demo default user if matching
    if (loginId.toLowerCase() === "trader@stockbuyer.io" || loginId.toLowerCase() === "alextrader") {
      const demoUser = {
        id: 1,
        username: "AlexTrader",
        email: "trader@stockbuyer.io",
        fullName: "Alex Vance",
        avatar: "⚡",
        balance: 100000.00,
        savedLoginInfo: {
          remember_me: true,
          saved_email: "trader@stockbuyer.io",
          saved_username: "AlexTrader",
          auto_login: true
        },
        createdAt: new Date().toISOString()
      };
      this.currentUser = demoUser;
      localStorage.setItem(this.localUserKey, JSON.stringify(demoUser));
      this.saveRememberedCredentials(demoUser.email, demoUser.username);
      this.renderNavbarUserSection();
      return { success: true, message: "Welcome back, Alex Vance!" };
    }

    return { success: false, message: "Invalid email/username or password. Start the SQL server with 'python server/server.py' for full DB auth." };
  }

  async updateSavedLoginInfo(fullName, avatar, newPassword, autoLogin) {
    const savedInfoPayload = {
      auto_login: !!autoLogin,
      updated_at: new Date().toISOString()
    };

    if (this.serverOnline && this.token) {
      try {
        const res = await fetch(`${this.apiUrl}/auth/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.token}`
          },
          body: JSON.stringify({ fullName, avatar, newPassword, savedLoginInfo: savedInfoPayload })
        });
        const data = await res.json();
        if (data.success) {
          if (this.currentUser) {
            this.currentUser.fullName = fullName;
            this.currentUser.avatar = avatar;
            this.currentUser.savedLoginInfo = { ...this.currentUser.savedLoginInfo, ...savedInfoPayload };
            localStorage.setItem(this.localUserKey, JSON.stringify(this.currentUser));
          }
          this.renderNavbarUserSection();
          return { success: true, message: "Saved login info and SQL credentials updated!" };
        }
      } catch (e) {
        // Fallback
      }
    }

    // Local update
    if (this.currentUser) {
      this.currentUser.fullName = fullName;
      this.currentUser.avatar = avatar;
      this.currentUser.savedLoginInfo = { ...this.currentUser.savedLoginInfo, ...savedInfoPayload };
      localStorage.setItem(this.localUserKey, JSON.stringify(this.currentUser));
      this.renderNavbarUserSection();
      return { success: true, message: "Saved login info updated in local database!" };
    }
    return { success: false, message: "User not logged in." };
  }

  async logout() {
    if (this.serverOnline && this.token) {
      try {
        await fetch(`${this.apiUrl}/auth/logout`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${this.token}` }
        });
      } catch (e) {}
    }

    this.currentUser = null;
    this.token = null;
    localStorage.removeItem("sb_auth_token");
    localStorage.removeItem(this.localUserKey);
    this.renderNavbarUserSection();
  }

  saveRememberedCredentials(email, username) {
    localStorage.setItem(this.savedCredsKey, JSON.stringify({
      email,
      username,
      savedAt: new Date().toISOString()
    }));
  }

  getRememberedCredentials() {
    const creds = localStorage.getItem(this.savedCredsKey);
    if (creds) {
      try { return JSON.parse(creds); } catch (e) {}
    }
    return null;
  }

  // --- 4. NAVBAR USER SECTION RENDERING ---
  renderNavbarUserSection() {
    const container = document.getElementById("navbarUserSection");
    if (!container) return;

    if (!this.currentUser) {
      // User is logged out: Render "Sign In / Join" button
      container.innerHTML = `
        <button class="btn-user-auth" id="btnOpenAuthModal">
          <span>👤</span> Sign In / Save Info
        </button>
      `;

      document.getElementById("btnOpenAuthModal")?.addEventListener("click", () => {
        this.openAuthModal("signin");
      });
    } else {
      // User is logged in: Render User Pill with Avatar & Dropdown Menu
      container.innerHTML = `
        <div class="user-profile-menu-wrap" id="userMenuDropdownWrap">
          <button class="user-profile-btn" id="userProfileDropdownBtn">
            <div class="user-avatar-badge">${this.currentUser.avatar || "👤"}</div>
            <div class="user-meta-block">
              <span class="user-nav-name">${this.currentUser.fullName || this.currentUser.username}</span>
              <span class="user-nav-tag">SQL User #${this.currentUser.id || 1}</span>
            </div>
            <span class="user-dropdown-caret">▼</span>
          </button>

          <!-- Dropdown Menu -->
          <div class="user-dropdown-menu" id="userDropdownMenu">
            <div class="user-dropdown-header">
              <div style="font-weight: 700; color: var(--text-white); font-size: 13px;">${this.currentUser.fullName}</div>
              <div style="font-size: 11px; color: var(--accent-light);">${this.currentUser.email}</div>
              <div style="margin-top: 6px; font-size: 10px; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
                <span>💾</span> Saved in this browser
              </div>
            </div>

            <div class="user-dropdown-items">
              <button class="dropdown-item-btn" id="menuBtnSavedInfo">
                <span>🔐</span> Saved Login Info &amp; Profile
              </button>
              <button class="dropdown-item-btn" id="menuBtnAddDeposit">
                <span>💳</span> Virtual Funds ($100K)
              </button>
              <button class="dropdown-item-btn" id="menuBtnSqlStatus">
                <span>🗄️</span> Database Details
              </button>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item-btn logout" id="menuBtnLogout">
                <span>🚪</span> Sign Out
              </button>
            </div>
          </div>
        </div>
      `;

      // Toggle dropdown menu
      const btn = document.getElementById("userProfileDropdownBtn");
      const menu = document.getElementById("userDropdownMenu");
      btn?.addEventListener("click", (e) => {
        e.stopPropagation();
        menu?.classList.toggle("active");
      });

      document.addEventListener("click", () => {
        menu?.classList.remove("active");
      });

      // Menu actions
      document.getElementById("menuBtnSavedInfo")?.addEventListener("click", () => {
        menu?.classList.remove("active");
        this.openUserProfileModal();
      });

      document.getElementById("menuBtnAddDeposit")?.addEventListener("click", () => {
        menu?.classList.remove("active");
        document.getElementById("btnAddFunds")?.click();
      });

      document.getElementById("menuBtnSqlStatus")?.addEventListener("click", () => {
        menu?.classList.remove("active");
        this.openSqlStatusModal();
      });

      document.getElementById("menuBtnLogout")?.addEventListener("click", () => {
        this.logout();
        if (window.showAppToast) window.showAppToast("Signed out successfully.", "success");
      });
    }
  }

  // --- 5. AUTH MODALS CONTROLLER ---
  openAuthModal(defaultTab = "signin") {
    const overlay = document.getElementById("authModalOverlay");
    if (!overlay) return;

    this.switchAuthTab(defaultTab);
    overlay.classList.add("active");

    // Pre-fill remembered credentials if available
    const remembered = this.getRememberedCredentials();
    if (remembered && remembered.email) {
      const loginInput = document.getElementById("authLoginInput");
      if (loginInput && !loginInput.value) {
        loginInput.value = remembered.email;
        document.getElementById("authRememberMeCheck").checked = true;
      }
    }
  }

  closeAuthModal() {
    document.getElementById("authModalOverlay")?.classList.remove("active");
  }

  switchAuthTab(tab) {
    const tabSignin = document.getElementById("authTabSignin");
    const tabRegister = document.getElementById("authTabRegister");
    const formSignin = document.getElementById("authFormSignin");
    const formRegister = document.getElementById("authFormRegister");

    if (tab === "signin") {
      tabSignin?.classList.add("active");
      tabRegister?.classList.remove("active");
      formSignin.style.display = "flex";
      formRegister.style.display = "none";
    } else {
      tabRegister?.classList.add("active");
      tabSignin?.classList.remove("active");
      formRegister.style.display = "flex";
      formSignin.style.display = "none";
    }
  }

  openUserProfileModal() {
    const overlay = document.getElementById("userProfileModalOverlay");
    if (!overlay || !this.currentUser) return;

    const u = this.currentUser;
    document.getElementById("profFullNameInput").value = u.fullName || "";
    document.getElementById("profUsernameDisplay").textContent = u.username;
    document.getElementById("profEmailDisplay").textContent = u.email;
    document.getElementById("profSqlIdDisplay").textContent = `#${u.id || 1}`;
    document.getElementById("profAutoLoginCheck").checked = u.savedLoginInfo?.auto_login !== false;

    overlay.classList.add("active");
  }

  closeUserProfileModal() {
    document.getElementById("userProfileModalOverlay")?.classList.remove("active");
  }

  openSqlStatusModal() {
    const overlay = document.getElementById("sqlInfoModalOverlay");
    if (!overlay) return;
    overlay.classList.add("active");
  }

  closeSqlStatusModal() {
    document.getElementById("sqlInfoModalOverlay")?.classList.remove("active");
  }

  // --- 6. EVENT BINDINGS ---
  bindAuthEvents() {
    // Auth Modal Tabs
    document.getElementById("authTabSignin")?.addEventListener("click", () => this.switchAuthTab("signin"));
    document.getElementById("authTabRegister")?.addEventListener("click", () => this.switchAuthTab("register"));
    document.getElementById("authModalClose")?.addEventListener("click", () => this.closeAuthModal());
    document.getElementById("authModalOverlay")?.addEventListener("click", (e) => {
      if (e.target.id === "authModalOverlay") this.closeAuthModal();
    });

    // Sign In Submission
    document.getElementById("btnSubmitSignin")?.addEventListener("click", async () => {
      const loginId = document.getElementById("authLoginInput")?.value.trim();
      const password = document.getElementById("authPasswordInput")?.value;
      const remember = document.getElementById("authRememberMeCheck")?.checked;

      if (!loginId || !password) {
        if (window.showAppToast) window.showAppToast("Please enter email/username and password.", "error");
        return;
      }

      const res = await this.login(loginId, password, remember);
      if (res.success) {
        this.closeAuthModal();
        if (window.showAppToast) window.showAppToast(res.message, "success");
      } else {
        if (window.showAppToast) window.showAppToast(res.message, "error");
      }
    });

    // Register Submission
    document.getElementById("btnSubmitRegister")?.addEventListener("click", async () => {
      const fullName = document.getElementById("regFullNameInput")?.value.trim();
      const username = document.getElementById("regUsernameInput")?.value.trim();
      const email = document.getElementById("regEmailInput")?.value.trim();
      const password = document.getElementById("regPasswordInput")?.value;
      const confirmPass = document.getElementById("regConfirmPassInput")?.value;
      const avatar = document.getElementById("regAvatarSelect")?.value || "⚡";
      const saveLoginInfo = document.getElementById("regSaveInfoCheck")?.checked;

      if (!username || !email || !password) {
        if (window.showAppToast) window.showAppToast("Username, email and password are required.", "error");
        return;
      }

      if (password !== confirmPass) {
        if (window.showAppToast) window.showAppToast("Passwords do not match.", "error");
        return;
      }

      const res = await this.register(username, email, password, fullName, avatar, saveLoginInfo);
      if (res.success) {
        this.closeAuthModal();
        if (window.showAppToast) window.showAppToast(res.message, "success");
      } else {
        if (window.showAppToast) window.showAppToast(res.message, "error");
      }
    });

    // Profile & Saved Credentials Update
    document.getElementById("btnSaveProfileChanges")?.addEventListener("click", async () => {
      const newName = document.getElementById("profFullNameInput")?.value.trim();
      const newPass = document.getElementById("profNewPasswordInput")?.value;
      const autoLogin = document.getElementById("profAutoLoginCheck")?.checked;
      const avatar = document.getElementById("profAvatarSelect")?.value || (this.currentUser?.avatar || "⚡");

      const res = await this.updateSavedLoginInfo(newName, avatar, newPass, autoLogin);
      if (res.success) {
        this.closeUserProfileModal();
        if (window.showAppToast) window.showAppToast(res.message, "success");
      } else {
        if (window.showAppToast) window.showAppToast(res.message, "error");
      }
    });

    document.getElementById("userProfileModalClose")?.addEventListener("click", () => this.closeUserProfileModal());
    document.getElementById("userProfileModalOverlay")?.addEventListener("click", (e) => {
      if (e.target.id === "userProfileModalOverlay") this.closeUserProfileModal();
    });

    document.getElementById("sqlInfoModalClose")?.addEventListener("click", () => this.closeSqlStatusModal());
    document.getElementById("sqlInfoModalOverlay")?.addEventListener("click", (e) => {
      if (e.target.id === "sqlInfoModalOverlay") this.closeSqlStatusModal();
    });
  }
}

// Global hook for app.js toasts
window.AuthManager = AuthManager;
