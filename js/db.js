// Local Database using Dexie.js
const db = new Dexie("GestorLicenciasDB");

db.version(1).stores({
  clients: '++id, business_name, owner_name, phone, address, created_at',
  licenses: '++id, client_id, code, type, device_code, status, purchase_date',
  payments: '++id, client_id, license_id, concept, due_date, paid'
});

window.dbAPI = {
  // Clients
  getAllClients: async () => await db.clients.orderBy('created_at').reverse().toArray(),
  getClient: async (id) => await db.clients.get(id),
  saveClient: async (data) => await db.clients.put({ ...data, updated_at: new Date().toISOString() }),
  searchClients: async (query) => {
    if (!query) return await window.dbAPI.getAllClients();
    const q = query.toLowerCase();
    return await db.clients.filter(c => 
      (c.business_name && c.business_name.toLowerCase().includes(q)) || 
      (c.owner_name && c.owner_name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    ).toArray();
  },

  // Licenses
  getLicensesByClient: async (clientId) => await db.licenses.where('client_id').equals(clientId).toArray(),
  getLicenseByCode: async (code) => {
    const licenses = await db.licenses.where('code').equals(code).toArray();
    return licenses.length > 0 ? licenses[0] : null;
  },
  saveLicense: async (data) => await db.licenses.put(data),
  getAllLicenses: async () => await db.licenses.toArray(),

  // Payments
  getPaymentsByClient: async (clientId) => await db.payments.where('client_id').equals(clientId).toArray(),
  getPaymentsByLicense: async (licenseId) => await db.payments.where('license_id').equals(licenseId).toArray(),
  savePayment: async (data) => await db.payments.put(data),
  getPendingPayments: async () => await db.payments.filter(p => !p.paid).toArray(),
  
  // Stats
  getDashboardStats: async () => {
    const licenses = await db.licenses.toArray();
    const active = licenses.filter(l => l.status === 'active');
    const pc = licenses.filter(l => l.type === 'PC');
    const mobile = licenses.filter(l => l.type === 'Móvil');
    
    const pendingPayments = await db.payments.filter(p => !p.paid).toArray();
    
    // Check maintenance renewals in next 30 days
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);
    
    const maintenancePayments = await db.payments.filter(p => 
      p.concept === 'Mantenimiento' && 
      !p.paid && 
      new Date(p.due_date) <= nextMonth
    ).toArray();

    return {
      totalActive: active.length,
      pcCount: pc.length,
      mobileCount: mobile.length,
      pendingCount: pendingPayments.length,
      renewalsCount: maintenancePayments.length,
      pendingPayments,
      maintenancePayments
    };
  }
};
