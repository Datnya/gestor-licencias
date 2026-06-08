// Dashboard Page
window.dashboardPage = {
  render: async () => {
    return `
      <div class="page-content pb-20">
        <div class="mb-6">
          <h2 class="font-bold text-xl mb-1">Resumen General</h2>
          <p class="text-gray-500 text-sm">Estadísticas de tus licencias vendidas</p>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="card p-4">
            <div class="stat-value text-primary" id="dashTotalActive">-</div>
            <div class="stat-label">Licencias Activas</div>
          </div>
          <div class="card p-4">
            <div class="stat-value text-success" id="dashPendingPayments">-</div>
            <div class="stat-label">Pagos Pendientes</div>
          </div>
          <div class="card p-4">
            <div class="stat-value" id="dashPcCount">-</div>
            <div class="stat-label">PC</div>
          </div>
          <div class="card p-4">
            <div class="stat-value" id="dashMobileCount">-</div>
            <div class="stat-label">Móviles</div>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="font-semibold mb-3 flex items-center justify-between">
            <span>Alertas y Recordatorios</span>
            <span class="badge badge-warning" id="dashAlertCount">0</span>
          </h3>
          <div id="dashAlertsList" class="flex flex-col gap-3">
            <div class="text-center text-sm text-gray-400 py-4">Cargando...</div>
          </div>
        </div>
      </div>
    `;
  },

  init: async () => {
    try {
      const stats = await window.dbAPI.getDashboardStats();
      
      document.getElementById('dashTotalActive').textContent = stats.totalActive;
      document.getElementById('dashPendingPayments').textContent = stats.pendingCount;
      document.getElementById('dashPcCount').textContent = stats.pcCount;
      document.getElementById('dashMobileCount').textContent = stats.mobileCount;
      
      const alertsContainer = document.getElementById('dashAlertsList');
      const alertsCount = document.getElementById('dashAlertCount');
      
      let alertsHtml = '';
      let totalAlerts = 0;
      
      // Check if there are no token
      if (!window.githubAPI.hasToken()) {
        alertsHtml += `
          <div class="card p-4" style="border-left: 4px solid var(--color-danger)">
            <div class="font-semibold text-danger">Falta Configuración</div>
            <div class="text-sm text-gray-500 mt-1">Debes configurar tu Token de GitHub para empezar a crear licencias.</div>
            <button class="btn btn-outline btn-sm mt-3" onclick="window.app.navigate('/settings')">Ir a Configuración</button>
          </div>
        `;
        totalAlerts++;
      }
      
      // Pending Payments
      if (stats.pendingPayments && stats.pendingPayments.length > 0) {
        for (const p of stats.pendingPayments.slice(0, 3)) { // Show max 3
          const client = await window.dbAPI.getClient(p.client_id);
          const isOverdue = new Date(p.due_date) < new Date();
          
          alertsHtml += `
            <div class="card p-3 flex justify-between items-center" style="border-left: 4px solid var(--color-${isOverdue ? 'danger' : 'warning'})">
              <div>
                <div class="font-semibold text-sm">${client ? client.business_name : 'Cliente desconocido'}</div>
                <div class="text-xs text-gray-500 mt-1">${p.concept} - Vence: ${window.format.date(p.due_date)}</div>
              </div>
              <div class="font-bold text-sm">${window.format.currency(p.amount)}</div>
            </div>
          `;
          totalAlerts++;
        }
      }
      
      if (totalAlerts === 0) {
        alertsHtml = `
          <div class="card p-6 text-center text-gray-500 bg-success-light" style="border:1px solid var(--color-success)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto mb-2" style="width:32px;height:32px;color:var(--color-success)">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div class="font-medium text-success">¡Todo al día!</div>
            <div class="text-sm mt-1">No tienes pagos pendientes ni licencias por renovar pronto.</div>
          </div>
        `;
      }
      
      alertsCount.textContent = totalAlerts;
      alertsContainer.innerHTML = alertsHtml;
      
    } catch (e) {
      console.error(e);
      document.getElementById('dashAlertsList').innerHTML = `<div class="text-danger text-sm text-center py-4">Error cargando dashboard: ${e.message}</div>`;
    }
  }
};
