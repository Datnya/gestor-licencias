// App Router and Initialization

window.app = {
  currentPage: null,
  
  init: async () => {
    console.log("Gestor de Licencias - Iniciando...");
    
    // Check GitHub Connection status
    await app.checkConnection();
    
    // Hide loading screen
    document.getElementById('appLoading').style.display = 'none';
    
    // Set up routing
    window.addEventListener('hashchange', app.handleRoute);
    
    // Handle initial route
    if (!window.location.hash) {
      window.location.hash = '#/';
    } else {
      app.handleRoute();
    }
  },
  
  checkConnection: async () => {
    const indicator = document.getElementById('connectionStatus');
    const text = indicator.querySelector('.status-text');
    
    if (!window.githubAPI.hasToken()) {
      indicator.className = 'status-indicator offline';
      text.textContent = 'Sin Token';
      return false;
    }
    
    indicator.className = 'status-indicator syncing';
    text.textContent = 'Verificando...';
    
    try {
      // Validate token by calling the authenticated user endpoint
      const token = window.githubAPI.getToken();
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (!response.ok) throw new Error('Token inválido');
      
      indicator.className = 'status-indicator online';
      text.textContent = 'Conectado a GitHub';
      return true;
    } catch (e) {
      indicator.className = 'status-indicator offline';
      text.textContent = 'Error de conexión';
      return false;
    }
  },

  navigate: (path) => {
    window.location.hash = '#' + path;
  },
  
  handleRoute: async () => {
    let hash = window.location.hash.substring(1) || '/';
    const mainContent = document.getElementById('mainContent');
    
    // Parse route and params
    let route = hash;
    let id = null;
    if (hash.startsWith('/client/')) {
      route = '/client-detail';
      id = parseInt(hash.split('/')[2]);
    }

    // Update bottom nav active state
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    let tabId = 'dashboard';
    if (route === '/clients' || route === '/client-detail') tabId = 'clients';
    else if (route === '/new') tabId = 'new';
    else if (route === '/projects') tabId = 'projects';
    else if (route === '/settings') tabId = 'settings';
    
    const activeTab = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (activeTab) activeTab.classList.add('active');

    // Remove current page if exists
    const currentEl = document.querySelector('.page.active');
    if (currentEl) currentEl.remove();

    // Render new page
    const pageEl = document.createElement('div');
    pageEl.className = 'page active';
    
    try {
      if (route === '/') {
        pageEl.innerHTML = await window.dashboardPage.render();
        mainContent.appendChild(pageEl);
        if (window.dashboardPage.init) await window.dashboardPage.init();
      } 
      else if (route === '/new') {
        pageEl.innerHTML = await window.newLicensePage.render();
        mainContent.appendChild(pageEl);
        if (window.newLicensePage.init) await window.newLicensePage.init();
      }
      else if (route === '/clients') {
        pageEl.innerHTML = await window.clientsPage.render();
        mainContent.appendChild(pageEl);
        if (window.clientsPage.init) await window.clientsPage.init();
      }
      else if (route === '/client-detail') {
        pageEl.innerHTML = await window.clientDetailPage.render(id);
        mainContent.appendChild(pageEl);
        if (window.clientDetailPage.init) await window.clientDetailPage.init(id);
      }
      else if (route === '/settings') {
        pageEl.innerHTML = await window.settingsPage.render();
        mainContent.appendChild(pageEl);
        if (window.settingsPage.init) await window.settingsPage.init();
      }
      else if (route === '/projects') {
        pageEl.innerHTML = await window.projectsPage.render();
        mainContent.appendChild(pageEl);
        if (window.projectsPage.init) await window.projectsPage.init();
      }
      
      // Update page title
      let title = "Gestor Licencias";
      if (route === '/new') title = "Nueva Licencia";
      else if (route === '/clients') title = "Mis Clientes";
      else if (route === '/client-detail') title = "Detalle del Cliente";
      else if (route === '/projects') title = "Proyectos";
      else if (route === '/settings') title = "Configuración";
      
      const titleEl = document.getElementById('appTitle');
      if (titleEl) titleEl.textContent = title;
      
    } catch (e) {
      console.error(e);
      pageEl.innerHTML = `<div class="p-4 text-center text-danger">Error cargando página: ${e.message}</div>`;
      mainContent.appendChild(pageEl);
    }
  }
};

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if Dexie is ready
  if (typeof Dexie !== 'undefined') {
    app.init();
  } else {
    // Retry after 500ms if library hasn't loaded
    setTimeout(() => app.init(), 500);
  }
});
