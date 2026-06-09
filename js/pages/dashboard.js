// Dashboard Page
window.dashboardPage = {
  render: async () => {
    return `
      <div class="page-content">
        <!-- CTA Button -->
        <button class="cta-button mb-28" onclick="window.app.navigate('/new')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Generar Nueva Licencia
        </button>

        <!-- Stats Section -->
        <div class="section-header">
          <h2 class="section-title">Resumen General</h2>
        </div>
        <p class="text-sm text-gray-500 mb-20">Estadísticas de tus licencias vendidas</p>
        
        <div class="stats-grid" id="dashStatsGrid">
          <div class="stat-card-v2">
            <div class="stat-icon-mini" style="background:var(--color-primary-100);color:var(--color-primary-600)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <div class="stat-number" id="dashTotalActive">-</div>
            <div class="stat-label">Licencias Activas</div>
          </div>
          <div class="stat-card-v2">
            <div class="stat-icon-mini" style="background:var(--color-warning-light);color:var(--color-warning)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <div class="stat-number" id="dashPendingPayments">-</div>
            <div class="stat-label">Pagos Pendientes</div>
          </div>
        </div>

        <!-- Software breakdown -->
        <div id="dashSoftwareBreakdown" class="mb-28"></div>

        <!-- Alerts Section -->
        <div class="section-header mb-16">
          <h2 class="section-title">Alertas y Recordatorios</h2>
          <span class="badge badge-warning" id="dashAlertCount" style="font-size:0.75rem;padding:4px 10px">0</span>
        </div>
        <div id="dashAlertsList">
          <div class="text-center text-sm text-gray-400 py-4">Cargando...</div>
        </div>
      </div>
    `;
  },

  init: async () => {
    try {
      const stats = await window.dbAPI.getDashboardStats();
      
      document.getElementById('dashTotalActive').textContent = stats.totalActive;
      document.getElementById('dashPendingPayments').textContent = stats.pendingCount;
      
      // Software breakdown
      const swContainer = document.getElementById('dashSoftwareBreakdown');
      const entries = Object.entries(stats.softwareCounts);
      if (entries.length > 0) {
        let swHtml = '';
        for (const [name, count] of entries) {
          swHtml += `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 16px;background:var(--color-white);border-radius:var(--radius-md);border:1px solid var(--color-gray-100);margin-bottom:8px">
              <span class="text-sm font-semibold" style="color:var(--color-gray-700)">${name}</span>
              <span class="badge badge-primary" style="font-size:0.75rem">${count} licencia${count !== 1 ? 's' : ''}</span>
            </div>
          `;
        }
        swContainer.innerHTML = swHtml;
      }

      // Alerts
      const alertsContainer = document.getElementById('dashAlertsList');
      const alertsCount = document.getElementById('dashAlertCount');
      let alertsHtml = '';
      let totalAlerts = 0;
      
      if (!window.githubAPI.hasToken()) {
        alertsHtml += `
          <div class="alert-card overdue" style="flex-direction:column;align-items:flex-start;gap:8px">
            <div class="font-semibold" style="color:var(--color-danger)">⚠ Falta Configuración</div>
            <div class="text-sm text-gray-500">Debes configurar tu Token de GitHub en Ajustes para empezar.</div>
            <button class="btn btn-outline btn-sm mt-8" style="width:auto" onclick="window.app.navigate('/settings')">Ir a Ajustes</button>
          </div>
        `;
        totalAlerts++;
      }
      
      // Pending Payments
      if (stats.pendingPayments && stats.pendingPayments.length > 0) {
        for (const p of stats.pendingPayments.slice(0, 5)) {
          const client = await window.dbAPI.getClient(p.client_id);
          const isOverdue = new Date(p.due_date) < new Date();
          
          alertsHtml += `
            <div class="alert-card ${isOverdue ? 'overdue' : ''}">
              <div>
                <div class="font-semibold text-sm">${client ? client.business_name : 'Desconocido'}</div>
                <div class="text-xs text-gray-500 mt-4">${p.concept}</div>
                <div class="text-xs ${isOverdue ? 'text-danger font-bold' : 'text-gray-400'} mt-4">Vence: ${window.format.date(p.due_date)}</div>
              </div>
              <div class="font-bold" style="font-size:0.95rem">${p.currency === 'USD' ? '$' : 'S/'}${parseFloat(p.amount).toFixed(2)}</div>
            </div>
          `;
          totalAlerts++;
        }
      }
      
      if (totalAlerts === 0) {
        alertsHtml = `
          <div class="alert-card ok" style="flex-direction:column;gap:8px;padding:28px">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2" style="width:36px;height:36px">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div class="font-semibold" style="color:var(--color-success)">¡Todo al día!</div>
            <div class="text-sm text-gray-500">No tienes pagos pendientes ni licencias por vencer.</div>
          </div>
        `;
      }
      
      alertsCount.textContent = totalAlerts;
      alertsContainer.innerHTML = alertsHtml;
      
    } catch (e) {
      console.error(e);
      document.getElementById('dashAlertsList').innerHTML = `<div class="text-danger text-sm text-center py-4">Error: ${e.message}</div>`;
    }
  }
};
