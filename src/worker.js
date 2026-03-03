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
  <title>Boat Rental ERP</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
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
    .modal{background:white;padding:20px;border-radius:10px;width:480px;max-width:92vw;}
    .form-group{margin-bottom:16px;}
    .form-group label{display:block;margin-bottom:6px;font-weight:500;color:#334155;}
    .form-group input, .form-group select{width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:6px;}
    .form-group input:focus, .form-group select:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1);}
    .price-summary{margin-top:16px;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;}
    .toast{position:fixed;bottom:20px;right:20px;color:white;padding:12px 18px;border-radius:6px;opacity:0;transition:opacity .4s;z-index:1000;}
    .toast.show{opacity:1;}
    .toast.error{background:#ef4444;}
    .toast.success{background:#22c55e;}
  </style>
</head>
<body>
  <div class="sidebar">
    <h2>⚓ BoatERP</h2>
    <div class="menu-item active" onclick="showDashboard()"><span>📊</span> Dashboard</div>
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
      <div style="text-align:right;margin-top:16px;">
        <button class="btn" onclick="closeCustomerModal()">Cancelar</button>
        <button class="btn-success" onclick="saveCustomer()">Guardar</button>
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

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:16px 0;">
        <div><label style="font-size:0.9em;color:#64748b;display:block;margin-bottom:4px;">Precio/hora</label><input id="priceHour" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
        <div><label style="font-size:0.9em;color:#64748b;display:block;margin-bottom:4px;">Precio/día</label><input id="priceDay" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
        <div><label style="font-size:0.9em;color:#64748b;display:block;margin-bottom:4px;">Precio/semana</label><input id="priceWeek" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
        <div><label style="font-size:0.9em;color:#64748b;display:block;margin-bottom:4px;">Precio/mes</label><input id="priceMonth" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
        <div><label style="font-size:0.9em;color:#64748b;display:block;margin-bottom:4px;">Precio/año</label><input id="priceYear" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
      </div>

      <div style="text-align:right;margin-top:16px;">
        <button class="btn" onclick="closeBoatModal()">Cancelar</button>
        <button class="btn-success" onclick="saveBoat()">Guardar</button>
      </div>
    </div>
  </div>

  <!-- MODAL RESERVAS (mejorado) -->
  <div id="reservationModal" class="modal-overlay">
    <div class="modal">
      <h3 id="reservationModalTitle">Nueva Reserva</h3>

      <div class="form-group">
        <label>Cliente</label>
        <select id="customerId"></select>
      </div>

      <div class="form-group">
        <label>Bote</label>
        <select id="boatId" onchange="updatePriceEstimate()"></select>
      </div>

      <div class="form-group">
        <label>Inicio</label>
        <input id="startTime" type="datetime-local" onchange="updatePriceEstimate()">
      </div>

      <div class="form-group">
        <label>Fin</label>
        <input id="endTime" type="datetime-local" onchange="updatePriceEstimate()">
      </div>

      <div class="form-group">
        <label>Duración (horas)</label>
        <input id="durationHours" type="number" min="0.5" step="0.5" value="1" onchange="updatePriceEstimate()">
      </div>

      <div class="price-summary" id="priceSummary" style="display:none;">
        Precio/hora: <strong id="boatHourPrice">—</strong><br>
        Duración: <strong id="estDuration">—</strong> h<br>
        <strong style="font-size:1.1em;">Total estimado: <span id="totalEstimate">RD$ 0.00</span></strong>
      </div>

      <div style="text-align:right;margin-top:20px;">
        <button class="btn" onclick="closeReservationModal()">Cancelar</button>
        <button class="btn-success" onclick="saveReservation()">Guardar</button>
      </div>
    </div>
  </div>

  <!-- MODAL FACTURAS -->
  <div id="invoiceModal" class="modal-overlay">
    <div class="modal">
      <h3 id="invoiceModalTitle">Nueva Factura</h3>
      <select id="reservationId" style="width:100%;margin-bottom:8px">
        <option value="">Seleccionar Reserva (opcional)</option>
      </select>
      <input id="subtotal" type="number" placeholder="Subtotal" style="width:100%;margin-bottom:8px"/>
      <input id="itbis" type="number" placeholder="ITBIS 18%" style="width:100%;margin-bottom:8px"/>
      <input id="total" type="number" placeholder="Total" style="width:100%;margin-bottom:8px"/>
      <select id="paymentMethod" style="width:100%;margin-bottom:8px">
        <option value="cash">Efectivo</option>
        <option value="card">Tarjeta</option>
        <option value="transfer">Transferencia</option>
      </select>
      <div style="text-align:right;margin-top:16px;">
        <button class="btn" onclick="closeInvoiceModal()">Cancelar</button>
        <button class="btn-success" onclick="saveInvoice()">Guardar</button>
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
    let boatsCache = [];

    // ──────────────────────────────── Dashboard ────────────────────────────────
    const dashboardHTML = \`
      <div id="dashboard">
        <div class="cards">
          <div class="card"><h4>Ingresos Hoy</h4><h2 id="income">$0</h2></div>
          <div class="card"><h4>Alquileres Activos</h4><h2 id="active">0</h2></div>
          <div class="card"><h4>Botes Disponibles</h4><h2 id="boats">0</h2></div>
          <div class="card"><h4>Total Clientes</h4><h2 id="customers">0</h2></div>
        </div>
        <div class="charts">
          <div class="chart-box"><h4>Resumen General</h4><div class="chart-container"><canvas id="barChart"></canvas></div></div>
          <div class="chart-box"><h4>Tendencia</h4><div class="chart-container"><canvas id="lineChart"></canvas></div></div>
        </div>
      </div>
    \`;

    async function loadDashboard() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="showDashboard()"]').classList.add('active');
      document.getElementById("mainContent").innerHTML = dashboardHTML;

      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        document.getElementById("income").innerText = "$" + (data.income_today ?? 0);
        document.getElementById("active").innerText = data.active_rentals ?? 0;
        document.getElementById("boats").innerText = data.available_boats ?? 0;
        document.getElementById("customers").innerText = data.total_customers ?? 0;
      } catch (err) {
        showToast("Error cargando dashboard", "error");
      }
    }

    function showDashboard() { loadDashboard(); }

    // ──────────────────────────────── Clientes ────────────────────────────────
    async function loadCustomers() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadCustomers()"]').classList.add('active');
      document.getElementById('mainContent').innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2>Clientes</h2>
          <div>
            <input id="searchInput" class="input-search" placeholder="Buscar por nombre o documento..." style="margin-right:12px;"/>
            <button class="btn-success" onclick="openCustomerModal()">+ Nuevo Cliente</button>
          </div>
        </div>
        <div class="card"><div id="customerTable">Cargando...</div></div>
      \`;
      await fetchCustomers();
    }

    // ──────────────────────────────── Botes ────────────────────────────────
    async function loadBoats() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadBoats()"]').classList.add('active');
      document.getElementById('mainContent').innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2>Botes</h2>
          <div>
            <input id="boatSearchInput" class="input-search" placeholder="Buscar por nombre o tipo..." style="margin-right:12px;"/>
            <button class="btn-success" onclick="openBoatModal()">+ Nuevo Bote</button>
          </div>
        </div>
        <div class="card"><div id="boatTable">Cargando...</div></div>
      \`;
      await fetchBoats();
    }

    // ──────────────────────────────── Reservas ────────────────────────────────
    async function loadReservations() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadReservations()"]').classList.add('active');
      document.getElementById('mainContent').innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2>Reservas</h2>
          <div>
            <input id="reservationSearchInput" class="input-search" placeholder="Buscar por cliente o bote..." style="margin-right:12px;"/>
            <button class="btn-success" onclick="openReservationModal()">+ Nueva Reserva</button>
          </div>
        </div>
        <div class="card"><div id="reservationTable">Cargando...</div></div>
      \`;
      await fetchReservations();
    }

    async function openReservationModal() {
      editingReservationId = null;
      document.getElementById("reservationModalTitle").textContent = "Nueva Reserva";

      // Limpiar selects
      const custSelect = document.getElementById("customerId");
      const boatSelect = document.getElementById("boatId");
      custSelect.innerHTML = '<option value="">Cargando clientes...</option>';
      boatSelect.innerHTML = '<option value="">Cargando botes...</option>';

      // Cargar clientes
      try {
        const res = await fetch('/api/customers');
        const customers = await res.json();
        custSelect.innerHTML = '<option value="">Seleccione cliente</option>';
        customers.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.id;
          opt.text = \`\${c.full_name} (\${c.document_id || '-'}) \`;
          custSelect.appendChild(opt);
        });
      } catch {
        custSelect.innerHTML = '<option value="">Error al cargar clientes</option>';
      }

      // Cargar botes
      try {
        const res = await fetch('/api/boats');
        boatsCache = await res.json();
        boatSelect.innerHTML = '<option value="">Seleccione bote</option>';
        boatsCache.forEach(b => {
          if (b.status !== 'available') return;
          const opt = document.createElement('option');
          opt.value = b.id;
          opt.dataset.priceHour = b.price_per_hour || 0;
          opt.text = \`\${b.name} — \${b.type || '?'}  (RD$\${(b.price_per_hour||0).toFixed(0)}/h)\`;
          boatSelect.appendChild(opt);
        });
      } catch {
        boatSelect.innerHTML = '<option value="">Error al cargar botes</option>';
      }

      document.getElementById("startTime").value = "";
      document.getElementById("endTime").value = "";
      document.getElementById("durationHours").value = "1";
      document.getElementById("priceSummary").style.display = "none";

      document.getElementById("reservationModal").classList.add("active");
    }

    function updatePriceEstimate() {
      const boatSelect = document.getElementById("boatId");
      const durationEl = document.getElementById("durationHours");
      const summary = document.getElementById("priceSummary");

      const opt = boatSelect.options[boatSelect.selectedIndex];
      const price = parseFloat(opt?.dataset?.priceHour || 0);
      const hours = parseFloat(durationEl.value) || 0;

      if (price > 0 && hours > 0) {
        const total = price * hours;
        document.getElementById("boatHourPrice").textContent = "RD$ " + price.toFixed(2);
        document.getElementById("estDuration").textContent = hours.toFixed(1);
        document.getElementById("totalEstimate").textContent = "RD$ " + total.toFixed(2);
        summary.style.display = "block";
      } else {
        summary.style.display = "none";
      }
    }

    async function saveReservation() {
      const customerId = document.getElementById("customerId").value;
      const boatId = document.getElementById("boatId").value;
      const start = document.getElementById("startTime").value;
      const end = document.getElementById("endTime").value;
      const duration = parseFloat(document.getElementById("durationHours").value) || 1;

      if (!customerId || !boatId || !start || !end) {
        showToast("Faltan campos obligatorios", "error");
        return;
      }

      const body = {
        customer_id: customerId,
        boat_id: boatId,
        start_time: start,
        end_time: end,
        duration_hours: duration
      };

      try {
        const res = await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error();
        showToast("Reserva creada", "success");
        closeReservationModal();
        await loadReservations();
      } catch {
        showToast("Error al crear reserva", "error");
      }
    }

    function closeReservationModal() {
      document.getElementById("reservationModal").classList.remove("active");
    }

    // ──────────────────────────────── Funciones comunes ────────────────────────────────
    function showToast(msg, type = "success") {
      const toast = document.getElementById("toast");
      toast.textContent = msg;
      toast.className = "toast show " + type;
      setTimeout(() => toast.className = "toast", 4000);
    }

    // Inicio
    loadDashboard();
  </script>
</body>
</html>
        `;
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      }

      // ─── Resto de endpoints API ──────────────────────────────────────────────
      // (deben estar iguales a tu versión anterior que funcionaba)

      if (url.pathname === "/api/dashboard") {
        // tu código de dashboard aquí (sin cambios)
      }

      if (url.pathname.startsWith("/api/customers")) {
        // tu código de customers aquí (sin cambios)
      }

      if (url.pathname.startsWith("/api/boats")) {
        // tu código de boats con todos los precios (sin cambios)
      }

      if (url.pathname.startsWith("/api/reservations")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare(`
            SELECT r.*, c.full_name AS customer_name, b.name AS boat_name
            FROM reservations r
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN boats b ON r.boat_id = b.id
          `).all();
          return json(rows.results || []);
        }

        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(`
            INSERT INTO reservations (customer_id, boat_id, start_time, end_time, duration_hours)
            VALUES (?,?,?,?,?)
          `).bind(body.customer_id, body.boat_id, body.start_time, body.end_time, body.duration_hours).run();
          return json({ok:true});
        }

        // PUT y DELETE si los tienes implementados
      }

      if (url.pathname.startsWith("/api/invoices")) {
        // tu código de invoices aquí (sin cambios)
      }

      return json({error:"Not Found"}, 404);
    } catch (err) {
      return json({error: err.message}, 500);
    }
  }
}
