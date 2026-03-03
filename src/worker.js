export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });

    try {
      if (url.pathname === "/" && request.method === "GET") {
        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Boat Rental ERP</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <!-- Chart.js con fallback local si falla CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>window.Chart || document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"><\/script>');</script>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;background:#f1f5f9;color:#1e293b;}
    .sidebar{width:240px;height:100vh;background:#0f172a;color:#fff;position:fixed;padding:25px 20px;overflow-y:auto;}
    .sidebar h2{margin:0 0 40px;font-weight:700;}
    .menu-item{padding:12px 14px;border-radius:8px;margin-bottom:10px;cursor:pointer;transition:.2s;display:flex;align-items:center;gap:12px;}
    .menu-item:hover{background:#1e293b;}
    .menu-item.active{background:#2563eb;}
    .header{margin-left:240px;height:65px;background:#1e3a8a;display:flex;align-items:center;justify-content:space-between;padding:0 30px;color:white;font-weight:600;}
    .content{margin-left:240px;padding:30px;}
    .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;}
    .card{background:white;padding:20px;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,0.05);}
    .card h4{margin:0;font-weight:600;color:#64748b;}
    .card h2{margin:10px 0 0 0;}
    .data-table{width:100%;border-collapse:collapse;}
    .data-table th,.data-table td{padding:10px;border-bottom:1px solid #ccc;text-align:left;}
    .btn{padding:6px 12px;border:none;border-radius:4px;cursor:pointer;}
    .btn-danger{background:#ef4444;color:white;}
    .btn-success{background:#22c55e;color:white;}
    .input-search{padding:6px 12px;border:1px solid #ccc;border-radius:4px;}
    .modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);justify-content:center;align-items:center;z-index:1000;}
    .modal-overlay.active{display:flex;}
    .modal{background:white;padding:24px;border-radius:10px;width:520px;max-width:92vw;max-height:90vh;overflow-y:auto;}
    .toast{position:fixed;bottom:20px;right:20px;padding:12px 18px;border-radius:6px;color:white;opacity:0;transition:opacity .4s;z-index:2000;}
    .toast.show{opacity:1;}
    .toast.success{background:#22c55e;}
    .toast.error{background:#ef4444;}
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
  <div>Panel Administrativo</div>
  <div>Admin</div>
</div>

<div class="content" id="mainContent">
  <h2>Cargando...</h2>
</div>

<!-- MODAL CLIENTES -->
<div id="customerModal" class="modal-overlay">
  <div class="modal">
    <h3 id="modalTitle">Nuevo Cliente</h3>
    <input id="name" placeholder="Nombre completo" style="width:100%;margin-bottom:8px"/>
    <input id="doc" placeholder="Documento" style="width:100%;margin-bottom:8px"/>
    <input id="phone" placeholder="Teléfono" style="width:100%;margin-bottom:8px"/>
    <input id="email" placeholder="Email" style="width:100%;margin-bottom:8px"/>
    <div style="text-align:right;margin-top:16px;">
      <button class="btn-success" onclick="saveCustomer()">Guardar</button>
      <button class="btn" onclick="closeModal('customerModal')">Cancelar</button>
    </div>
  </div>
</div>

<!-- MODAL BOTES -->
<div id="boatModal" class="modal-overlay">
  <div class="modal">
    <h3 id="boatModalTitle">Nuevo Bote</h3>
    <input id="boatName" placeholder="Nombre del bote" style="width:100%;margin-bottom:8px"/>
    <input id="boatType" placeholder="Tipo" style="width:100%;margin-bottom:8px"/>
    <input id="boatCapacity" type="number" placeholder="Capacidad" style="width:100%;margin-bottom:8px"/>
    <select id="boatStatus" style="width:100%;margin-bottom:12px">
      <option value="available">Disponible</option>
      <option value="rented">Alquilado</option>
      <option value="maintenance">Mantenimiento</option>
    </select>
    <div class="price-group">
      <div><label>Precio/hora</label><input id="priceHour" type="number" step="0.01"/></div>
      <div><label>Precio/día</label><input id="priceDay" type="number" step="0.01"/></div>
    </div>
    <div style="text-align:right;margin-top:16px;">
      <button class="btn-success" onclick="saveBoat()">Guardar</button>
      <button class="btn" onclick="closeModal('boatModal')">Cancelar</button>
    </div>
  </div>
</div>

<!-- MODAL RESERVAS -->
<div id="reservationModal" class="modal-overlay">
  <div class="modal">
    <h3 id="reservationModalTitle">Nueva Reserva</h3>
    <select id="customerId" style="width:100%;margin-bottom:12px"><option value="">Cliente...</option></select>
    <select id="boatId" style="width:100%;margin-bottom:12px"><option value="">Bote...</option></select>
    <input id="startTime" type="datetime-local" style="width:100%;margin-bottom:8px"/>
    <input id="endTime" type="datetime-local" style="width:100%;margin-bottom:8px"/>
    <div style="text-align:right;margin-top:16px;">
      <button class="btn-success" onclick="saveReservation()">Guardar</button>
      <button class="btn" onclick="closeModal('reservationModal')">Cancelar</button>
    </div>
  </div>
</div>

<!-- MODAL FACTURAS -->
<div id="invoiceModal" class="modal-overlay">
  <div class="modal">
    <h3 id="invoiceModalTitle">Nueva Factura</h3>
    <input id="subtotal" type="number" placeholder="Subtotal" style="width:100%;margin-bottom:8px"/>
    <input id="itbis" type="number" placeholder="ITBIS 18%" style="width:100%;margin-bottom:8px"/>
    <input id="total" type="number" placeholder="Total" style="width:100%;margin-bottom:8px"/>
    <select id="paymentMethod" style="width:100%;margin-bottom:12px">
      <option value="cash">Efectivo</option>
      <option value="card">Tarjeta</option>
    </select>
    <div style="text-align:right;margin-top:16px;">
      <button class="btn-success" onclick="saveInvoice()">Guardar</button>
      <button class="btn" onclick="closeModal('invoiceModal')">Cancelar</button>
    </div>
  </div>
</div>

<div id="toast"></div>

<script>
  // Toast simple
  function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.background = type === 'success' ? '#22c55e' : '#ef4444';
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 4000);
  }

  function closeModal(id) {
    document.getElementById(id).classList.remove('active');
  }

  function loadSection(section) {
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    document.querySelector(\`.menu-item[onclick="loadSection('\${section}')"]\`)?.classList.add('active');

    const content = document.getElementById('mainContent');
    content.innerHTML = '<h2>Cargando ' + section + '...</h2>';

    if (section === 'dashboard') {
      content.innerHTML = \`
        <div class="cards">
          <div class="card"><h4>Ingresos Hoy</h4><h2>$0</h2></div>
          <div class="card"><h4>Reservas Activas</h4><h2>0</h2></div>
          <div class="card"><h4>Botes Disponibles</h4><h2>0</h2></div>
          <div class="card"><h4>Clientes</h4><h2>0</h2></div>
        </div>
      \`;
      showToast("Dashboard cargado", "success");
    } else if (section === 'customers') {
      content.innerHTML = \`
        <h2>Clientes</h2>
        <button class="btn-success" onclick="showModal('customerModal')">+ Nuevo Cliente</button>
        <div id="customerTable" style="margin-top:20px;">Lista de clientes (simulada)</div>
      \`;
    } else if (section === 'boats') {
      content.innerHTML = \`
        <h2>Botes</h2>
        <button class="btn-success" onclick="showModal('boatModal')">+ Nuevo Bote</button>
      \`;
    } else if (section === 'reservations') {
      content.innerHTML = \`
        <h2>Reservas</h2>
        <button class="btn-success" onclick="showModal('reservationModal')">+ Nueva Reserva</button>
      \`;
    } else if (section === 'invoices') {
      content.innerHTML = \`
        <h2>Facturación</h2>
        <button class="btn-success" onclick="showModal('invoiceModal')">+ Nueva Factura</button>
      \`;
    }
  }

  // Inicio
  document.addEventListener('DOMContentLoaded', () => {
    loadSection('dashboard');
  });
</script>
</body>
</html>
      `;

      return new Response(html, {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    return new Response("404 Not Found", { status: 404 });
  }
};
