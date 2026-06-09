// Settings Page
window.settingsPage = {
  render: async () => {
    return `
      <div class="page-content">
        <h2 class="font-bold text-xl mb-6">Configuración</h2>
        
        <div class="card mb-6">
          <h3 class="font-semibold mb-4 text-primary flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            Conexión a GitHub
          </h3>
          <div class="form-group">
            <label class="form-label">Token de Acceso Personal (PAT)</label>
            <input type="password" id="inputGhToken" class="form-input" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" autocomplete="off">
            <div class="text-xs text-warning mt-1">Este token se guarda únicamente en tu dispositivo local.</div>
          </div>
          <button id="btnSaveToken" class="btn btn-primary mt-2">Guardar Token</button>
        </div>


        <div class="card">
          <h3 class="font-semibold mb-4 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Copia de Seguridad
          </h3>
          <p class="text-sm text-gray-500 mb-4">Exporta los datos de tus clientes y pagos para guardarlos seguros o importarlos en otro celular.</p>
          <div class="flex flex-col gap-3">
            <button class="btn btn-outline" id="btnExportData">Exportar Datos (JSON)</button>
          </div>
        </div>
      </div>
    `;
  },

  init: async () => {
    const inputToken = document.getElementById('inputGhToken');
    const token = window.githubAPI.getToken();
    if (token) {
      inputToken.value = token;
    }
    
    document.getElementById('btnSaveToken').onclick = async () => {
      const newToken = inputToken.value.trim();
      if (!newToken) {
        window.toast.error('Error', 'El token no puede estar vacío');
        return;
      }
      
      const btn = document.getElementById('btnSaveToken');
      btn.textContent = 'Verificando...';
      btn.disabled = true;
      
      window.githubAPI.setToken(newToken);
      
      const isValid = await window.app.checkConnection();
      
      if (isValid) {
        window.toast.success('¡Conectado!', 'El token de GitHub es válido.');
      } else {
        window.toast.error('Error', 'Token inválido o sin acceso al repositorio.');
        window.githubAPI.setToken(token); // Revert
        inputToken.value = token || '';
      }
      
      btn.textContent = 'Guardar Token';
      btn.disabled = false;
    };
    
    document.getElementById('btnExportData').onclick = async () => {
      try {
        const clients = await window.dbAPI.getAllClients();
        const licenses = await window.dbAPI.getAllLicenses();
        const payments = await db.payments.toArray();
        
        const backup = {
          date: new Date().toISOString(),
          data: { clients, licenses, payments }
        };
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
        const anchor = document.createElement('a');
        anchor.setAttribute("href", dataStr);
        anchor.setAttribute("download", `gestor_licencias_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        
        window.toast.success('Exportado', 'El archivo de copia de seguridad ha sido descargado.');
      } catch (e) {
        window.toast.error('Error', 'No se pudo exportar los datos: ' + e.message);
      }
    };
  }
};
