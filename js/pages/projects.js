// Projects Page
window.projectsPage = {
  render: async () => {
    return `
      <div class="page-content">
        <div class="section-header mb-24">
          <h2 class="section-title">Mis Proyectos</h2>
          <button class="btn btn-outline btn-sm" style="width:auto;font-size:0.78rem" onclick="window.settingsPage.showAddSoftware(); window.projectsPage._pendingReload = true;">+ Nuevo</button>
        </div>
        <p class="text-sm text-gray-500 mb-24">Toca un proyecto para ver sus detalles y editar sus precios.</p>

        <div id="projectsGrid" class="project-grid">
          <div class="text-center text-sm text-gray-400" style="grid-column:1/-1;padding:40px 0">Cargando proyectos...</div>
        </div>
      </div>
    `;
  },

  init: async () => {
    await window.projectsPage.loadProjects();
  },

  loadProjects: async () => {
    try {
      const software = await window.dbAPI.getAllSoftware();
      const grid = document.getElementById('projectsGrid');
      
      if (software.length === 0) {
        grid.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:40px 0;color:var(--color-gray-400)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px;height:48px;margin:0 auto 12px"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
            <div class="font-semibold mb-4">No hay proyectos</div>
            <div class="text-sm">Agrega tu primer software desde Ajustes.</div>
          </div>
        `;
        return;
      }

      let html = '';
      for (const sw of software) {
        const licenses = await db.licenses.where('software_id').equals(sw.id).toArray();
        const activeCount = licenses.filter(l => l.status === 'active').length;
        
        html += `
          <div class="project-card" onclick="window.projectsPage.openDetail(${sw.id})">
            <div class="project-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
            </div>
            <div class="project-name">${sw.name}</div>
            <div class="project-clients">${activeCount} cliente${activeCount !== 1 ? 's' : ''} activo${activeCount !== 1 ? 's' : ''}</div>
          </div>
        `;
      }
      grid.innerHTML = html;
    } catch (e) {
      console.error(e);
    }
  },

  openDetail: async (swId) => {
    const sw = await window.dbAPI.getSoftware(swId);
    if (!sw) return;
    
    const licenses = await db.licenses.where('software_id').equals(swId).toArray();
    const activeCount = licenses.filter(l => l.status === 'active').length;
    const pcCount = licenses.filter(l => l.type === 'PC').length;
    const mobileCount = licenses.filter(l => l.type === 'Móvil').length;

    window.modal.show({
      title: sw.name,
      content: `
        <div class="mb-20">
          <div style="display:flex;gap:12px;margin-bottom:16px">
            <div style="flex:1;background:var(--color-gray-50);padding:12px;border-radius:var(--radius-md);text-align:center">
              <div class="font-bold text-lg">${activeCount}</div>
              <div class="text-xs text-gray-500">Clientes</div>
            </div>
            <div style="flex:1;background:var(--color-gray-50);padding:12px;border-radius:var(--radius-md);text-align:center">
              <div class="font-bold text-lg">${pcCount}</div>
              <div class="text-xs text-gray-500">PC</div>
            </div>
            <div style="flex:1;background:var(--color-gray-50);padding:12px;border-radius:var(--radius-md);text-align:center">
              <div class="font-bold text-lg">${mobileCount}</div>
              <div class="text-xs text-gray-500">Móvil</div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Precio de Instalación (S/)</label>
          <input type="number" id="editSwPrice" class="form-input" value="${sw.default_price}">
        </div>
        <div class="form-group">
          <label class="form-label">Mantenimiento Anual (USD)</label>
          <input type="number" id="editSwMaintenance" class="form-input" value="${sw.maintenance_price || 15}">
        </div>
        <div class="form-group">
          <label class="form-label">Repositorio GitHub</label>
          <input type="text" class="form-input" value="${sw.repo_path}" disabled style="opacity:0.6">
        </div>
      `,
      confirmText: 'Guardar Cambios',
      onConfirm: async () => {
        const newPrice = parseFloat(document.getElementById('editSwPrice').value) || 0;
        const newMaintenance = parseFloat(document.getElementById('editSwMaintenance').value) || 15;
        
        sw.default_price = newPrice;
        sw.maintenance_price = newMaintenance;
        await window.dbAPI.saveSoftware(sw);
        
        await window.projectsPage.loadProjects();
        window.toast.success('Actualizado', 'Los precios han sido guardados.');
      }
    });
  }
};
