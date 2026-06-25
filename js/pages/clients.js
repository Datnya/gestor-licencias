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

        <div class="flex gap-2 mb-20">
          <select id="clientFilterSelect" class="form-select flex-1" onchange="window.clientsPage.handleFilterChange(this.value)">
            <option value="all">Todos los clientes</option>
            <option value="pending">Pago Pendiente</option>
            <option value="newest">Más recientes primero</option>
            <option value="oldest">Más antiguos primero</option>
            <option value="dateRange">Filtrar por rango de fechas...</option>
          </select>
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

  handleFilterChange: (val) => {
    if (val === 'dateRange') {
      window.clientsPage.showDateFilter();
    } else {
      window.clientsPage.currentFilter = val;
      window.clientsPage.renderClients(document.getElementById('inputClientSearch').value.trim());
    }
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
          document.getElementById('clientFilterSelect').value = 'all';
          return true;
        }
        window.clientsPage._dateFrom = from;
        window.clientsPage._dateTo = to;
        window.clientsPage.currentFilter = 'dateRange';
        
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
      } else if (window.clientsPage.currentFilter === 'newest') {
        clients = clients.sort((a,b) => {
          const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
          const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
          return (isNaN(tB) ? 0 : tB) - (isNaN(tA) ? 0 : tA);
        });
      } else if (window.clientsPage.currentFilter === 'oldest') {
        clients = clients.sort((a,b) => {
          const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
          const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
          return (isNaN(tA) ? 0 : tA) - (isNaN(tB) ? 0 : tB);
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
          <div class="client-card" style="padding:12px 14px;display:flex;flex-direction:column;gap:3px">
            <div style="font-weight:700;color:var(--color-gray-900);font-size:0.95rem">${c.business_name}</div>
            <div style="font-size:0.8rem;color:var(--color-gray-500)">${c.owner_name || ''}</div>
            <div style="font-size:0.75rem;color:var(--color-gray-400)">Suscrito: ${window.format?.date ? window.format.date(c.created_at) : (c.created_at || '-')}</div>
            <div style="margin-top:4px">
              ${swNames.map(n => `<span style="display:inline-block;color:#f97316;font-size:0.8rem;font-weight:800;margin-right:4px">${n}</span>`).join('')}
            </div>
            <div style="text-align:center;margin-top:12px">
              <button class="btn btn-primary" style="padding:8px 30px;font-size:0.85rem;border-radius:8px;width:100%" onclick="event.stopPropagation(); window.app.navigate('/client/${c.id}')">Ver detalles</button>
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
