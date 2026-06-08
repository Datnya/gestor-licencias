// Utilities

window.format = {
  currency: (num) => {
    return 'S/ ' + parseFloat(num || 0).toFixed(2);
  },
  
  date: (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

  datetime: (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  },
  
  generateId: () => {
    return Math.random().toString(36).substr(2, 9);
  }
};

window.toast = {
  show: (title, message, type = 'info') => {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '';
    if (type === 'success') icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;color:var(--color-success)"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    else if (type === 'error') icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;color:var(--color-danger)"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    
    toast.innerHTML = `
      ${icon}
      <div style="flex:1">
        <div style="font-weight:600;font-size:14px">${title}</div>
        <div style="font-size:12px;opacity:0.8;margin-top:2px">${message}</div>
      </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },
  success: (title, msg) => window.toast.show(title, msg, 'success'),
  error: (title, msg) => window.toast.show(title, msg, 'error'),
  info: (title, msg) => window.toast.show(title, msg, 'info')
};

window.modal = {
  show: (options) => {
    const container = document.getElementById('modalContainer');
    const bg = document.createElement('div');
    bg.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn 0.2s';
    
    const card = document.createElement('div');
    card.className = 'card w-full';
    card.style.maxWidth = '400px';
    
    card.innerHTML = `
      <h3 class="font-bold text-lg mb-4">${options.title}</h3>
      <div class="mb-6">${options.content}</div>
      <div class="flex justify-end gap-2">
        <button class="btn btn-secondary btn-sm" id="btnModalCancel">Cancelar</button>
        <button class="btn btn-primary btn-sm" id="btnModalConfirm">${options.confirmText || 'Aceptar'}</button>
      </div>
    `;
    
    bg.appendChild(card);
    container.appendChild(bg);
    
    const close = () => bg.remove();
    
    document.getElementById('btnModalCancel').onclick = close;
    document.getElementById('btnModalConfirm').onclick = async () => {
      const btn = document.getElementById('btnModalConfirm');
      const originalText = btn.textContent;
      btn.textContent = 'Procesando...';
      btn.disabled = true;
      
      try {
        if (options.onConfirm) {
          const keepOpen = await options.onConfirm();
          if (!keepOpen) close();
        } else {
          close();
        }
      } catch (e) {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    };
  }
};
