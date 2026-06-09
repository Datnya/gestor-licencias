// Utilities

window.format = {
  currency: (num) => {
    return 'S/ ' + parseFloat(num || 0).toFixed(2);
  },
  
  date: (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  datetime: (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  },
  
  generateDeviceCode: () => {
    return 'DEV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  },
  
  generateLicenseCode: () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for(let i=0; i<4; i++) {
      for(let j=0; j<4; j++) code += chars.charAt(Math.floor(Math.random() * chars.length));
      if(i<3) code += '-';
    }
    return code;
  }
};

window.toast = {
  show: (title, message, type = 'info') => {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '';
    if (type === 'success') icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    else if (type === 'error') icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.style.transform = 'translateY(0)', 10);
    
    // Auto remove
    setTimeout(() => {
      toast.style.transform = 'translateY(120%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },
  success: (title, msg) => window.toast.show(title, msg, 'success'),
  error: (title, msg) => window.toast.show(title, msg, 'error'),
  warning: (title, msg) => window.toast.show(title, msg, 'warning')
};

window.modal = {
  show: (options) => {
    const container = document.getElementById('modalContainer');
    container.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${options.title}</h3>
          <button class="modal-close" id="modalCloseBtn">&times;</button>
        </div>
        <div class="modal-body">
          ${options.content}
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary w-full" id="modalConfirmBtn">${options.confirmText || 'Aceptar'}</button>
        </div>
      </div>
    `;
    
    const close = () => container.innerHTML = '';
    
    document.getElementById('modalCloseBtn').onclick = close;
    document.querySelector('.modal-overlay').onclick = close;
    
    document.getElementById('modalConfirmBtn').onclick = async () => {
      const btn = document.getElementById('modalConfirmBtn');
      btn.disabled = true;
      btn.textContent = 'Procesando...';
      
      try {
        if (options.onConfirm) {
          const keepOpen = await options.onConfirm();
          if (!keepOpen) close();
        } else {
          close();
        }
      } catch(e) {
        btn.disabled = false;
        btn.textContent = options.confirmText || 'Aceptar';
      }
    };
  }
};
