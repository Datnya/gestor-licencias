// Client Detail Page
window.clientDetailPage = {
  render: async (id) => {
    return `
      <div class="page-content pb-20">
        <div class="mb-16">
          <button class="btn btn-ghost btn-sm pl-0 text-gray-500 hover:text-gray-800" onclick="window.app.navigate('/clients')" style="width:auto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Volver
          </button>
        </div>
        
        <div id="clientDetailContainer">
          <div class="text-center py-10"><div class="spinner mx-auto"></div></div>
        </div>
        
        <!-- Contenedor oculto para renderizar el recibo antes de convertirlo a imagen -->
        <div id="receiptRenderContainer" style="position: absolute; left: -9999px; top: 0;"></div>
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
          <div class="mt-2 text-sm" style="opacity:0.8">
            <div class="flex items-center gap-2 mt-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              ${client.phone || 'Sin teléfono'}
            </div>
            ${client.address ? `
            <div class="flex items-center gap-2 mt-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              ${client.address}
            </div>` : ''}
            <div class="flex items-center gap-2 mt-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Registrado: ${window.format?.date ? window.format.date(client.created_at) : (client.created_at || '-')}
            </div>
          </div>
          <div class="flex items-center gap-4 mt-4">
            <a href="tel:${client.phone}" class="flex items-center gap-1 text-white opacity-90 hover:opacity-100 text-sm bg-white/20 px-3 py-2 rounded-lg transition-all" style="background:rgba(255,255,255,0.15)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              Llamar
            </a>
            <a href="https://wa.me/${client.phone.replace(/\D/g,'')}" target="_blank" class="flex items-center gap-2 text-white opacity-90 hover:opacity-100 text-sm bg-white/20 px-3 py-2 rounded-lg transition-all" style="background:rgba(255,255,255,0.15)">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>
      `;

      // 1. Licencias Instaladas
      html += `<div class="section-header"><h3 class="section-title">Software Instalado (${licenses.length})</h3></div>`;
      if (licenses.length === 0) {
        html += `<div class="card p-4 text-center text-gray-500 mb-20">No hay licencias registradas</div>`;
      } else {
        html += `<div class="flex flex-col gap-3 mb-24">`;
        for (const l of licenses) {
          const software = await window.dbAPI.getSoftware(l.software_id);
          const swName = software ? software.name : 'Software Desconocido';
          const repoPath = software ? software.repo_path : null;
          
          const typeIcon = l.type === 'PC' 
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`;
            
          const statusBadge = l.status === 'active' 
            ? `<span class="badge badge-success">Activa</span>` 
            : `<span class="badge badge-danger">Suspendida</span>`;

          html += `
            <div class="card" style="padding:16px;margin-bottom:0">
              <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                    ${typeIcon}
                  </div>
                  <div>
                    <div class="font-bold text-gray-900">${l.code}</div>
                    <div class="text-xs text-primary-600 font-bold">${swName}</div>
                    <div class="text-xs text-gray-500 mt-1">Dispositivo: ${l.device_code}</div>
                  </div>
                </div>
                ${statusBadge}
              </div>
              <div class="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button class="btn btn-outline btn-sm flex-1" style="font-size:0.75rem" onclick="window.clientDetailPage.toggleStatus(${l.id}, '${l.code}', '${l.status}', '${repoPath}')">
                  ${l.status === 'active' ? 'Suspender' : 'Reactivar'}
                </button>
                <button class="btn btn-outline btn-sm flex-1" style="font-size:0.75rem" onclick="window.clientDetailPage.changeDevice(${l.id}, '${l.code}', '${l.device_code}', '${repoPath}')">
                  Cambiar Disp.
                </button>
              </div>
            </div>
          `;
        }
        html += `</div>`;
      }

      // 2. Historial de Pagos y Pendientes
      html += `
        <div class="section-header mt-8">
          <h3 class="section-title">Historial de Pagos</h3>
          <button class="btn btn-ghost btn-sm text-primary-600" style="width:auto;font-weight:700" onclick="window.clientDetailPage.addPayment(${client.id})">+ Añadir</button>
        </div>
      `;
               
      if (payments.length === 0) {
        html += `<div class="card p-4 text-center text-gray-500">No hay pagos registrados</div>`;
      } else {
        html += `<div class="card p-0 overflow-hidden mb-8">`;
        // Sort payments: un-paid first, then by due_date
        const sortedPayments = payments.sort((a,b) => {
          if (a.paid !== b.paid) return a.paid ? 1 : -1;
          return new Date(a.due_date) - new Date(b.due_date);
        });
        
        for (const p of sortedPayments) {
          const isOverdue = !p.paid && new Date(p.due_date) < new Date();
          
          let swName = 'General';
          if (p.software_id) {
            const sw = await window.dbAPI.getSoftware(p.software_id);
            if (sw) swName = sw.name;
          }
          
          html += `
            <div class="p-4 border-b border-gray-100 last:border-b-0 flex justify-between items-center ${!p.paid && isOverdue ? 'bg-danger-50' : ''}">
              <div>
                <div class="font-bold ${!p.paid ? 'text-gray-900' : 'text-gray-500 line-through'}">
                  ${p.concept}
                </div>
                <div class="text-xs text-primary-600 font-semibold mt-1">${swName}</div>
                <div class="text-xs text-gray-500 mt-1">
                  Vence: <span class="${isOverdue ? 'text-danger font-bold' : ''}">${window.format?.date ? window.format.date(p.due_date) : (p.due_date || '-')}</span>
                </div>
                ${p.paid ? `<div class="text-xs text-success mt-1">Pagado el: ${window.format?.date ? window.format.date(p.paid_date) : (p.paid_date || '-')}</div>` : ''}
              </div>
              <div class="text-right">
                <div class="font-bold text-lg ${!p.paid ? 'text-gray-900' : 'text-gray-400'}">
                  ${p.currency === 'USD' ? '$' : 'S/'}${parseFloat(p.amount).toFixed(2)}
                </div>
                ${!p.paid 
                  ? `<button class="btn btn-primary btn-sm mt-3 py-1 px-4" onclick="window.clientDetailPage.markPaid(${p.id})">Cobrar</button>`
                  : `<button class="btn btn-outline btn-sm mt-3 py-1 px-3 text-xs" onclick="window.clientDetailPage.generateReceipt(${p.id})">Ver Recibo</button>`
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
      content: '¿Estás seguro que deseas marcar este pago como completado?',
      confirmText: 'Sí, cobrar',
      onConfirm: async () => {
        try {
          const p = await db.payments.get(paymentId);
          p.paid = true;
          p.paid_date = new Date().toISOString();
          await db.payments.put(p);
          
          window.toast.success('Pago registrado', 'Generando recibo...');
          
          // Generar recibo automáticamente
          await window.clientDetailPage.generateReceipt(paymentId);
          
          // Refrescar página en el fondo
          const clientId = p.client_id;
          await window.clientDetailPage.init(clientId);
          
        } catch (e) {
          window.toast.error('Error', e.message);
        }
      }
    });
  },
  
  generateReceipt: async (paymentId) => {
    try {
      const p = await db.payments.get(paymentId);
      const c = await db.clients.get(p.client_id);
      let swName = 'Servicio';
      if (p.software_id) {
        const sw = await window.dbAPI.getSoftware(p.software_id);
        if (sw) swName = sw.name;
      }
      
      const isAdvance = p.concept.includes('Cuota 1/2') || p.concept.includes('Adelanto');
      const isBalance = p.concept.includes('Cuota 2/2') || p.concept.includes('Saldo');
      const isTotal = p.concept.includes('Pago Único');
      
      let conceptDesc = p.concept;
      if (isAdvance) conceptDesc += ' (Adelanto del 50%)';
      if (isBalance) conceptDesc += ' (Saldo pendiente 50%)';
      
      let renderContainer = document.getElementById('receiptRenderContainer');
      if (!renderContainer) {
        renderContainer = document.createElement('div');
        renderContainer.id = 'receiptRenderContainer';
        renderContainer.style.position = 'absolute';
        renderContainer.style.left = '-9999px';
        renderContainer.style.top = '0';
        document.body.appendChild(renderContainer);
      }
      const currencySymbol = p.currency === 'USD' ? '$' : 'S/';
      
      renderContainer.innerHTML = `
        <div id="receiptToRender" style="width:380px;background:white;padding:32px 24px;border-radius:12px;font-family:'Inter',sans-serif;color:#111827;">
          <div style="text-align:center;margin-bottom:24px">
            <h1 style="font-family:'Outfit',sans-serif;font-size:24px;font-weight:800;color:#f97316;margin:0;letter-spacing:1px">FOXY STUDIO</h1>
            <p style="font-size:12px;color:#6b7280;margin:4px 0 0 0">Software & Soluciones Digitales</p>
          </div>
          
          <div style="text-align:center;margin-bottom:24px">
            <h2 style="font-size:16px;font-weight:700;margin:0">COMPROBANTE DE PAGO</h2>
            <p style="font-size:12px;color:#6b7280;margin:4px 0 0 0">${window.format?.datetime ? window.format.datetime(p.paid_date) : (p.paid_date || '-')}</p>
          </div>
          
          <div style="border-top:2px dashed #e5e7eb;border-bottom:2px dashed #e5e7eb;padding:16px 0;margin-bottom:24px">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px">
              <span style="color:#6b7280">Cliente:</span>
              <span style="font-weight:600;text-align:right">${c.business_name}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px">
              <span style="color:#6b7280">Contacto:</span>
              <span style="font-weight:600;text-align:right">${c.owner_name}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px">
              <span style="color:#6b7280">Software:</span>
              <span style="font-weight:600;color:#ea580c;text-align:right">${swName}</span>
            </div>
          </div>
          
          <div style="margin-bottom:24px">
            <div style="font-weight:700;font-size:14px;margin-bottom:8px">Concepto:</div>
            <div style="font-size:13px;color:#374151;line-height:1.5">${conceptDesc}</div>
            ${p.details ? `
            <div style="font-weight:700;font-size:14px;margin-top:12px;margin-bottom:8px">Detalle Adicional:</div>
            <div style="font-size:13px;color:#374151;line-height:1.5">${p.details}</div>
            ` : ''}
          </div>
          
          <div style="background:#f9fafb;border-radius:8px;padding:16px;display:flex;justify-content:space-between;align-items:center">
            <span style="font-weight:700;font-size:16px">TOTAL PAGADO</span>
            <span style="font-weight:800;font-size:22px;color:#111827">${currencySymbol}${parseFloat(p.amount).toFixed(2)}</span>
          </div>
          
          ${isAdvance ? `
          <div style="text-align:center;margin-top:16px;font-size:12px;color:#ea580c;font-weight:600;background:#fff7ed;padding:8px;border-radius:6px">
            * Pendiente cancelar el 50% restante el próximo mes.
          </div>
          ` : ''}
          
          <div style="text-align:center;margin-top:32px;font-size:12px;color:#9ca3af">
            ¡Gracias por confiar en Foxy Studio!
          </div>
        </div>
      `;
      
      const receiptEl = document.getElementById('receiptToRender');
      const canvas = await html2canvas(receiptEl, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      
      // Construir mensaje de WhatsApp
      let msg = `Hola *${c.owner_name}*, te envío el comprobante de pago por el software *${swName}*.\n\nMonto pagado: *${currencySymbol}${parseFloat(p.amount).toFixed(2)}*.\nConcepto: ${conceptDesc}`;
      if (p.details) msg += `\nDetalle: ${p.details}`;
      if (isAdvance) {
        msg += `\n\n_Recuerda que queda pendiente el 50% para el próximo mes._`;
      }
      msg += `\n\n¡Gracias por confiar en Foxy Studio!`;
      
      const phoneClean = c.phone ? c.phone.replace(/\D/g,'') : '';
      const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`;
      
      // Mostrar modal con la imagen y el botón de WhatsApp
      window.modal.show({
        title: 'Comprobante Generado',
        content: `
          <div class="text-center mb-4">
            <img src="${imgData}" style="max-width:100%;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1)">
          </div>
          <div class="text-sm text-gray-500 text-center mb-4">
            Guarda esta imagen manteniéndola presionada, o envíala por WhatsApp.
          </div>
          <a href="${waUrl}" target="_blank" class="btn" style="background:#25D366;color:white;text-decoration:none;display:flex;justify-content:center;align-items:center;gap:8px;padding:12px">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            Enviar por WhatsApp
          </a>
        `,
        confirmText: 'Cerrar',
        onConfirm: () => {}
      });
      
    } catch (e) {
      window.toast.error('Error al generar recibo', e.message);
    }
  },
  
  toggleStatus: async (localId, code, currentStatus, repoPath) => {
    if (!repoPath || repoPath === 'null') {
      window.toast.error('Error', 'No se encontró el repositorio asociado a este software.');
      return;
    }
    
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const actionName = newStatus === 'active' ? 'Reactivar' : 'Suspender';
    
    window.modal.show({
      title: `${actionName} Licencia`,
      content: `¿Deseas ${actionName.toLowerCase()} la licencia <b>${code}</b>?<br><br>Esto se actualizará inmediatamente en GitHub y afectará al dispositivo del cliente.`,
      confirmText: actionName,
      onConfirm: async () => {
        try {
          const file = await window.githubAPI.getLicensesFile(repoPath);
          let content = file.content;
          const idx = content.licenses.findIndex(l => l.code === code);
          if (idx === -1) throw new Error("Licencia no encontrada en GitHub");
          
          content.licenses[idx].status = newStatus;
          content.licenses[idx].isActive = (newStatus === 'active');
          
          await window.githubAPI.updateLicensesFile(repoPath, content, file.sha, `${actionName} licencia: ${code}`);
          
          const localLicense = await db.licenses.get(localId);
          localLicense.status = newStatus;
          await db.licenses.put(localLicense);
          
          await window.clientDetailPage.init(localLicense.client_id);
          window.toast.success('Actualizado', `La licencia ha sido ${newStatus === 'active' ? 'reactivada' : 'suspendida'}. (Atención: El servidor puede tardar hasta 5 minutos en reflejar el cambio en la aplicación del cliente).`);
        } catch (e) {
          window.toast.error('Error al actualizar', e.message);
          return true;
        }
      }
    });
  },

  changeDevice: async (localId, code, currentDevice, repoPath) => {
    if (!repoPath || repoPath === 'null') {
      window.toast.error('Error', 'No se encontró el repositorio asociado a este software.');
      return;
    }

    window.modal.show({
      title: 'Cambiar Dispositivo',
      content: `
        <div class="form-group" style="margin-bottom:0">
          <label class="form-label text-sm font-semibold mb-2 block">Nuevo Código de Dispositivo</label>
          <input type="text" id="newDeviceCodeInput" class="form-input" style="width:100%; padding:10px; border-radius:8px; border:1px solid #d1d5db" placeholder="Ej. MOB-ABC123XYZ" value="${currentDevice || ''}">
          <p class="text-xs text-gray-500 mt-2">Pega aquí el nuevo código si el cliente desinstaló la app o cambió de equipo.</p>
        </div>
      `,
      confirmText: 'Actualizar',
      onConfirm: async () => {
        const newDevice = document.getElementById('newDeviceCodeInput').value.trim().toUpperCase();
        if(!newDevice) {
          window.toast.error('Error', 'El código de dispositivo no puede estar vacío');
          return true; // prevent close
        }

        try {
          const file = await window.githubAPI.getLicensesFile(repoPath);
          let content = file.content;
          const idx = content.licenses.findIndex(l => l.code === code);
          if (idx === -1) throw new Error("Licencia no encontrada en GitHub");
          
          content.licenses[idx].activated_device = newDevice;
          
          await window.githubAPI.updateLicensesFile(repoPath, content, file.sha, `Actualizado dispositivo para licencia: ${code}`);
          
          const localLicense = await db.licenses.get(localId);
          localLicense.device_code = newDevice;
          await db.licenses.put(localLicense);
          
          await window.clientDetailPage.init(localLicense.client_id);
          window.toast.success('Dispositivo Actualizado', 'El cliente ya puede ingresar a su aplicación con normalidad.');
        } catch (e) {
          window.toast.error('Error al actualizar', e.message);
          return true;
        }
      }
    });
  },
  
  
  addPayment: async (clientId) => {
    // Show a modal to choose payment type
    window.modal.show({
      title: 'Añadir Nuevo Cobro',
      content: `
        <div class="form-group">
          <label class="form-label">Concepto</label>
          <select id="newPayConcept" class="form-select">
            <option value="Mantenimiento anual">Mantenimiento anual</option>
            <option value="Cancelación del saldo pendiente">Cancelación del saldo pendiente</option>
            <option value="Implementación">Implementación</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Detalles (Opcional, sale en recibo)</label>
          <input type="text" id="newPayDetails" class="form-input" placeholder="Ej: Pago de servidor 2026...">
        </div>
        <div class="form-group">
          <label class="form-label">Monto</label>
          <input type="number" id="newPayAmount" class="form-input" value="0">
        </div>
        <div class="form-group">
          <label class="form-label">Moneda</label>
          <select id="newPayCurrency" class="form-select">
            <option value="PEN">Soles (S/)</option>
            <option value="USD">Dólares ($)</option>
          </select>
        </div>
      `,
      confirmText: 'Crear Cobro',
      onConfirm: async () => {
        try {
          const concept = document.getElementById('newPayConcept').value;
          const details = document.getElementById('newPayDetails').value.trim();
          const amount = parseFloat(document.getElementById('newPayAmount').value) || 0;
          const currency = document.getElementById('newPayCurrency').value;
          
          if (!concept || amount <= 0) {
            window.toast.error('Error', 'Ingresa un concepto y un monto válido.');
            return true;
          }
          
          const now = new Date().toISOString();
          await db.payments.add({
            client_id: clientId,
            license_id: null,
            software_id: null,
            concept: concept,
            details: details,
            amount: amount,
            currency: currency,
            due_date: now,
            paid: false,
            created_at: now
          });
          await window.clientDetailPage.init(clientId);
          window.toast.success('Cobro Creado', 'Se ha añadido al historial.');
        } catch (e) {
          window.toast.error('Error', e.message);
        }
      }
    });
  }
};
