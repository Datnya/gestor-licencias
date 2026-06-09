// Projects Page
window.projectsPage = {
  render: async () => {
    return `
      <div class="page-content">
        <div class="section-header mb-24">
          <h2 class="section-title">Mis Proyectos</h2>
          <button class="btn btn-outline btn-sm" style="width:auto;font-size:0.78rem" onclick="window.projectsPage.showAddSoftware()">+ Nuevo Proyecto</button>
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
    
    // Fetch last updated from GitHub if token exists
    let lastUpdated = 'Desconocido';
    try {
      const token = window.githubAPI.getToken();
      if (token && sw.repo_path) {
        const response = await fetch(`https://api.github.com/repos/${sw.repo_path}/commits?per_page=1`, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        if (response.ok) {
          const commits = await response.json();
          if (commits.length > 0) {
            lastUpdated = window.format.date(commits[0].commit.committer.date);
          }
        }
      }
    } catch (e) {
      console.warn("Could not fetch last commit", e);
    }

    window.modal.show({
      title: 'Detalles del Proyecto',
      content: `
        <div class="form-group">
          <label class="form-label text-sm">Nombre del Software</label>
          <input type="text" id="editSwName" class="form-input font-bold" value="${sw.name}">
        </div>
        <div class="form-group">
          <label class="form-label text-sm">Repositorio GitHub</label>
          <input type="text" id="editSwRepo" class="form-input text-sm text-gray-600" value="${sw.repo_path}">
        </div>
        
        <div class="flex gap-4 mb-4">
          <div class="flex-1 form-group">
            <label class="form-label text-sm">Costo Descarga (S/)</label>
            <input type="number" id="editSwPrice" class="form-input font-bold text-primary-600" value="${sw.default_price}">
          </div>
          <div class="flex-1 form-group">
            <label class="form-label text-sm">Mantenimiento (USD)</label>
            <input type="number" id="editSwMaintenance" class="form-input font-bold text-warning" value="${sw.maintenance_price || 15}">
          </div>
        </div>
        
        <div class="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 mb-4">
          <div class="flex justify-between mb-1">
            <span>Clientes con instalación:</span>
            <span class="font-bold text-gray-900">${activeCount}</span>
          </div>
          <div class="flex justify-between">
            <span>Última actualización:</span>
            <span class="font-bold text-gray-900">${lastUpdated}</span>
          </div>
        </div>
      `,
      confirmText: 'Guardar Cambios',
      onConfirm: async () => {
        const newName = document.getElementById('editSwName').value.trim();
        const newRepo = document.getElementById('editSwRepo').value.trim();
        const newPrice = parseFloat(document.getElementById('editSwPrice').value) || 0;
        const newMaintenance = parseFloat(document.getElementById('editSwMaintenance').value) || 15;
        
        if (!newName || !newRepo) {
          window.toast.error('Error', 'Nombre y repositorio son obligatorios');
          return true;
        }
        
        sw.name = newName;
        sw.repo_path = newRepo;
        sw.default_price = newPrice;
        sw.maintenance_price = newMaintenance;
        await window.dbAPI.saveSoftware(sw);
        
        await window.projectsPage.loadProjects();
        window.toast.success('Actualizado', 'Proyecto guardado correctamente.');
      }
    });
  },
  
  showAddSoftware: () => {
    window.modal.show({
      title: 'Nuevo Proyecto',
      content: `
        <div class="form-group">
          <label class="form-label text-sm">Nombre del Software</label>
          <input type="text" id="addSwName" class="form-input" placeholder="Ej: Control de Inventario">
        </div>
        <div class="form-group">
          <label class="form-label text-sm">Repositorio GitHub</label>
          <input type="text" id="addSwRepo" class="form-input" placeholder="Usuario/Repositorio">
        </div>
        <div class="flex gap-4 mb-2">
          <div class="flex-1 form-group">
            <label class="form-label text-sm">Costo Descarga (S/)</label>
            <input type="number" id="addSwPrice" class="form-input" value="200">
          </div>
          <div class="flex-1 form-group">
            <label class="form-label text-sm">Mantenimiento (USD)</label>
            <input type="number" id="addSwMaintenance" class="form-input" value="15">
          </div>
        </div>
      `,
      confirmText: 'Crear Proyecto',
      onConfirm: async () => {
        const name = document.getElementById('addSwName').value.trim();
        const repo = document.getElementById('addSwRepo').value.trim();
        const price = parseFloat(document.getElementById('addSwPrice').value) || 0;
        const maintenance = parseFloat(document.getElementById('addSwMaintenance').value) || 15;
        
        if (!name || !repo) {
          window.toast.error('Error', 'Nombre y repositorio son obligatorios');
          return true; // Keep open
        }
        
        await db.software.add({
          name: name,
          repo_path: repo,
          default_price: price,
          maintenance_price: maintenance,
          active: 1
        });
        
        await window.projectsPage.loadProjects();
        window.toast.success('Proyecto creado', 'El software ha sido agregado a tu catálogo.');
      }
    });
  }
};
