export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    });

    try {
      // =============================================
      //  Frontend - HTML + JavaScript
      // =============================================
      if (url.pathname === "/" && request.method === "GET") {
        const html = `<!DOCTYPE html>
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
    .data-table{width:100%;border-collapse:collapse;}
    .data-table th, .data-table td{padding:10px;border-bottom:1px solid #ccc;text-align:left;}
    .btn{padding:6px 12px;border:none;border-radius:4px;cursor:pointer;}
    .btn-danger{background:#ef4444;color:white;}
    .btn-success{background:#22c55e;color:white;}
    .input-search{padding:6px 12px;border:1px solid #ccc;border-radius:4px;}
    .modal-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);justify-content:center;align-items:center;}
    .modal-overlay.active{display:flex;}
    .modal{background:white;padding:20px;border-radius:10px;width:480px;max-width:92vw;}
    .toast{position:fixed;bottom:20px;right:20px;color:white;padding:12px 18px;border-radius:6px;opacity:0;transition:opacity .4s;z-index:1000;}
    .toast.show{opacity:1;}
    .toast.error{background:#ef4444;}
    .toast.success{background:#22c55e;}
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

  <!-- Modal Clientes -->
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

  <!-- Modal Botes -->
  <div id="boatModal" class="modal-overlay">
    <div class="modal">
      <h3 id="boatModalTitle">Nuevo Bote</h3>
      <input id="boatName" placeholder="Nombre del bote" style="width:100%;margin-bottom:8px"/>
      <input id="boatType" placeholder="Tipo" style="width:100%;margin-bottom:8px"/>
      <input id="boatCapacity" type="number" placeholder="Capacidad" style="width:100%;margin-bottom:8px"/>
      <input id="boatStatus" placeholder="Estado (available/rented/maintenance)" style="width:100%;margin-bottom:8px"/>
      <div style="margin:16px 0; display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:12px;">
        <div><label>Precio/hora</label><input id="priceHour" type="number" step="0.01" style="width:100%"/></div>
        <div><label>Precio/día</label><input id="priceDay" type="number" step="0.01" style="width:100%"/></div>
        <div><label>Precio/semana</label><input id="priceWeek" type="number" step="0.01" style="width:100%"/></div>
        <div><label>Precio/mes</label><input id="priceMonth" type="number" step="0.01" style="width:100%"/></div>
        <div><label>Precio/año</label><input id="priceYear" type="number" step="0.01" style="width:100%"/></div>
      </div>
      <div style="text-align:right;margin-top:16px;">
        <button class="btn" onclick="closeBoatModal()">Cancelar</button>
        <button class="btn-success" onclick="saveBoat()">Guardar</button>
      </div>
    </div>
  </div>

  <!-- Modal Reservas -->
  <div id="reservationModal" class="modal-overlay">
    <div class="modal">
      <h3 id="reservationModalTitle">Nueva Reserva</h3>
      <div class="form-group"><label>Cliente</label><select id="customerId"></select></div>
      <div class="form-group"><label>Bote</label><select id="boatId" onchange="updatePriceEstimate()"></select></div>
      <div class="form-group"><label>Inicio</label><input id="startTime" type="datetime-local"/></div>
      <div class="form-group"><label>Fin</label><input id="endTime" type="datetime-local"/></div>
      <div class="form-group"><label>Duración (horas)</label><input id="durationHours" type="number" step="0.5" value="1"/></div>
      <div id="priceSummary" style="display:none;margin-top:16px;padding:12px;background:#f8fafc;border-radius:8px;">
        Precio/hora: <strong id="boatHourPrice">—</strong><br>
        Total estimado: <strong id="totalEstimate">RD$ 0.00</strong>
      </div>
      <div style="text-align:right;margin-top:20px;">
        <button class="btn" onclick="closeReservationModal()">Cancelar</button>
        <button class="btn-success" onclick="saveReservation()">Guardar</button>
      </div>
    </div>
  </div>

  <!-- Modal Facturas -->
  <div id="invoiceModal" class="modal-overlay">
    <div class="modal">
      <h3 id="invoiceModalTitle">Nueva Factura</h3>
      <select id="reservationId" style="width:100%;margin-bottom:8px"><option value="">Seleccionar Reserva (opcional)</option></select>
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
    let boatsCache = [];

    function showToast(msg, type = "success") {
      const t = document.getElementById("toast");
      t.textContent = msg;
      t.className = "toast show " + type;
      setTimeout(() => t.className = "toast", 4000);
    }

    function setActiveMenu(fnName) {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      const item = document.querySelector('.menu-item[onclick="' + fnName + '"]');
      if (item) item.classList.add('active');
    }

    // Dashboard
    async function loadDashboard() {
      setActiveMenu('loadDashboard()');
      document.getElementById("mainContent").innerHTML = '<h2>Dashboard</h2><div class="cards">Cargando...</div>';

      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        document.getElementById("mainContent").innerHTML = \`
          <h2>Dashboard</h2>
          <div class="cards">
            <div class="card"><h4>Ingresos Hoy</h4><h2>$ \${(data.income_today||0).toLocaleString()}</h2></div>
            <div class="card"><h4>Alquileres Activos</h4><h2>\${data.active_rentals||0}</h2></div>
            <div class="card"><h4>Botes Disponibles</h4><h2>\${data.available_boats||0}</h2></div>
            <div class="card"><h4>Total Clientes</h4><h2>\${data.total_customers||0}</h2></div>
          </div>
        \`;
      } catch (err) {
        console.error(err);
        document.getElementById("mainContent").innerHTML = '<h2>Dashboard</h2><p style="color:red">Error: ' + err.message + '</p>';
        showToast("Error cargando dashboard", "error");
      }
    }

    // Clientes
    async function loadCustomers() {
      setActiveMenu('loadCustomers()');
      document.getElementById("mainContent").innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2>Clientes</h2>
          <div>
            <input id="searchInput" class="input-search" placeholder="Buscar..." style="margin-right:12px;"/>
            <button class="btn-success" onclick="openCustomerModal()">+ Nuevo Cliente</button>
          </div>
        </div>
        <div id="customerTable">Cargando...</div>
      \`;

      try {
        const res = await fetch('/api/customers');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        renderCustomers(data);
      } catch (err) {
        document.getElementById("customerTable").innerHTML = '<p style="color:red">Error: ' + err.message + '</p>';
      }
    }

    function renderCustomers(data) {
      const el = document.getElementById("customerTable");
      if (!data?.length) {
        el.innerHTML = "<p>No hay clientes</p>";
        return;
      }
      let html = '<table class="data-table"><thead><tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead><tbody>';
      data.forEach(row => {
        html += '<tr><td>' + (row.full_name || '-') + '</td>' +
                '<td>' + (row.document_id || '-') + '</td>' +
                '<td>' + (row.phone || '-') + '</td>' +
                '<td>' + (row.email || '-') + '</td>' +
                '<td><button class="btn-success">Editar</button></td></tr>';
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    }

    // Botes (similar a clientes, puedes copiar y adaptar renderBotes)
    async function loadBoats() {
      setActiveMenu('loadBoats()');
      document.getElementById("mainContent").innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2>Botes</h2>
          <div>
            <input id="searchBoats" class="input-search" placeholder="Buscar..." style="margin-right:12px;"/>
            <button class="btn-success" onclick="openBoatModal()">+ Nuevo Bote</button>
          </div>
        </div>
        <div id="boatTable">Cargando...</div>
      \`;

      try {
        const res = await fetch('/api/boats');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        renderBoats(data);
      } catch (err) {
        document.getElementById("boatTable").innerHTML = '<p style="color:red">Error: ' + err.message + '</p>';
      }
    }

    function renderBoats(data) {
      const el = document.getElementById("boatTable");
      if (!data?.length) {
        el.innerHTML = "<p>No hay botes</p>";
        return;
      }
      let html = '<table class="data-table"><thead><tr><th>Nombre</th><th>Tipo</th><th>Capacidad</th><th>Estado</th><th>Precio/h</th><th>Acciones</th></tr></thead><tbody>';
      data.forEach(row => {
        html += '<tr><td>' + (row.name || '-') + '</td>' +
                '<td>' + (row.type || '-') + '</td>' +
                '<td>' + (row.capacity || '-') + '</td>' +
                '<td>' + (row.status || '-') + '</td>' +
                '<td>$' + (row.price_per_hour || 0).toFixed(2) + '</td>' +
                '<td><button class="btn-success">Editar</button></td></tr>';
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    }

    // ... aquí puedes seguir añadiendo loadReservations(), loadInvoices() con el mismo patrón ...

    // Inicio
    loadDashboard();
  </script>
</body>
</html>`;

        return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
      }

      // =============================================
      //  API Endpoints
      // =============================================

      // Dashboard
      if (url.pathname === "/api/dashboard") {
        let income_today = 0, active_rentals = 0, available_boats = 0, total_customers = 0;

        try { income_today = (await env.DB.prepare("SELECT COALESCE(SUM(total),0) as total FROM invoices WHERE DATE(created_at)=DATE('now')").first())?.total || 0; } catch {}
        try { active_rentals = (await env.DB.prepare("SELECT COUNT(*) as count FROM reservations WHERE status='active'").first())?.count || 0; } catch {}
        try { available_boats = (await env.DB.prepare("SELECT COUNT(*) as count FROM boats WHERE status='available'").first())?.count || 0; } catch {}
        try { total_customers = (await env.DB.prepare("SELECT COUNT(*) as count FROM customers").first())?.count || 0; } catch {}

        return json({ income_today, active_rentals, available_boats, total_customers });
      }

      // Clientes
      if (url.pathname.startsWith("/api/customers")) {
        if (request.method === "GET") {
          const { results } = await env.DB.prepare("SELECT * FROM customers ORDER BY id DESC").all();
          return json(results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(
            "INSERT INTO customers (full_name, document_id, phone, email) VALUES (?, ?, ?, ?)"
          ).bind(body.full_name, body.document_id, body.phone, body.email).run();
          return json({ success: true });
        }
      }

      // Botes
      if (url.pathname.startsWith("/api/boats")) {
        if (request.method === "GET") {
          const { results } = await env.DB.prepare("SELECT * FROM boats ORDER BY id DESC").all();
          return json(results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(
            "INSERT INTO boats (name, type, capacity, status, price_per_hour, price_per_day, price_per_week, price_per_month, price_per_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
          ).bind(
            body.name, body.type, body.capacity, body.status || 'available',
            body.price_per_hour || 0, body.price_per_day || 0, body.price_per_week || 0,
            body.price_per_month || 0, body.price_per_year || 0
          ).run();
          return json({ success: true });
        }
      }

      // Reservas (ejemplo básico)
      if (url.pathname.startsWith("/api/reservations")) {
        if (request.method === "GET") {
          const { results } = await env.DB.prepare(`
            SELECT r.*, c.full_name AS customer_name, b.name AS boat_name
            FROM reservations r
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN boats b ON r.boat_id = b.id
          `).all();
          return json(results || []);
        }
        // POST, PUT, DELETE se pueden agregar cuando los necesites
      }

      // Facturas (ejemplo básico)
      if (url.pathname.startsWith("/api/invoices")) {
        if (request.method === "GET") {
          const { results } = await env.DB.prepare("SELECT * FROM invoices ORDER BY id DESC").all();
          return json(results || []);
        }
        // POST similar a los anteriores...
      }

      return json({ error: "Not found" }, 404);
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  }
};
