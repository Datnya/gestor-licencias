// Income Page
window.incomePage = {
  currentFilterType: 'all',
  currentFilterMonth: '',

  render: async function() {
    // Generar opciones de meses únicos
    var payments = await db.payments.filter(function(p) { return p.paid === 1; }).toArray();
    var months = new Set();
    payments.forEach(function(p) {
      if (p.paid_date) {
        months.add(p.paid_date.substring(0, 7));
      }
    });
    var monthsArr = Array.from(months).sort().reverse();
    var monthOptions = monthsArr.map(function(m) {
      return '<option value="' + m + '">' + m + '</option>';
    }).join('');

    return '<div class="page-content pb-20">' +
      '<div class="section-header mb-16">' +
        '<h2 class="section-title">Ingresos Totales</h2>' +
        '<button class="btn btn-outline btn-sm text-danger" style="width:auto" onclick="window.incomePage.clearAll()">Vaciar Registro</button>' +
      '</div>' +

      '<div class="flex flex-col gap-3 mb-16">' +
        '<div class="flex gap-2">' +
          '<select id="incomeMonthFilter" class="form-select flex-1" onchange="window.incomePage.applyFilters()">' +
            '<option value="">Todos los meses</option>' +
            monthOptions +
          '</select>' +
          '<select id="incomeTypeFilter" class="form-select flex-1" onchange="window.incomePage.applyFilters()">' +
            '<option value="all">Cualquier concepto</option>' +
            '<option value="Mantenimiento">Mantenimiento</option>' +
            '<option value="Adelanto">Instalación (Adelanto)</option>' +
            '<option value="Pago Único">Pago Único</option>' +
          '</select>' +
        '</div>' +
        '<button class="btn btn-primary" style="margin-top:20px;margin-bottom:10px" onclick="window.incomePage.exportCSV()">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" style="display:inline;margin-right:6px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>' +
          'Descargar Excel' +
        '</button>' +
      '</div>' +

      '<div class="stats-grid">' +
        '<div class="stat-card-v2 bg-success-50 border-success-200">' +
          '<div class="stat-label text-success-700">Total Soles (S/)</div>' +
          '<div class="stat-number text-success-800" id="incomeTotalPEN" style="font-size:1.4rem">S/ 0.00</div>' +
        '</div>' +
        '<div class="stat-card-v2 bg-success-50 border-success-200">' +
          '<div class="stat-label text-success-700">Total Dólares ($)</div>' +
          '<div class="stat-number text-success-800" id="incomeTotalUSD" style="font-size:1.4rem">$ 0.00</div>' +
        '</div>' +
      '</div>' +

      '<div id="incomeList" class="card p-0 overflow-hidden mt-16">' +
        '<div class="p-6 text-center text-gray-500">Cargando ingresos...</div>' +
      '</div>' +
    '</div>';
  },

  init: async function() {
    var monthSelect = document.getElementById('incomeMonthFilter');
    if (monthSelect && monthSelect.options.length > 1 && !window.incomePage.currentFilterMonth) {
      window.incomePage.currentFilterMonth = monthSelect.options[1].value;
      monthSelect.value = window.incomePage.currentFilterMonth;
    }
    await window.incomePage.loadData();
  },

  applyFilters: function() {
    window.incomePage.currentFilterMonth = document.getElementById('incomeMonthFilter').value;
    window.incomePage.currentFilterType = document.getElementById('incomeTypeFilter').value;
    window.incomePage.loadData();
  },

  loadData: async function() {
    var listContainer = document.getElementById('incomeList');
    try {
      var payments = await db.payments.filter(function(p) { return p.paid === 1; }).toArray();

      // Filter by month
      if (window.incomePage.currentFilterMonth) {
        var month = window.incomePage.currentFilterMonth;
        payments = payments.filter(function(p) {
          return p.paid_date && p.paid_date.startsWith(month);
        });
      }

      // Filter by type
      if (window.incomePage.currentFilterType !== 'all') {
        var filterType = window.incomePage.currentFilterType;
        payments = payments.filter(function(p) {
          return p.concept && p.concept.indexOf(filterType) !== -1;
        });
      }

      // Sort newest first
      payments.sort(function(a, b) {
        return new Date(b.paid_date) - new Date(a.paid_date);
      });

      // Calculate totals
      var rawTotalPEN = 0;
      var rawTotalUSD = 0;
      for (var i = 0; i < payments.length; i++) {
        var p = payments[i];
        var amt = parseFloat(p.amount) || 0;
        if (p.currency === 'USD') rawTotalUSD += amt;
        else rawTotalPEN += amt;
      }

      var exchangeRate = 3.4;
      var unifiedTotalPEN = rawTotalPEN + (rawTotalUSD * exchangeRate);
      var unifiedTotalUSD = rawTotalUSD + (rawTotalPEN / exchangeRate);

      var elPEN = document.getElementById('incomeTotalPEN');
      var elUSD = document.getElementById('incomeTotalUSD');
      if (elPEN) elPEN.textContent = 'S/ ' + unifiedTotalPEN.toFixed(2);
      if (elUSD) elUSD.textContent = '$ ' + unifiedTotalUSD.toFixed(2);

      if (payments.length === 0) {
        listContainer.innerHTML = '<div class="p-6 text-center text-gray-500">No hay ingresos registrados.</div>';
        return;
      }

      var html = '';
      for (var j = 0; j < payments.length; j++) {
        var pay = payments[j];
        var client = await db.clients.get(pay.client_id);
        var cName = client ? client.business_name : 'Cliente Desconocido';
        var owner = client ? client.owner_name : '';
        var currSymbol = pay.currency === 'USD' ? '$' : 'S/';
        var amount = (parseFloat(pay.amount) || 0).toFixed(2);
        var paidDate = window.format.datetime(pay.paid_date);

        html += '<div style="padding:14px 16px;border-bottom:1px solid var(--color-gray-100);display:flex;justify-content:space-between;align-items:center">' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-weight:700;color:var(--color-gray-900);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + cName + '</div>' +
            '<div style="font-size:0.75rem;color:var(--color-gray-500);margin-top:2px">' + owner + '</div>' +
            '<div style="font-size:0.75rem;color:var(--color-primary);font-weight:600;margin-top:2px">' + pay.concept + '</div>' +
            '<div style="font-size:0.75rem;color:var(--color-success);margin-top:2px">Pagado: ' + paidDate + '</div>' +
          '</div>' +
          '<div style="text-align:right;margin-left:12px">' +
            '<div style="font-weight:700;font-size:1.1rem;color:var(--color-gray-900)">' + currSymbol + amount + '</div>' +
            '<button class="btn btn-outline btn-sm" style="margin-top:8px;padding:3px 10px;font-size:0.7rem" onclick="window.incomePage.viewReceipt(' + pay.id + ')">Recibo</button>' +
          '</div>' +
        '</div>';
      }
      listContainer.innerHTML = html;

    } catch (e) {
      console.error(e);
      listContainer.innerHTML = '<div class="p-6 text-center text-danger">Error: ' + e.message + '</div>';
    }
  },

  viewReceipt: function(paymentId) {
    if (window.clientDetailPage && window.clientDetailPage.generateReceipt) {
      window.clientDetailPage.generateReceipt(paymentId);
    } else {
      window.toast.error('Error', 'El generador de recibos no está disponible.');
    }
  },

  exportCSV: async function() {
    try {
      var payments = await db.payments.filter(function(p) { return p.paid === 1; }).toArray();

      if (window.incomePage.currentFilterMonth) {
        var mo = window.incomePage.currentFilterMonth;
        payments = payments.filter(function(p) {
          return p.paid_date && p.paid_date.startsWith(mo);
        });
      }
      if (window.incomePage.currentFilterType !== 'all') {
        var ft = window.incomePage.currentFilterType;
        payments = payments.filter(function(p) {
          return p.concept && p.concept.indexOf(ft) !== -1;
        });
      }

      if (payments.length === 0) {
        window.toast.error('Sin datos', 'No hay pagos para exportar.');
        return;
      }

      var csv = '\uFEFFFecha de Pago,Cliente,Contacto,Concepto,Moneda,Monto\n';

      for (var i = 0; i < payments.length; i++) {
        var p = payments[i];
        var client = await db.clients.get(p.client_id);
        var cName = client ? client.business_name.replace(/,/g, '') : 'Desconocido';
        var ownerN = client ? client.owner_name.replace(/,/g, '') : '';
        var concept = (p.concept || '').replace(/,/g, '');
        var dateStr = window.format.datetime(p.paid_date).replace(/,/g, '');

        csv += dateStr + ',' + cName + ',' + ownerN + ',' + concept + ',' + p.currency + ',' + p.amount + '\n';
      }

      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'ingresos_' + (window.incomePage.currentFilterMonth || 'todos') + '.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.toast.success('Exportado', 'El archivo Excel ha sido descargado.');
    } catch (e) {
      window.toast.error('Error', e.message);
    }
  },

  clearAll: function() {
    window.modal.show({
      title: 'Vaciar Registro',
      content: '¿Estás completamente seguro de que deseas eliminar TODOS los ingresos registrados? Esta acción no se puede deshacer.',
      confirmText: 'Sí, Eliminar Todo',
      onConfirm: async function() {
        setTimeout(function() {
          window.modal.show({
            title: 'Última Advertencia',
            content: 'Para evitar borrados accidentales, confirma esta acción.<br><br>Escribe <b>borrar</b> para confirmar:',
            confirmText: 'Confirmar Eliminación',
            onConfirm: async function() {
              var input = prompt("Escribe 'borrar' para confirmar:");
              if (input && input.toLowerCase() === 'borrar') {
                try {
                  var allPaid = await db.payments.filter(function(p) { return p.paid === 1; }).toArray();
                  var ids = allPaid.map(function(p) { return p.id; });
                  await db.payments.bulkDelete(ids);
                  window.toast.success('Eliminado', 'Se vació el registro de ingresos.');
                  await window.app.navigate('/income');
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
