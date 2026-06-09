// New License Page
window.newLicensePage = {
  render: async () => {
    return `
      <div class="page-content pb-20">
        <h2 class="font-bold text-xl mb-6">Nueva Licencia</h2>
        
        <div id="newLicenseWizard">
          <!-- Paso 0: Selección de Software -->
          <div class="card wizard-step active" id="step0">
            <h3 class="font-semibold mb-4 text-center">Software a Vender</h3>
            <div class="form-group">
              <label class="form-label">Selecciona el Software</label>
              <select id="nlSoftware" class="form-select">
                <option value="">Cargando catálogo...</option>
              </select>
            </div>
            <button class="btn btn-primary mt-2" onclick="window.newLicensePage.nextStep(1)">Continuar</button>
          </div>

          <!-- Paso 1 -->
          <div class="card wizard-step" id="step1" style="display:none">
            <h3 class="font-bold mb-4">¿Tipo de Licencia?</h3>
            <div class="flex flex-col gap-4">
              <button class="card p-4 text-left border-2 border-transparent" id="btnTypePC" onclick="window.newLicensePage.selectType('PC', this)">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                  </div>
                  <div>
                    <div class="font-bold">Computadora (Windows)</div>
                    <div class="text-xs text-gray-500">Se genera código automático</div>
                  </div>
                </div>
              </button>
              <button class="card p-4 text-left border-2 border-transparent" id="btnTypeMobile" onclick="window.newLicensePage.selectType('Móvil', this)">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                  </div>
                  <div>
                    <div class="font-bold">Celular (Android)</div>
                    <div class="text-xs text-gray-500">Requiere código del dispositivo</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
          
          <!-- Paso 2 -->
          <div class="card wizard-step" id="step2" style="display:none">
            <h3 class="font-semibold mb-4 text-center">Datos del Cliente</h3>
            <div class="form-group">
              <label class="form-label">Nombre del Negocio</label>
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
          <div id="step3" style="display:none" class="animation-fade">
            <h3 class="font-bold mb-4">Código del Dispositivo</h3>
            <div id="deviceCodeInputContainer">
              <p class="text-sm text-gray-500 mb-4">Ingresa el código que aparece en la pantalla del celular del cliente.</p>
              <div class="form-group">
                <input type="text" id="newLicenseDevice" class="form-input text-center text-xl tracking-widest font-mono" placeholder="DEV-XXXXXX" maxlength="10">
              </div>
            </div>
            <div id="deviceCodeAutoContainer" style="display:none">
              <p class="text-sm text-gray-500 mb-4">La licencia para PC se genera de forma automática. No necesitas ingresar ningún código del dispositivo.</p>
              <div class="p-4 bg-primary-50 text-primary-700 text-center rounded-lg font-mono mb-4 text-sm">Autogenerado al guardar</div>
            </div>
            
            <div class="flex gap-3 mt-6">
              <button class="btn btn-primary w-full" id="btnVerifyDevice" onclick="window.newLicensePage.verifyDevice()">Validar y Continuar</button>
            </div>
          </div>
          
          <!-- Paso 4 -->
          <div class="card wizard-step" id="step4" style="display:none">
            <h3 class="font-semibold mb-4 text-center">Plan de Pago</h3>
            <div class="text-sm text-gray-500 mb-4 text-center">Configura el precio y el plan de pago.</div>
            
            <div class="form-group">
              <label class="form-label">Monto Total de Venta (S/)</label>
              <input type="number" id="nlPrice" class="form-input" value="200" onchange="window.newLicensePage.updatePrices()">
            </div>

            <div class="form-group">
              <label class="form-label">Mantenimiento Anual (USD)</label>
              <input type="number" id="nlMaintenance" class="form-input" value="15">
            </div>

            <label class="form-label mt-6 mb-2">Forma de Pago</label>
            <div class="flex flex-col gap-3">
              <label class="card p-4 m-0 border border-primary-500 bg-primary-50 flex items-center gap-3 cursor-pointer" id="optPagoTotal" onclick="window.newLicensePage.selectPayment('total')">
                <input type="radio" name="payPlan" value="total" checked class="w-5 h-5 accent-primary-600">
                <div class="flex-1">
                  <div class="font-bold">Pago Único</div>
                  <div class="text-sm text-gray-600" id="lblTotalAmount">S/ 200.00 ahora</div>
                </div>
              </label>
              
              <label class="card p-4 m-0 border border-gray-200 cursor-pointer" id="optPagoCuotas" onclick="window.newLicensePage.selectPayment('cuotas')">
                <div class="flex items-center gap-3">
                  <input type="radio" name="payPlan" value="cuotas" class="w-5 h-5 accent-primary-600">
                  <div class="flex-1">
                    <div class="font-bold">2 Cuotas</div>
                    <div class="text-sm text-gray-600" id="lblCuotasAmount">S/ 100 ahora y S/ 100 en 1 mes</div>
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
            <p class="text-gray-500 mb-6" id="lblSuccessMsg">Dictale este código a tu cliente para que active su aplicación.</p>
            
            <div class="bg-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300 mb-4 relative">
              <div class="text-3xl font-bold font-mono text-gray-900" id="nlResultCode" style="letter-spacing:2px">LAV-XXXX-XXXX</div>
            </div>
            
            <button class="btn btn-outline w-full mb-6" id="btnCopyCode" onclick="window.newLicensePage.copyCode()">Copiar Código</button>
            
            <button class="btn btn-primary w-full" onclick="window.app.navigate('/clients')">Ir a Mis Clientes</button>
          </div>
        </div>
      </div>
    `;
  },

  state: {
    softwareId: null,
    software: null,
    type: null,
    client: {},
    deviceCode: null,
    paymentPlan: 'total',
    price: 200,
    maintenance: 15
  },

  init: async () => {
    document.querySelectorAll('.wizard-step').forEach(el => el.style.display = 'none');
    document.getElementById('step0').style.display = 'block';
    
    if (!window.githubAPI.hasToken()) {
      window.toast.warning('Sin Configuración', 'Debes configurar tu Token de GitHub primero.');
      setTimeout(() => window.app.navigate('/settings'), 1500);
      return;
    }

    try {
      const softwares = await window.dbAPI.getAllSoftware();
      const select = document.getElementById('nlSoftware');
      if (softwares.length === 0) {
        select.innerHTML = '<option value="">No hay software registrado</option>';
        window.toast.warning('Catálogo vacío', 'Registra al menos un software en Ajustes.');
      } else {
        select.innerHTML = softwares.map(sw => `<option value="${sw.id}">${sw.name}</option>`).join('');
      }
    } catch (e) {
      console.error(e);
    }
  },

  selectType: (type, el) => {
    window.newLicensePage.state.type = type;
    document.querySelectorAll('#step1 button').forEach(b => b.classList.remove('border-primary-500', 'bg-primary-50'));
    el.classList.add('border-primary-500', 'bg-primary-50');
    
    // Configurar vista del Step 3 basado en el tipo
    const inputContainer = document.getElementById('deviceCodeInputContainer');
    const autoContainer = document.getElementById('deviceCodeAutoContainer');
    
    if (type === 'PC') {
      inputContainer.style.display = 'none';
      autoContainer.style.display = 'block';
    } else {
      inputContainer.style.display = 'block';
      autoContainer.style.display = 'none';
    }
    window.newLicensePage.nextStep(2);
  },
  
  selectPayment: (plan) => {
    window.newLicensePage.state.paymentPlan = plan;
    document.getElementById('optPagoTotal').className = 'card p-4 m-0 border cursor-pointer flex items-center gap-3 ' + (plan==='total' ? 'border-primary-500 bg-primary-50' : 'border-gray-200');
    document.getElementById('optPagoCuotas').className = 'card p-4 m-0 border cursor-pointer ' + (plan==='cuotas' ? 'border-primary-500 bg-primary-50' : 'border-gray-200');
  },

  updatePrices: () => {
    const val = parseFloat(document.getElementById('nlPrice').value) || 0;
    window.newLicensePage.state.price = val;
    
    const half = (val / 2).toFixed(2);
    document.getElementById('lblTotalAmount').textContent = `S/ ${val.toFixed(2)} ahora`;
    document.getElementById('lblCuotasAmount').textContent = `S/ ${half} ahora y S/ ${half} en 1 mes`;
  },

  nextStep: async (step) => {
    if (step === 1) {
      const swId = parseInt(document.getElementById('nlSoftware').value);
      if (!swId) {
        window.toast.error('Error', 'Selecciona un software'); return;
      }
      const software = await window.dbAPI.getSoftware(swId);
      window.newLicensePage.state.softwareId = swId;
      window.newLicensePage.state.software = software;
      document.getElementById('nlPrice').value = software.default_price;
      window.newLicensePage.updatePrices();
    }
    
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
    
    document.querySelectorAll('.wizard-step, #step3').forEach(el => el.style.display = 'none');
    document.getElementById(`step${step}`).style.display = 'block';
  },
  
  verifyDevice: async () => {
    let deviceCode = document.getElementById('newLicenseDevice').value.trim().toUpperCase();
    
    if (window.newLicensePage.state.type === 'PC') {
      deviceCode = 'PC-AUTO';
    } else if (!deviceCode) {
      window.toast.error('Error', 'Ingresa el código del dispositivo');
      return;
    }
    
    const btn = document.getElementById('btnVerifyDevice');
    btn.textContent = 'Verificando...';
    btn.disabled = true;
    
    try {
      const sw = window.newLicensePage.state.software;
      const isUsed = window.newLicensePage.state.type !== 'PC' && await window.githubAPI.isDeviceUsed(sw.repo_path, deviceCode);
      if (isUsed) {
        window.toast.error('Error', 'Este dispositivo ya está vinculado a otra licencia en este repositorio.');
        btn.textContent = 'Validar y Continuar';
        btn.disabled = false;
        return;
      }
      
      window.newLicensePage.state.deviceCode = deviceCode;
      window.newLicensePage.nextStep(4);
    } catch (e) {
      window.toast.error('Error de Conexión', e.message);
    }
    btn.textContent = 'Validar y Continuar';
    btn.disabled = false;
  },
  
  createLicense: async () => {
    const s = window.newLicensePage.state;
    // Prefix for code based on software. Let's use first 3 letters of software name
    const swPrefix = s.software.name.substring(0,3).toUpperCase();
    const typePrefix = s.type === 'Móvil' ? 'MOB' : 'PC';
    
    const p1 = Math.random().toString(36).substr(2,4).toUpperCase();
    const p2 = Math.random().toString(36).substr(2,4).toUpperCase();
    const licenseCode = `${swPrefix}-${typePrefix}-${p1}-${p2}`;
    
    const btn = document.querySelector('#step4 .btn-primary');
    btn.textContent = 'Sincronizando con GitHub...';
    btn.disabled = true;
    
    try {
      const clientId = await db.clients.add({
        ...s.client,
        created_at: new Date().toISOString()
      });
      
      const ghLicense = {
        code: licenseCode,
        client_name: s.client.business_name,
        activated_device: s.deviceCode,
        status: "active"
      };
      await window.githubAPI.addLicense(s.software.repo_path, ghLicense);
      
      const now = new Date().toISOString();
      const licenseId = await db.licenses.add({
        client_id: clientId,
        software_id: s.softwareId,
        code: licenseCode,
        type: s.type,
        device_code: s.deviceCode,
        status: 'active',
        purchase_date: now
      });
      
      const totalPrice = s.price;
      const maintenance = parseFloat(document.getElementById('nlMaintenance').value) || 15;
      
      if (s.paymentPlan === 'total') {
        await db.payments.add({
          client_id: clientId, license_id: licenseId, software_id: s.softwareId,
          concept: 'Compra de Software (Pago Único)',
          amount: totalPrice, currency: 'PEN',
          due_date: now, paid: true, paid_date: now
        });
      } else {
        const half = totalPrice / 2;
        await db.payments.add({
          client_id: clientId, license_id: licenseId, software_id: s.softwareId,
          concept: 'Cuota 1/2',
          amount: half, currency: 'PEN',
          due_date: now, paid: true, paid_date: now
        });
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        await db.payments.add({
          client_id: clientId, license_id: licenseId, software_id: s.softwareId,
          concept: 'Cuota 2/2',
          amount: half, currency: 'PEN',
          due_date: nextMonth.toISOString(), paid: false
        });
      }
      
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      await db.payments.add({
        client_id: clientId, license_id: licenseId, software_id: s.softwareId,
        concept: 'Mantenimiento Anual',
        amount: maintenance, currency: 'USD',
        due_date: nextYear.toISOString(), paid: false
      });
      
      document.getElementById('nlResultCode').textContent = licenseCode;
      if (s.type === 'PC') {
        document.getElementById('lblSuccessMsg').textContent = 'Copia este código autogenerado y pásaselo a tu cliente para que active su programa en Windows.';
        document.getElementById('btnCopyCode').style.display = 'block';
      } else {
        document.getElementById('lblSuccessMsg').textContent = 'Dictale este código a tu cliente para que active su aplicación.';
        document.getElementById('btnCopyCode').style.display = 'block';
      }
      window.newLicensePage.nextStep(5);
      
    } catch (e) {
      window.toast.error('Error al crear', e.message);
      btn.textContent = 'Finalizar y Crear Licencia';
      btn.disabled = false;
    }
  },
  
  copyCode: () => {
    const code = document.getElementById('nlResultCode').textContent;
    navigator.clipboard.writeText(code);
    window.toast.success('Copiado', 'Código copiado al portapapeles');
  }
};
