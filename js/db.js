// Local Database using Dexie.js
const db = new Dexie("GestorLicenciasDB");

db.version(2).stores({
  clients: '++id, business_name, owner_name, phone, address, created_at',
  licenses: '++id, client_id, software_id, code, type, device_code, status, purchase_date',
  payments: '++id, client_id, license_id, software_id, concept, due_date, paid',
  software: '++id, name, repo_path, default_price, active'
});

db.version(3).stores({
  clients: '++id, business_name, owner_name, phone, address, created_at',
  licenses: '++id, client_id, software_id, code, type, device_code, status, purchase_date',
  payments: '++id, client_id, license_id, software_id, concept, due_date, paid',
  software: '++id, name, repo_path, default_price, maintenance_price, active'
});

// Initialize default software if empty
db.on('populate', () => {
  db.software.bulkAdd([
    { name: 'Control de Lavandería', repo_path: 'Datnya/controlavander-a', default_price: 200, maintenance_price: 15, active: 1 },
    { name: 'Control de Estacionamiento', repo_path: 'Datnya/control-estacionamiento', default_price: 300, maintenance_price: 15, active: 1 }
  ]);
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
    
    // Group by software
    const software = await db.software.toArray();
    const softwareCounts = {};
    for (const sw of software) {
      softwareCounts[sw.name] = licenses.filter(l => l.software_id === sw.id).length;
    }
    
    const pendingPayments = await db.payments.filter(p => !p.paid).toArray();
    
    // Check maintenance renewals in next 30 days
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);
    
    const maintenancePayments = await db.payments.filter(p => 
      p.concept && p.concept.includes('Mantenimiento') && 
      !p.paid && 
      new Date(p.due_date) <= nextMonth
    ).toArray();

    return {
      totalActive: active.length,
      softwareCounts,
      pendingCount: pendingPayments.length,
      renewalsCount: maintenancePayments.length,
      pendingPayments,
      maintenancePayments
    };
  },
  
  // Software Catalog
  getAllSoftware: async () => await db.software.where('active').equals(1).toArray(),
  getSoftware: async (id) => await db.software.get(id),
  saveSoftware: async (data) => await db.software.put(data)
};
