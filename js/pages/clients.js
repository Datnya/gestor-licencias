// Clients Page
window.clientsPage = {
  currentFilter: 'all',
  
  render: async () => {
    return `
      <div class="page-content">
        <div class="section-header mb-20">
          <h2 class="section-title">Mis Clientes</h2>
        </div>

        <div class="search-box mb-16">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="inputClientSearch" class="form-input" placeholder="Buscar por nombre o celular...">
        </div>

        <!-- Filter chips -->
        <div class="filter-bar mb-20">
          <div class="filter-chip active" data-filter="all" onclick="window.clientsPage.setFilter('all', this)">Todos</div>
          <div class="filter-chip" data-filter="pending" onclick="window.clientsPage.setFilter('pending', this)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Pago Pendiente
          </div>
          <div class="filter-chip" data-filter="dateRange" onclick="window.clientsPage.showDateFilter()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Filtrar por Fecha
          </div>
        </div>
        
        <div id="clientsList" class="card p-0 overflow-hidden">
          <div class="p-6 text-center text-gray-500">Cargando clientes...</div>
        </div>
      </div>
    `;
  },

  init: async () => {
    await window.clientsPage.renderClients();
    
    let searchTimeout;
    document.getElementById('inputClientSearch').addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        window.clientsPage.renderClients(e.target.value.trim());
      }, 300);
    });
  },

  setFilter: (filter, el) => {
    window.clientsPage.currentFilter = filter;
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    window.clientsPage.renderClients(document.getElementById('inputClientSearch').value.trim());
  },

  showDateFilter: () => {
    window.modal.show({
      title: 'Filtrar por Fecha de Registro',
      content: `
        <div class="form-group">
          <label class="form-label">Desde</label>
          <input type="date" id="filterDateFrom" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">Hasta</label>
          <input type="date" id="filterDateTo" class="form-input" value="${new Date().toISOString().split('T')[0]}">
        </div>
      `,
      confirmText: 'Aplicar Filtro',
      onConfirm: async () => {
        const from = document.getElementById('filterDateFrom').value;
        const to = document.getElementById('filterDateTo').value;
        if (!from) {
          window.toast.error('Error', 'Selecciona la fecha de inicio');
          return true;
        }
        window.clientsPage._dateFrom = from;
        window.clientsPage._dateTo = to;
        window.clientsPage.currentFilter = 'dateRange';
        
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        document.querySelector('.filter-chip[data-filter="dateRange"]').classList.add('active');
        
        await window.clientsPage.renderClients(document.getElementById('inputClientSearch').value.trim());
      }
    });
  },

  renderClients: async (query = '') => {
    const listContainer = document.getElementById('clientsList');
    try {
      let clients = await window.dbAPI.searchClients(query);
      
      // Apply filter
      if (window.clientsPage.currentFilter === 'pending') {
        const filtered = [];
        for (const c of clients) {
          const payments = await window.dbAPI.getPaymentsByClient(c.id);
          if (payments.some(p => !p.paid)) filtered.push(c);
        }
        clients = filtered;
      } else if (window.clientsPage.currentFilter === 'dateRange' && window.clientsPage._dateFrom) {
        const from = new Date(window.clientsPage._dateFrom);
        const to = new Date(window.clientsPage._dateTo + 'T23:59:59');
        clients = clients.filter(c => {
          const d = new Date(c.created_at);
          return d >= from && d <= to;
        });
      }
      
      if (clients.length === 0) {
        listContainer.innerHTML = `
          <div style="text-align:center;padding:40px 20px;color:var(--color-gray-400)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px;height:48px;margin:0 auto 12px"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            <div class="font-semibold mb-4">${query ? 'No hay resultados' : 'No tienes clientes aún'}</div>
            <div class="text-sm">${query ? 'Intenta con otro término' : 'Genera tu primera licencia para agregar un cliente'}</div>
          </div>
        `;
        return;
      }
      
      let html = '';
      for (const c of clients) {
        const payments = await window.dbAPI.getPaymentsByClient(c.id);
        const hasPending = payments.some(p => !p.paid);
        const licenses = await window.dbAPI.getLicensesByClient(c.id);
        
        // Get software names
        let swNames = [];
        for (const l of licenses) {
          const sw = await window.dbAPI.getSoftware(l.software_id);
          if (sw && !swNames.includes(sw.name)) swNames.push(sw.name);
        }
        
        html += `
          <div class="client-card" onclick="window.app.navigate('/client/${c.id}')">
            <div style="display:flex;align-items:center;gap:14px">
              <div class="client-avatar">
                ${c.business_name ? c.business_name.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <div class="font-semibold" style="color:var(--color-gray-900);font-size:0.95rem">${c.business_name}</div>
                <div class="text-xs text-gray-500 mt-4">${c.owner_name || ''}</div>
                <div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap">
                  ${swNames.map(n => `<span class="badge badge-primary" style="font-size:0.65rem;padding:2px 6px">${n}</span>`).join('')}
                </div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              ${hasPending ? '<span class="badge badge-warning" style="font-size:0.65rem">Deuda</span>' : '<span class="badge badge-success" style="font-size:0.65rem">Al día</span>'}
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-300)" stroke-width="2" style="width:18px"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        `;
      }
      listContainer.innerHTML = html;
      
    } catch (e) {
      console.error(e);
      listContainer.innerHTML = `<div class="p-6 text-center text-danger">Error: ${e.message}</div>`;
    }
  }
};
