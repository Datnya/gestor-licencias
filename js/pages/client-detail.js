// Client Detail Page
window.clientDetailPage = {
  render: async (id) => {
    return `
      <div class="page-content pb-20">
        <div class="mb-4">
          <button class="btn btn-ghost btn-sm pl-0 text-gray-500 hover:text-gray-800" onclick="window.app.navigate('/clients')" style="width:auto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Volver
          </button>
        </div>
        
        <div id="clientDetailContainer">
          <div class="text-center py-10"><div class="spinner mx-auto"></div></div>
        </div>
      </div>
    `;
  },

  init: async (id) => {
    try {
      const client = await window.dbAPI.getClient(id);
      if (!client) throw new Error("Cliente no encontrado");
      
      const licenses = await window.dbAPI.getLicensesByClient(id);
      const payments = await window.dbAPI.getPaymentsByClient(id);
      
      const container = document.getElementById('clientDetailContainer');
      
      let html = `
        <div class="detail-header">
          <h2 class="text-2xl font-bold">${client.business_name}</h2>
          <p class="mt-1 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            ${client.owner_name}
          </p>
          <div class="flex items-center gap-4 mt-3">
            <a href="tel:${client.phone}" class="flex items-center gap-1 text-white opacity-90 hover:opacity-100 text-sm bg-white/20 px-3 py-1 rounded-full">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              Llamar
            </a>
            <a href="https://wa.me/${client.phone.replace(/\D/g,'')}" target="_blank" class="flex items-center gap-1 text-white opacity-90 hover:opacity-100 text-sm bg-white/20 px-3 py-1 rounded-full">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>
      `;

      // 1. Licencias
      html += `<h3 class="font-bold text-lg mb-3">Licencias</h3>`;
      if (licenses.length === 0) {
        html += `<div class="card p-4 text-center text-gray-500">No hay licencias</div>`;
      } else {
        html += `<div class="flex flex-col gap-3 mb-6">`;
        for (const l of licenses) {
          const typeIcon = l.type === 'PC' 
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`;
            
          const statusBadge = l.status === 'active' 
            ? `<span class="badge badge-success">Activa</span>` 
            : `<span class="badge badge-danger">Suspendida</span>`;

          html += `
            <div class="card p-4">
              <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded bg-primary-100 text-primary-600 flex items-center justify-center">
                    ${typeIcon}
                  </div>
                  <div>
                    <div class="font-bold text-gray-800">${l.code}</div>
                    <div class="text-xs text-gray-500 mt-1">Dispositivo: ${l.device_code}</div>
                  </div>
                </div>
                ${statusBadge}
              </div>
              <div class="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button class="btn btn-outline btn-sm flex-1" onclick="window.clientDetailPage.toggleStatus(${l.id}, '${l.code}', '${l.status}')">
                  ${l.status === 'active' ? 'Suspender' : 'Reactivar'}
                </button>
              </div>
            </div>
          `;
        }
        html += `</div>`;
      }

      // 2. Historial de Pagos
      html += `<div class="flex justify-between items-center mb-3 mt-6">
                <h3 class="font-bold text-lg">Historial de Pagos</h3>
                <button class="btn btn-ghost btn-sm text-primary" style="width:auto" onclick="window.clientDetailPage.addPayment(${client.id})">Añadir Pago</button>
               </div>`;
               
      if (payments.length === 0) {
        html += `<div class="card p-4 text-center text-gray-500">No hay pagos registrados</div>`;
      } else {
        html += `<div class="card p-0 overflow-hidden">`;
        // Sort payments: un-paid first, then by due_date
        const sortedPayments = payments.sort((a,b) => {
          if (a.paid !== b.paid) return a.paid ? 1 : -1;
          return new Date(a.due_date) - new Date(b.due_date);
        });
        
        for (const p of sortedPayments) {
          const isOverdue = !p.paid && new Date(p.due_date) < new Date();
          
          html += `
            <div class="p-4 border-b border-gray-100 last:border-b-0 flex justify-between items-center">
              <div>
                <div class="font-semibold ${!p.paid ? 'text-gray-900' : 'text-gray-500 line-through'}">
                  ${p.concept}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  Vence: <span class="${isOverdue ? 'text-danger font-bold' : ''}">${window.format.date(p.due_date)}</span>
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold ${!p.paid ? '' : 'text-gray-400'}">${window.format.currency(p.amount)}</div>
                ${!p.paid 
                  ? `<button class="btn btn-primary btn-sm mt-2 py-1 px-3" onclick="window.clientDetailPage.markPaid(${p.id})">Cobrar</button>`
                  : `<span class="badge badge-gray mt-1">Pagado ${window.format.date(p.paid_date)}</span>`
                }
              </div>
            </div>
          `;
        }
        html += `</div>`;
      }

      container.innerHTML = html;
      
    } catch (e) {
      console.error(e);
      document.getElementById('clientDetailContainer').innerHTML = `<div class="p-6 text-center text-danger">Error: ${e.message}</div>`;
    }
  },

  markPaid: async (paymentId) => {
    window.modal.show({
      title: 'Confirmar Cobro',
      content: '¿Estás seguro que deseas marcar esta cuota como pagada? Esta acción no se puede deshacer.',
      confirmText: 'Sí, cobrar',
      onConfirm: async () => {
        try {
          const p = await db.payments.get(paymentId);
          p.paid = true;
          p.paid_date = new Date().toISOString();
          await db.payments.put(p);
          
          // Refrescar página
          const clientId = p.client_id;
          await window.clientDetailPage.init(clientId);
          window.toast.success('Pago registrado', 'La cuota ha sido marcada como pagada.');
        } catch (e) {
          window.toast.error('Error', e.message);
        }
      }
    });
  },
  
  toggleStatus: async (localId, code, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const actionName = newStatus === 'active' ? 'Reactivar' : 'Suspender';
    
    window.modal.show({
      title: `${actionName} Licencia`,
      content: `¿Deseas ${actionName.toLowerCase()} la licencia <b>${code}</b>?<br><br>Esto se actualizará inmediatamente en GitHub y afectará al dispositivo del cliente.`,
      confirmText: actionName,
      onConfirm: async () => {
        try {
          // Update GitHub
          const file = await window.githubAPI.getLicensesFile();
          let content = file.content;
          const idx = content.licenses.findIndex(l => l.code === code);
          if (idx === -1) throw new Error("Licencia no encontrada en GitHub");
          
          content.licenses[idx].status = newStatus;
          
          await window.githubAPI.updateLicensesFile(content, file.sha, `${actionName} licencia: ${code}`);
          
          // Update Local
          const localLicense = await db.licenses.get(localId);
          localLicense.status = newStatus;
          await db.licenses.put(localLicense);
          
          // Refrescar
          await window.clientDetailPage.init(localLicense.client_id);
          window.toast.success('Actualizado', `La licencia ha sido ${newStatus === 'active' ? 'reactivada' : 'suspendida'}.`);
        } catch (e) {
          window.toast.error('Error al actualizar', e.message);
          return true; // Keep modal open
        }
      }
    });
  },
  
  addPayment: async (clientId) => {
    // Simple direct addition for Maintenance fee
    window.modal.show({
      title: 'Añadir Pago de Mantenimiento',
      content: 'Se generará una cuota de $15.00 USD por mantenimiento anual que vence hoy.',
      confirmText: 'Crear Pago',
      onConfirm: async () => {
        try {
          const now = new Date().toISOString();
          await db.payments.add({
            client_id: clientId,
            license_id: null,
            concept: 'Mantenimiento Anual',
            amount: 15.00, // USD conceptually, UI shows S/ for now - can be improved
            currency: 'USD',
            due_date: now,
            paid: false,
            created_at: now
          });
          await window.clientDetailPage.init(clientId);
          window.toast.success('Pago Creado', 'Se ha añadido la cuota al historial.');
        } catch (e) {
          window.toast.error('Error', e.message);
        }
      }
    });
  }
};
