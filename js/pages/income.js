// Income Page
window.incomePage = {
  currentFilterType: 'all',
  currentFilterMonth: '',

  render: async () => {
    // Generar opciones de meses únicos
    const payments = await db.payments.toArray();
    const months = new Set();
    payments.forEach(p => {
      if (p.paid && p.paid_date) {
        months.add(p.paid_date.substring(0, 7)); // YYYY-MM
      }
    });
    const monthsArr = Array.from(months).sort().reverse();
    const monthOptions = monthsArr.map(m => `<option value="${m}">${m}</option>`).join('');

    return `
      <div class="page-content pb-20">
        <div class="section-header mb-16">
          <h2 class="section-title">Ingresos Totales</h2>
          <button class="btn btn-outline btn-sm text-danger" style="width:auto" onclick="window.incomePage.clearAll()">Vaciar Registro</button>
        </div>

        <!-- Filters -->
        <div class="flex flex-col gap-3 mb-16">
          <div class="flex gap-2">
            <select id="incomeMonthFilter" class="form-select flex-1" onchange="window.incomePage.applyFilters()">
              <option value="">Todos los meses</option>
              ${monthOptions}
            </select>
            <select id="incomeTypeFilter" class="form-select flex-1" onchange="window.incomePage.applyFilters()">
              <option value="all">Cualquier concepto</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Adelanto">Instalación (Adelanto)</option>
              <option value="Pago Único">Pago Único</option>
            </select>
          </div>
          <button class="btn btn-primary" onclick="window.incomePage.exportCSV()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" style="display:inline;margin-right:6px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Descargar Excel
          </button>
        </div>
        
        <!-- Summary Cards -->
        <div class="stats-grid">
          <div class="stat-card-v2 bg-success-50 border-success-200">
            <div class="stat-label text-success-700">Total Soles (S/)</div>
            <div class="stat-number text-success-800" id="incomeTotalPEN" style="font-size:1.4rem">S/ 0.00</div>
          </div>
          <div class="stat-card-v2 bg-success-50 border-success-200">
            <div class="stat-label text-success-700">Total Dólares ($)</div>
            <div class="stat-number text-success-800" id="incomeTotalUSD" style="font-size:1.4rem">$ 0.00</div>
          </div>
        </div>

        <div id="incomeList" class="card p-0 overflow-hidden mt-16">
          <div class="p-6 text-center text-gray-500">Cargando ingresos...</div>
        </div>
        
        <!-- Contenedor oculto para renderizar el recibo antes de convertirlo a imagen -->
        <div id="receiptRenderContainer" style="position: absolute; left: -9999px; top: 0;"></div>
      </div>
    `;
  },

  init: async () => {
    // Set default month to current month if options exist
    const monthSelect = document.getElementById('incomeMonthFilter');
    if (monthSelect && monthSelect.options.length > 1 && !window.incomePage.currentFilterMonth) {
      window.incomePage.currentFilterMonth = monthSelect.options[1].value;
      monthSelect.value = window.incomePage.currentFilterMonth;
    }
    await window.incomePage.loadData();
  },

  applyFilters: () => {
    window.incomePage.currentFilterMonth = document.getElementById('incomeMonthFilter').value;
    window.incomePage.currentFilterType = document.getElementById('incomeTypeFilter').value;
    window.incomePage.loadData();
  },

  loadData: async () => {
    const listContainer = document.getElementById('incomeList');
    try {
      let payments = await db.payments.where('paid').equals(true).toArray();
      
      // Filter by month
      if (window.incomePage.currentFilterMonth) {
        payments = payments.filter(p => p.paid_date && p.paid_date.startsWith(window.incomePage.currentFilterMonth));
      }
      
      // Filter by type
      if (window.incomePage.currentFilterType !== 'all') {
        payments = payments.filter(p => p.concept.includes(window.incomePage.currentFilterType));
      }
      
      // Sort newest first
      payments.sort((a,b) => new Date(b.paid_date) - new Date(a.paid_date));

      // Calculate totals
      let totalPEN = 0;
      let totalUSD = 0;
      for (const p of payments) {
        if (p.currency === 'USD') totalUSD += parseFloat(p.amount);
        else totalPEN += parseFloat(p.amount);
      }
      
      const elPEN = document.getElementById('incomeTotalPEN');
      const elUSD = document.getElementById('incomeTotalUSD');
      if(elPEN) elPEN.textContent = \`S/ \${totalPEN.toFixed(2)}\`;
      if(elUSD) elUSD.textContent = \`$ \${totalUSD.toFixed(2)}\`;

      if (payments.length === 0) {
        listContainer.innerHTML = \`<div class="p-6 text-center text-gray-500">No hay ingresos que coincidan con los filtros.</div>\`;
        return;
      }
      
      let html = '';
      for (const p of payments) {
        const client = await db.clients.get(p.client_id);
        const cName = client ? client.business_name : 'Cliente Desconocido';
        const owner = client ? client.owner_name : '';
        
        html += \`
          <div class="p-4 border-b border-gray-100 last:border-b-0 flex justify-between items-center">
            <div style="flex:1;min-width:0">
              <div class="font-bold text-gray-900 truncate">\${cName}</div>
              <div class="text-xs text-gray-500 mt-1 truncate">\${owner}</div>
              <div class="text-xs text-primary-600 font-semibold mt-1 truncate">\${p.concept}</div>
              <div class="text-xs text-success mt-1">Pagado: \${window.format.datetime(p.paid_date)}</div>
            </div>
            <div class="text-right ml-4">
              <div class="font-bold text-lg text-gray-900">
                \${p.currency === 'USD' ? '$' : 'S/'}\${parseFloat(p.amount).toFixed(2)}
              </div>
              <button class="btn btn-outline btn-sm mt-3 py-1 px-3 text-xs" onclick="window.clientDetailPage.generateReceipt(\${p.id})">Recibo</button>
            </div>
          </div>
        \`;
      }
      listContainer.innerHTML = html;
      
    } catch (e) {
      console.error(e);
      listContainer.innerHTML = \`<div class="p-6 text-center text-danger">Error: \${e.message}</div>\`;
    }
  },

  exportCSV: async () => {
    try {
      let payments = await db.payments.where('paid').equals(true).toArray();
      
      if (window.incomePage.currentFilterMonth) {
        payments = payments.filter(p => p.paid_date && p.paid_date.startsWith(window.incomePage.currentFilterMonth));
      }
      if (window.incomePage.currentFilterType !== 'all') {
        payments = payments.filter(p => p.concept.includes(window.incomePage.currentFilterType));
      }
      
      if (payments.length === 0) {
        window.toast.error('Sin datos', 'No hay pagos para exportar.');
        return;
      }

      let csv = '\\uFEFFFecha de Pago,Cliente,Contacto,Concepto,Moneda,Monto\\n';
      
      for (const p of payments) {
        const client = await db.clients.get(p.client_id);
        const cName = client ? client.business_name.replace(/,/g, '') : 'Desconocido';
        const owner = client ? client.owner_name.replace(/,/g, '') : '';
        const concept = p.concept.replace(/,/g, '');
        const date = window.format.datetime(p.paid_date).replace(/,/g, '');
        
        csv += \`\${date},\${cName},\${owner},\${concept},\${p.currency},\${p.amount}\\n\`;
      }
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", \`ingresos_\${window.incomePage.currentFilterMonth || 'todos'}.csv\`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.toast.success('Exportado', 'El archivo Excel ha sido descargado.');
    } catch (e) {
      window.toast.error('Error', e.message);
    }
  },

  clearAll: () => {
    window.modal.show({
      title: 'Vaciar Registro',
      content: '¿Estás completamente seguro de que deseas eliminar TODOS los ingresos registrados? Esta acción no se puede deshacer.',
      confirmText: 'Sí, Eliminar Todo',
      onConfirm: async () => {
        // Necesitamos cerrar el primer modal y abrir el segundo
        setTimeout(() => {
          window.modal.show({
            title: 'Última Advertencia',
            content: 'Para evitar borrados accidentales, confirma esta acción.<br><br>Escribe <b>borrar</b> para confirmar:',
            confirmText: 'Confirmar Eliminación',
            onConfirm: async () => {
              const input = prompt("Escribe 'borrar' para confirmar:");
              if (input && input.toLowerCase() === 'borrar') {
                try {
                  const payments = await db.payments.where('paid').equals(true).toArray();
                  const ids = payments.map(p => p.id);
                  await db.payments.bulkDelete(ids);
                  window.toast.success('Eliminado', 'Se vació el registro de ingresos.');
                  await window.incomePage.init();
                } catch (e) {
                  window.toast.error('Error', e.message);
                }
              } else {
                window.toast.error('Cancelado', 'Palabra clave incorrecta. No se eliminó nada.');
              }
            }
          });
        }, 300);
      }
    });
  }
};
