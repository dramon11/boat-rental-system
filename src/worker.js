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
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Boat Rental ERP</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box}
    body{margin:0;font-family:'Inter',sans-serif;background:#f1f5f9;}
    .sidebar{width:240px;height:100vh;background:#0f172a;color:#fff;position:fixed;padding:25px 20px;}
    .sidebar h2{margin:0 0 40px 0;font-weight:700;}
    .menu-item{padding:12px 14px;border-radius:8px;margin-bottom:10px;cursor:pointer;transition:.2s;display:flex;align-items:center;gap:12px;}
    .menu-item:hover{background:#1e293b;}
    .menu-item.active{background:#2563eb;}
    .header{margin-left:240px;height:65px;background:#1e3a8a;display:flex;align-items:center;justify-content:space-between;padding:0 30px;color:white;font-weight:600;}
    .content{margin-left:240px;padding:30px;}
    .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
    .card{background:white;padding:20px;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,0.05);}
    .card h4{margin:0;font-weight:600;color:#64748b;}
    .card h2{margin:10px 0 0 0;}
    .charts{margin-top:40px;display:grid;grid-template-columns:repeat(2,1fr);gap:30px;}
    .chart-box{background:white;padding:25px;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,0.05);height:340px;}
    .full-width{grid-column:span 2;}
    .chart-container{height:280px;position:relative;}
    .data-table{width:100%;border-collapse:collapse;}
    .data-table th, .data-table td{padding:10px;border-bottom:1px solid #ccc;text-align:left;}
    .btn{padding:6px 12px;border:none;border-radius:4px;cursor:pointer;}
    .btn-danger{background:#ef4444;color:white;}
    .btn-success{background:#22c55e;color:white;}
    .input-search{padding:6px 12px;border:1px solid #ccc;border-radius:4px;}
    .modal-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);justify-content:center;align-items:center;}
    .modal-overlay.active{display:flex;}
    .modal{background:white;padding:20px;border-radius:10px;width:520px;max-width:92vw;}
    .toast{position:fixed;bottom:20px;right:20px;color:white;padding:12px 18px;border-radius:6px;opacity:0;transition:opacity .4s;z-index:1000;}
    .toast.show{opacity:1;}
    .toast.error{background:#ef4444;}
    .toast.success{background:#22c55e;}
    .price-group{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:16px 0;}
    .price-group label{font-size:0.9em;color:#64748b;display:block;margin-bottom:4px;}
  </style>
</head>
<body>
  <div class="sidebar">
    <h2>⚓ BoatERP</h2>
    <div class="menu-item active" onclick="loadDashboard()"><span>📊</span> Dashboard</div>
    <div class="menu-item" onclick="loadCustomers()"><span>👥</span> Clientes</div>
    <div class="menu-item" onclick="loadBoats()"><span>⛵</span> Botes</div>
    <div class="menu-item" onclick="loadReservations()"><span>📅</span> Reservas</div>
    <div class="menu-item" onclick="loadInvoices()"><span>💳</span> Facturación</div>
  </div>
  <div class="header">
    <div>Panel Administrativo</div>
    <div>Admin</div>
  </div>
  <div class="content" id="mainContent"></div>

  <!-- MODAL CLIENTES -->
  <div id="customerModal" class="modal-overlay">
    <div class="modal">
      <h3 id="modalTitle">Nuevo Cliente</h3>
      <input id="name" placeholder="Nombre completo" style="width:100%;margin-bottom:8px"/>
      <input id="doc" placeholder="Documento" style="width:100%;margin-bottom:8px"/>
      <input id="phone" placeholder="Teléfono" style="width:100%;margin-bottom:8px"/>
      <input id="email" placeholder="Email" style="width:100%;margin-bottom:8px"/>
      <div style="text-align:right;margin-top:10px;">
        <button class="btn-success" onclick="saveCustomer()">Guardar</button>
        <button class="btn" onclick="closeCustomerModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <!-- MODAL BOTES -->
  <div id="boatModal" class="modal-overlay">
    <div class="modal">
      <h3 id="boatModalTitle">Nuevo Bote</h3>
      <input id="boatName" placeholder="Nombre del bote" style="width:100%;margin-bottom:8px"/>
      <input id="boatType" placeholder="Tipo (Lancha, Yate, Velero...)" style="width:100%;margin-bottom:8px"/>
      <input id="boatCapacity" placeholder="Capacidad (personas)" type="number" style="width:100%;margin-bottom:8px"/>
      <input id="boatStatus" placeholder="Estado (available/rented/maintenance)" style="width:100%;margin-bottom:12px"/>
      <div class="price-group">
        <div><label>Precio por hora</label><input id="priceHour" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
        <div><label>Precio por día</label><input id="priceDay" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
        <div><label>Precio por semana</label><input id="priceWeek" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
        <div><label>Precio por mes</label><input id="priceMonth" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
        <div><label>Precio por año</label><input id="priceYear" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
      </div>
      <div style="text-align:right;margin-top:16px;">
        <button class="btn-success" onclick="saveBoat()">Guardar</button>
        <button class="btn" onclick="closeBoatModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <!-- MODAL RESERVAS -->
  <div id="reservationModal" class="modal-overlay">
    <div class="modal" style="width:520px">
      <h3 id="reservationModalTitle">Nueva Reserva</h3>
      <select id="customerId" style="width:100%;margin-bottom:12px">
        <option value="">Seleccionar Cliente</option>
      </select>
      <select id="boatId" style="width:100%;margin-bottom:12px">
        <option value="">Seleccionar Bote</option>
      </select>
      <input id="startTime" type="datetime-local" style="width:100%;margin-bottom:8px"/>
      <input id="endTime" type="datetime-local" style="width:100%;margin-bottom:8px"/>
      <input id="duration" placeholder="Duración (horas)" type="number" step="0.5" style="width:100%;margin-bottom:12px"/>
      <div id="pricePreview" style="margin:16px 0;padding:12px;background:#f0f9ff;border-radius:8px;display:none;">
        <strong>Total estimado:</strong> RD$ <span id="totalPrice">0.00</span>
      </div>
      <div style="text-align:right;margin-top:10px;">
        <button class="btn-success" onclick="saveReservation()">Guardar</button>
        <button class="btn" onclick="closeReservationModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <!-- MODAL FACTURAS -->
  <div id="invoiceModal" class="modal-overlay">
    <div class="modal" style="width:520px">
      <h3 id="invoiceModalTitle">Nueva Factura</h3>
      <input id="invoiceSubtotal" type="number" placeholder="Subtotal" style="width:100%;margin-bottom:8px"/>
      <input id="invoiceItbis" type="number" placeholder="ITBIS 18%" style="width:100%;margin-bottom:8px"/>
      <input id="invoiceTotal" type="number" placeholder="Total" style="width:100%;margin-bottom:12px"/>
      <select id="paymentMethod" style="width:100%;margin-bottom:12px">
        <option value="cash">Efectivo</option>
        <option value="card">Tarjeta</option>
        <option value="transfer">Transferencia</option>
      </select>
      <div style="text-align:right;">
        <button class="btn-success" onclick="saveInvoice()">Guardar</button>
        <button class="btn" onclick="closeInvoiceModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    let editingCustomerId = null;
    let editingBoatId = null;
    let editingReservationId = null;
    let editingInvoiceId = null;
    let charts = {};

    // Dashboard
    const dashboardHTML = \`
      <div id="dashboard">
        <div class="cards">
          <div class="card"><h4>Ingresos Hoy</h4><h2 id="income">$0</h2></div>
          <div class="card"><h4>Reservas Activas</h4><h2 id="active">0</h2></div>
          <div class="card"><h4>Botes Disponibles</h4><h2 id="boats">0</h2></div>
          <div class="card"><h4>Total Clientes</h4><h2 id="customers">0</h2></div>
        </div>
      </div>
    \`;

    async function loadDashboard() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadDashboard()"]').classList.add('active');
      document.getElementById("mainContent").innerHTML = dashboardHTML;
      showToast("Dashboard cargado", "success");
    }

    // Clientes
    async function loadCustomers() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadCustomers()"]').classList.add('active');
      document.getElementById('mainContent').innerHTML = \`
        <h2>Clientes</h2>
        <button class="btn-success" onclick="openCustomerModal()">+ Nuevo Cliente</button>
        <div id="customerList">Cargando...</div>
      \`;
      showToast("Clientes cargados", "success");
    }

    // Botes
    async function loadBoats() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadBoats()"]').classList.add('active');
      document.getElementById('mainContent').innerHTML = \`
        <h2>Botes</h2>
        <button class="btn-success" onclick="openBoatModal()">+ Nuevo Bote</button>
        <div id="boatList">Cargando...</div>
      \`;
      showToast("Botes cargados", "success");
    }

    // Reservas
    async function loadReservations() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadReservations()"]').classList.add('active');
      document.getElementById('mainContent').innerHTML = \`
        <h2>Reservas</h2>
        <button class="btn-success" onclick="openReservationModal()">+ Nueva Reserva</button>
        <div id="reservationList">Cargando...</div>
      \`;
      showToast("Reservas cargadas", "success");
    }

    function openReservationModal() {
      document.getElementById("reservationModal").classList.add("active");
    }

    function closeReservationModal() {
      document.getElementById("reservationModal").classList.remove("active");
    }

    async function saveReservation() {
      showToast("Reserva guardada (simulación)", "success");
      closeReservationModal();
    }

    // Facturación
    async function loadInvoices() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadInvoices()"]').classList.add('active');
      document.getElementById('mainContent').innerHTML = \`
        <h2>Facturación</h2>
        <button class="btn-success" onclick="openInvoiceModal()">+ Nueva Factura</button>
        <div id="invoiceList">Cargando...</div>
      \`;
      showToast("Facturación cargada", "success");
    }

    function openInvoiceModal() {
      document.getElementById("invoiceModal").classList.add("active");
    }

    function closeInvoiceModal() {
      document.getElementById("invoiceModal").classList.remove("active");
    }

    async function saveInvoice() {
      showToast("Factura guardada (simulación)", "success");
      closeInvoiceModal();
    }

    function openCustomerModal() {
      document.getElementById("customerModal").classList.add("active");
    }

    function closeCustomerModal() {
      document.getElementById("customerModal").classList.remove("active");
    }

    async function saveCustomer() {
      showToast("Cliente guardado (simulación)", "success");
      closeCustomerModal();
    }

    function openBoatModal() {
      document.getElementById("boatModal").classList.add("active");
    }

    function closeBoatModal() {
      document.getElementById("boatModal").classList.remove("active");
    }

    async function saveBoat() {
      showToast("Bote guardado (simulación)", "success");
      closeBoatModal();
    }

    // Inicio
    loadDashboard();
  </script>
</body>
</html>
        `;

        return new Response(html, {
          headers: { "Content-Type": "text/html;charset=UTF-8" }
        });
      }

      // API DASHBOARD (simulada por ahora)
      if (url.pathname === "/api/dashboard") {
        return json({
          income_today: 12500,
          active_reservations: 8,
          available_boats: 5,
          total_customers: 42
        });
      }

      // Rutas API simuladas (puedes conectar a D1 después)
      if (url.pathname === "/api/customers" && request.method === "GET") {
        return json([
          { id: 1, full_name: "Juan Pérez", document_id: "402-1234567-8", phone: "809-555-1234", email: "juan@example.com" }
        ]);
      }

      // 404 para cualquier otra ruta
      return json({ error: "Not Found" }, 404);
    } catch (err) {
      return json({ error: err.message || "Error interno" }, 500);
    }
  }
};
