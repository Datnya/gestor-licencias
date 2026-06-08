// New License Page
window.newLicensePage = {
  render: async () => {
    return `
      <div class="page-content pb-20">
        <h2 class="font-bold text-xl mb-6">Nueva Licencia</h2>
        
        <div id="newLicenseWizard">
          <!-- Paso 1 -->
          <div class="card wizard-step active" id="step1">
            <h3 class="font-semibold mb-4 text-center">Tipo de Licencia</h3>
            <div class="grid grid-cols-2 gap-4">
              <button class="btn btn-outline flex flex-col items-center py-6 h-auto" onclick="window.newLicensePage.selectType('PC')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" class="mb-2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                <span>Computadora</span>
              </button>
              <button class="btn btn-outline flex flex-col items-center py-6 h-auto" onclick="window.newLicensePage.selectType('Móvil')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" class="mb-2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                <span>Celular</span>
              </button>
            </div>
          </div>
          
          <!-- Paso 2 -->
          <div class="card wizard-step" id="step2" style="display:none">
            <h3 class="font-semibold mb-4 text-center">Datos del Cliente</h3>
            <div class="form-group">
              <label class="form-label">Nombre del Negocio (Lavandería)</label>
              <input type="text" id="nlBusiness" class="form-input" placeholder="Ej: Lavandería Burbujas">
            </div>
            <div class="form-group">
              <label class="form-label">Nombre del Dueño/Contacto</label>
              <input type="text" id="nlOwner" class="form-input" placeholder="Ej: Juan Pérez">
            </div>
            <div class="form-group">
              <label class="form-label">Teléfono (WhatsApp)</label>
              <input type="tel" id="nlPhone" class="form-input" placeholder="Ej: +51 987654321">
            </div>
            <div class="form-group">
              <label class="form-label">Dirección</label>
              <input type="text" id="nlAddress" class="form-input" placeholder="Opcional">
            </div>
            <button class="btn btn-primary" onclick="window.newLicensePage.nextStep(3)">Continuar</button>
          </div>
          
          <!-- Paso 3 -->
          <div class="card wizard-step" id="step3" style="display:none">
            <h3 class="font-semibold mb-4 text-center">Código de Dispositivo</h3>
            <div class="text-sm text-gray-500 mb-4 text-center" id="nlDeviceHelp">
              Pídele al cliente el código que aparece en su pantalla de activación.
            </div>
            <div class="form-group">
              <label class="form-label">Código de Dispositivo</label>
              <input type="text" id="nlDevice" class="form-input text-center text-lg font-bold" placeholder="MOB-XXXXXXXXX" style="text-transform:uppercase">
            </div>
            <button class="btn btn-primary mt-4" id="btnVerifyDevice" onclick="window.newLicensePage.verifyDevice()">Validar y Continuar</button>
          </div>
          
          <!-- Paso 4 -->
          <div class="card wizard-step" id="step4" style="display:none">
            <h3 class="font-semibold mb-4 text-center">Plan de Pago</h3>
            <div class="text-sm text-gray-500 mb-4 text-center">Selecciona cómo pagará el cliente (Total S/ 200)</div>
            
            <div class="flex flex-col gap-3">
              <label class="card p-4 m-0 border border-primary-500 bg-primary-50 flex items-center gap-3 cursor-pointer" id="optPagoTotal" onclick="window.newLicensePage.selectPayment('total')">
                <input type="radio" name="payPlan" value="total" checked class="w-5 h-5 accent-primary-600">
                <div class="flex-1">
                  <div class="font-bold">Pago Único</div>
                  <div class="text-sm text-gray-600">S/ 200.00 ahora</div>
                </div>
              </label>
              
              <label class="card p-4 m-0 border border-gray-200 cursor-pointer" id="optPagoCuotas" onclick="window.newLicensePage.selectPayment('cuotas')">
                <div class="flex items-center gap-3">
                  <input type="radio" name="payPlan" value="cuotas" class="w-5 h-5 accent-primary-600">
                  <div class="flex-1">
                    <div class="font-bold">2 Cuotas</div>
                    <div class="text-sm text-gray-600">S/ 100 ahora y S/ 100 en 1 mes</div>
                  </div>
                </div>
              </label>
            </div>
            
            <button class="btn btn-primary mt-6" onclick="window.newLicensePage.createLicense()">Finalizar y Crear Licencia</button>
          </div>
          
          <!-- Paso 5 (Éxito) -->
          <div class="card wizard-step text-center" id="step5" style="display:none">
            <div class="w-16 h-16 bg-success-light text-success rounded-full flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="32"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 class="font-bold text-2xl mb-2 text-success">¡Licencia Creada!</h3>
            <p class="text-gray-500 mb-6">Dictale este código a tu cliente para que active su aplicación.</p>
            
            <div class="bg-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300 mb-6 relative">
              <div class="text-3xl font-bold font-mono text-gray-900" id="nlResultCode" style="letter-spacing:2px">LAV-XXXX-XXXX</div>
            </div>
            
            <button class="btn btn-primary w-full" onclick="window.app.navigate('/clients')">Ir a Mis Clientes</button>
          </div>
        </div>
      </div>
    `;
  },

  state: {
    type: null,
    client: {},
    deviceCode: null,
    paymentPlan: 'total'
  },

  init: async () => {
    // Reset wizard UI
    document.querySelectorAll('.wizard-step').forEach(el => el.style.display = 'none');
    document.getElementById('step1').style.display = 'block';
    
    // Check GitHub connection first
    if (!window.githubAPI.hasToken()) {
      window.toast.warning('Sin Configuración', 'Debes configurar tu Token de GitHub primero.');
      setTimeout(() => window.app.navigate('/settings'), 1500);
    }
  },

  selectType: (type) => {
    window.newLicensePage.state.type = type;
    const isMobile = type === 'Móvil';
    
    document.getElementById('nlDevice').placeholder = isMobile ? 'Ej: MOB-ABC123XYZ' : 'Ej: E2A4C9F1...';
    document.getElementById('nlDeviceHelp').textContent = isMobile 
      ? 'Pídele al cliente el código MOB-XXXXXXXX que aparece en su pantalla.'
      : 'Pídele al cliente el Hash de Dispositivo de su computadora.';
      
    window.newLicensePage.nextStep(2);
  },
  
  selectPayment: (plan) => {
    window.newLicensePage.state.paymentPlan = plan;
    document.getElementById('optPagoTotal').className = 'card p-4 m-0 border cursor-pointer flex items-center gap-3 ' + (plan==='total' ? 'border-primary-500 bg-primary-50' : 'border-gray-200');
    document.getElementById('optPagoCuotas').className = 'card p-4 m-0 border cursor-pointer ' + (plan==='cuotas' ? 'border-primary-500 bg-primary-50' : 'border-gray-200');
  },

  nextStep: (step) => {
    // Validation
    if (step === 3) {
      const bname = document.getElementById('nlBusiness').value.trim();
      const owner = document.getElementById('nlOwner').value.trim();
      if (!bname || !owner) {
        window.toast.error('Atención', 'El nombre del negocio y el dueño son obligatorios.');
        return;
      }
      window.newLicensePage.state.client = {
        business_name: bname,
        owner_name: owner,
        phone: document.getElementById('nlPhone').value.trim(),
        address: document.getElementById('nlAddress').value.trim()
      };
    }
    
    document.querySelectorAll('.wizard-step').forEach(el => el.style.display = 'none');
    document.getElementById(`step${step}`).style.display = 'block';
  },
  
  verifyDevice: async () => {
    const code = document.getElementById('nlDevice').value.trim().toUpperCase();
    if (!code) {
      window.toast.error('Error', 'Ingresa el código del dispositivo');
      return;
    }
    
    const btn = document.getElementById('btnVerifyDevice');
    btn.textContent = 'Verificando...';
    btn.disabled = true;
    
    try {
      const isUsed = await window.githubAPI.isDeviceUsed(code);
      if (isUsed) {
        window.toast.error('Error', 'Este dispositivo ya está vinculado a otra licencia.');
        btn.textContent = 'Validar y Continuar';
        btn.disabled = false;
        return;
      }
      
      window.newLicensePage.state.deviceCode = code;
      window.newLicensePage.nextStep(4);
    } catch (e) {
      window.toast.error('Error de Conexión', e.message);
    }
    btn.textContent = 'Validar y Continuar';
    btn.disabled = false;
  },
  
  createLicense: async () => {
    const s = window.newLicensePage.state;
    const prefix = s.type === 'Móvil' ? 'LAV-MOB-' : 'LAV-PC-';
    // Generate code: LAV-MOB-ABCD-1234
    const p1 = Math.random().toString(36).substr(2,4).toUpperCase();
    const p2 = Math.random().toString(36).substr(2,4).toUpperCase();
    const licenseCode = `${prefix}${p1}-${p2}`;
    
    const btn = document.querySelector('#step4 .btn-primary');
    btn.textContent = 'Sincronizando con GitHub...';
    btn.disabled = true;
    
    try {
      // 1. Guardar Cliente en Local
      const clientId = await db.clients.add({
        ...s.client,
        created_at: new Date().toISOString()
      });
      
      // 2. Guardar Licencia en GitHub
      const ghLicense = {
        code: licenseCode,
        client_name: s.client.business_name,
        activated_device: s.deviceCode,
        status: "active"
      };
      await window.githubAPI.addLicense(ghLicense);
      
      // 3. Guardar Licencia en Local
      const now = new Date().toISOString();
      const licenseId = await db.licenses.add({
        client_id: clientId,
        code: licenseCode,
        type: s.type,
        device_code: s.deviceCode,
        status: 'active',
        purchase_date: now
      });
      
      // 4. Guardar Pagos en Local
      if (s.paymentPlan === 'total') {
        await db.payments.add({
          client_id: clientId, license_id: licenseId,
          concept: 'Compra de Software (Pago Único)',
          amount: 200, currency: 'PEN',
          due_date: now, paid: true, paid_date: now
        });
      } else {
        // Cuota 1
        await db.payments.add({
          client_id: clientId, license_id: licenseId,
          concept: 'Cuota 1/2',
          amount: 100, currency: 'PEN',
          due_date: now, paid: true, paid_date: now
        });
        // Cuota 2
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        await db.payments.add({
          client_id: clientId, license_id: licenseId,
          concept: 'Cuota 2/2',
          amount: 100, currency: 'PEN',
          due_date: nextMonth.toISOString(), paid: false
        });
      }
      
      // Generate Next Year Maintenance
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      await db.payments.add({
        client_id: clientId, license_id: licenseId,
        concept: 'Mantenimiento Anual',
        amount: 15, currency: 'USD',
        due_date: nextYear.toISOString(), paid: false
      });
      
      // Mostrar Éxito
      document.getElementById('nlResultCode').textContent = licenseCode;
      window.newLicensePage.nextStep(5);
      
    } catch (e) {
      window.toast.error('Error al crear', e.message);
      btn.textContent = 'Finalizar y Crear Licencia';
      btn.disabled = false;
    }
  }
};
