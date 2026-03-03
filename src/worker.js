export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });

    try {
      // ────────────────────────────────────────────────
      // FRONTEND - HTML + JS completo
      // ────────────────────────────────────────────────
      if (url.pathname === "/" && request.method === "GET") {
        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BoatERP - Gestión de Alquiler</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; background:#f8fafc; color:#1e293b; }
    .sidebar { width:240px; height:100vh; background:#0f172a; color:#e2e8f0; position:fixed; padding:24px 16px; overflow-y:auto; }
    .sidebar h2 { margin-bottom:32px; font-size:1.5rem; }
    .menu-item { padding:12px 16px; border-radius:8px; margin-bottom:6px; cursor:pointer; transition:all .2s; display:flex; align-items:center; gap:12px; }
    .menu-item:hover { background:#1e293b; }
    .menu-item.active { background:#2563eb; color:white; }
    .header { margin-left:240px; height:68px; background:#1e40af; color:white; display:flex; align-items:center; justify-content:space-between; padding:0 32px; font-weight:600; }
    .content { margin-left:240px; padding:32px; }
    .card { background:white; padding:24px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.06); margin-bottom:24px; }
    .data-table { width:100%; border-collapse:collapse; }
    .data-table th, .data-table td { padding:12px 16px; text-align:left; border-bottom:1px solid #e2e8f0; }
    .data-table th { background:#f8fafc; font-weight:600; color:#475569; }
    .btn { padding:8px 16px; border:none; border-radius:6px; cursor:pointer; font-weight:500; margin-right:8px; }
    .btn-success { background:#22c55e; color:white; }
    .btn-danger { background:#ef4444; color:white; }
    .btn-outline { border:1px solid #cbd5e1; background:transparent; }
    .modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); justify-content:center; align-items:center; z-index:1000; }
    .modal-overlay.active { display:flex; }
    .modal-content { background:white; border-radius:12px; width:560px; max-width:92vw; max-height:90vh; overflow-y:auto; padding:24px; box-shadow:0 10px 30px rgba(0,0,0,0.2); }
    .toast { position:fixed; bottom:24px; right:24px; padding:14px 24px; border-radius:8px; color:white; opacity:0; transform:translateY(20px); transition:all .4s; z-index:2000; }
    .toast.show { opacity:1; transform:translateY(0); }
    .toast.success { background:#22c55e; }
    .toast.error { background:#ef4444; }
    .form-group { margin-bottom:16px; }
    .form-group label { display:block; margin-bottom:6px; color:#475569; font-weight:500; }
    .price-info { margin:16px 0; padding:16px; background:#f0f9ff; border:1px solid #bfdbfe; border-radius:8px; }
  </style>
</head>
<body>

<div class="sidebar">
  <h2>⚓ BoatERP</h2>
  <div class="menu-item active" onclick="loadSection('dashboard')">Dashboard</div>
  <div class="menu-item" onclick="loadSection('customers')">Clientes</div>
  <div class="menu-item" onclick="loadSection('boats')">Botes</div>
  <div class="menu-item" onclick="loadSection('reservations')">Reservas</div>
  <div class="menu-item" onclick="loadSection('invoices')">Facturación</div>
</div>

<div class="header">
  <div>Panel Administrativo - Alquiler de Embarcaciones</div>
  <div>Admin</div>
</div>

<div class="content" id="mainContent"></div>

<!-- Modal genérico -->
<div id="modalOverlay" class="modal-overlay">
  <div class="modal-content">
    <h3 id="modalTitle">Modal</h3>
    <div id="modalBody"></div>
    <div style="text-align:right; margin-top:24px;">
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn-success" id="modalSaveBtn">Guardar</button>
    </div>
  </div>
</div>

<div id="toast"></div>

<script>
  let currentSection = 'dashboard';

  function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast ' + type + ' show';
    setTimeout(() => t.className = 'toast', 4000);
  }

  function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
  }

  async function loadSection(section) {
    currentSection = section;
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    document.querySelector(\`.menu-item[onclick="loadSection('\${section}')"]\`).classList.add('active');

    const content = document.getElementById('mainContent');
    content.innerHTML = '<h2>Cargando ' + section + '...</h2>';

    if (section === 'dashboard') {
      content.innerHTML = \`
        <h2>Dashboard</h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:20px;">
          <div class="card"><h4>Ingresos Hoy</h4><h2 id="income">$0.00</h2></div>
          <div class="card"><h4>Reservas Activas</h4><h2 id="active">0</h2></div>
          <div class="card"><h4>Botes Disponibles</h4><h2 id="boats">0</h2></div>
          <div class="card"><h4>Total Clientes</h4><h2 id="customers">0</h2></div>
        </div>
        <div class="card">
          <button class="btn-success" onclick="showToast('Dashboard cargado correctamente', 'success')">Actualizar Datos</button>
        </div>
      \`;
    } else if (section === 'customers') {
      content.innerHTML = \`
        <h2>Clientes</h2>
        <div style="margin-bottom:16px;">
          <button class="btn-success" onclick="showModal('Nuevo Cliente', 'customer')">+ Nuevo Cliente</button>
        </div>
        <div class="card" id="customerList">Cargando clientes...</div>
      \`;
      loadCustomers();
    } else if (section === 'boats') {
      content.innerHTML = \`
        <h2>Botes</h2>
        <div style="margin-bottom:16px;">
          <button class="btn-success" onclick="showModal('Nuevo Bote', 'boat')">+ Nuevo Bote</button>
        </div>
        <div class="card" id="boatList">Cargando botes...</div>
      \`;
      loadBoats();
    } else if (section === 'reservations') {
      content.innerHTML = \`
        <h2>Reservas</h2>
        <div style="margin-bottom:16px;">
          <button class="btn-success" onclick="showModal('Nueva Reserva', 'reservation')">+ Nueva Reserva</button>
        </div>
        <div class="card" id="reservationList">Cargando reservas...</div>
      \`;
      loadReservations();
    } else if (section === 'invoices') {
      content.innerHTML = \`
        <h2>Facturación</h2>
        <div class="card" id="invoiceList">Cargando facturas...</div>
      \`;
      loadInvoices();
    }
  }

  async function loadCustomers() {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      const html = '<table><thead><tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Email</th><th></th></tr></thead><tbody>' +
        data.map(c => \`<tr>
          <td>\${c.full_name}</td>
          <td>\${c.document_id || '-'}</td>
          <td>\${c.phone || '-'}</td>
          <td>\${c.email || '-'}</td>
          <td><button class="btn-success" onclick="editCustomer(\${c.id})">Editar</button></td>
        </tr>\`).join('') + '</tbody></table>';
      document.getElementById('customerList').innerHTML = data.length ? html : '<p>No hay clientes registrados</p>';
    } catch (e) {
      document.getElementById('customerList').innerHTML = '<p style="color:#ef4444">Error al cargar clientes</p>';
    }
  }

  // Placeholder para las otras secciones (puedes expandirlas igual que customers)
  async function loadBoats() {
    document.getElementById('boatList').innerHTML = '<p>Lista de botes (implementar API)</p>';
  }

  async function loadReservations() {
    document.getElementById('reservationList').innerHTML = '<p>Lista de reservas (implementar API)</p>';
  }

  async function loadInvoices() {
    document.getElementById('invoiceList').innerHTML = '<p>Lista de facturas (implementar API)</p>';
  }

  function showModal(title, type) {
    document.getElementById('modalTitle').textContent = title;
    let body = '';

    if (type === 'customer') {
      body = \`
        <div class="form-group"><label>Nombre completo *</label><input id="custName" required></div>
        <div class="form-group"><label>Documento</label><input id="custDoc"></div>
        <div class="form-group"><label>Teléfono</label><input id="custPhone"></div>
        <div class="form-group"><label>Email</label><input id="custEmail" type="email"></div>
      \`;
    } else if (type === 'boat') {
      body = \`
        <div class="form-group"><label>Nombre *</label><input id="boatName" required></div>
        <div class="form-group"><label>Tipo</label><input id="boatType"></div>
        <div class="form-group"><label>Precio por hora</label><input id="boatPrice" type="number" step="0.01"></div>
      \`;
    } else if (type === 'reservation') {
      body = \`
        <div class="form-group"><label>Cliente *</label><select id="resCustomer" required></select></div>
        <div class="form-group"><label>Bote *</label><select id="resBoat" required></select></div>
        <div class="form-group"><label>Fecha inicio *</label><input id="resStart" type="datetime-local" required></div>
        <div class="form-group"><label>Fecha fin *</label><input id="resEnd" type="datetime-local" required></div>
      \`;
    }

    document.getElementById('modalBody').innerHTML = body;
    document.getElementById('modalOverlay').classList.add('active');
  }

  // Inicio
  document.addEventListener('DOMContentLoaded', () => {
    showSection('dashboard');
  });
</script>
</body>
</html>`;
      return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    return new Response("404 - Página no encontrada", { status: 404 });
  }
};
