// Clients Page
window.clientsPage = {
  render: async () => {
    return `
      <div class="page-content">
        <div class="flex justify-between items-center mb-6">
          <h2 class="font-bold text-xl">Mis Clientes</h2>
          <button class="btn btn-primary btn-sm" style="width:auto" onclick="window.app.navigate('/new')">+ Nuevo</button>
        </div>
        
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="inputClientSearch" class="form-input" placeholder="Buscar por nombre o celular...">
        </div>
        
        <div id="clientsList" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 text-center text-gray-500">Cargando clientes...</div>
        </div>
      </div>
    `;
  },

  init: async () => {
    const renderClients = async (query = '') => {
      const listContainer = document.getElementById('clientsList');
      try {
        const clients = await window.dbAPI.searchClients(query);
        
        if (clients.length === 0) {
          listContainer.innerHTML = window.ui.renderEmptyState(
            query ? "No hay resultados" : "No tienes clientes aún", 
            query ? "Intenta con otro término de búsqueda" : "Crea tu primera licencia para agregar un cliente"
          );
          return;
        }
        
        let html = '';
        for (const c of clients) {
          // Check if has pending payments
          const pending = await window.dbAPI.getPaymentsByClient(c.id);
          const hasPending = pending.some(p => !p.paid);
          
          html += `
            <div class="client-card" onclick="window.app.navigate('/client/${c.id}')" style="cursor:pointer">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-lg">
                  ${c.business_name ? c.business_name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <div class="font-semibold text-gray-900">${c.business_name}</div>
                  <div class="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    ${c.phone || 'Sin teléfono'}
                  </div>
                </div>
              </div>
              <div>
                ${hasPending ? '<span class="badge badge-warning">Deuda</span>' : '<span class="badge badge-success">Al día</span>'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" class="text-gray-400 ml-2" style="display:inline-block; vertical-align:middle"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
            </div>
          `;
        }
        listContainer.innerHTML = html;
        
      } catch (e) {
        console.error(e);
        listContainer.innerHTML = `<div class="p-6 text-center text-danger">Error: ${e.message}</div>`;
      }
    };
    
    // Initial render
    await renderClients();
    
    // Setup search
    let searchTimeout;
    document.getElementById('inputClientSearch').addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        renderClients(e.target.value.trim());
      }, 300);
    });
  }
};
