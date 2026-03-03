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
      <input id="name" placeholder="Nombre completo"/>
      <input id="doc" placeholder="Documento"/>
      <input id="phone" placeholder="Teléfono"/>
      <input id="email" placeholder="Email"/>
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
      <input id="boatName" placeholder="Nombre del bote"/>
      <input id="boatType" placeholder="Tipo"/>
      <input id="boatCapacity" type="number" placeholder="Capacidad"/>
      <input id="boatStatus" placeholder="Estado"/>
      <div style="margin:16px 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;">
        <input id="priceHour" type="number" step="0.01" placeholder="Precio/hora"/>
        <input id="priceDay" type="number" step="0.01" placeholder="Precio/día"/>
        <input id="priceWeek" type="number" step="0.01" placeholder="Precio/semana"/>
        <input id="priceMonth" type="number" step="0.01" placeholder="Precio/mes"/>
        <input id="priceYear" type="number" step="0.01" placeholder="Precio/año"/>
      </div>
      <div style="text-align:right;">
        <button class="btn" onclick="closeBoatModal()">Cancelar</button>
        <button class="btn-success" onclick="saveBoat()">Guardar</button>
      </div>
    </div>
  </div>

  <!-- Modal Reservas -->
  <div id="reservationModal" class="modal-overlay">
    <div class="modal">
      <h3>Nueva Reserva</h3>
      <select id="customerId"><option>Cargando clientes...</option></select>
      <select id="boatId" onchange="updatePriceEstimate()"><option>Cargando botes...</option></select>
      <input id="startTime" type="datetime-local"/>
      <input id="endTime" type="datetime-local"/>
      <input id="durationHours" type="number" step="0.5" value="1" placeholder="Duración (horas)"/>
      <div id="priceSummary" style="display:none;margin-top:12px;padding:12px;background:#f8fafc;border-radius:8px;">
        Precio/hora: <strong id="boatHourPrice">—</strong><br>
        Total estimado: <strong id="totalEstimate">RD$ 0.00</strong>
      </div>
      <div style="text-align:right;margin-top:16px;">
        <button class="btn" onclick="closeReservationModal()">Cancelar</button>
        <button class="btn-success" onclick="saveReservation()">Guardar</button>
      </div>
    </div>
  </div>

  <!-- Modal Facturas -->
  <div id="invoiceModal" class="modal-overlay">
    <div class="modal">
      <h3>Nueva Factura</h3>
      <select id="reservationId"><option>Seleccionar reserva (opcional)</option></select>
      <input id="subtotal" type="number" placeholder="Subtotal"/>
      <input id="itbis" type="number" placeholder="ITBIS 18%"/>
      <input id="total" type="number" placeholder="Total"/>
      <select id="paymentMethod">
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
    let editingId = null;
    let boatsCache = [];

    function showToast(msg, type = "success") {
      const t = document.getElementById("toast");
      t.textContent = msg;
      t.className = "toast show " + type;
      setTimeout(() => t.className = "toast", 3500);
    }

    function setActiveMenu(fn) {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector(\`.menu-item[onclick="\${fn}"]\`)?.classList.add('active');
    }

    // Dashboard
    async function loadDashboard() {
      setActiveMenu('loadDashboard()');
      document.getElementById("mainContent").innerHTML = '<h2>Dashboard</h2><div class="cards">Cargando...</div>';

      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error(res.status);
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
      } catch (e) {
        console.error(e);
        showToast("Error cargando dashboard", "error");
      }
    }

    // Clientes
    async function loadCustomers() {
      setActiveMenu('loadCustomers()');
      document.getElementById("mainContent").innerHTML = \`
        <h2>Clientes</h2>
        <input id="searchCustomers" class="input-search" placeholder="Buscar..." style="width:300px;margin-bottom:16px;"/>
        <button class="btn-success" onclick="openCustomerModal()">+ Nuevo Cliente</button>
        <div id="customerTable" style="margin-top:16px;">Cargando...</div>
      \`;

      try {
        const res = await fetch('/api/customers');
        if (!res.ok) throw new Error();
        const data = await res.json();
        renderTable('customerTable', data, ['full_name', 'document_id', 'phone', 'email'], 'Cliente');
      } catch {
        document.getElementById("customerTable").innerHTML = "<p style='color:red'>Error al cargar clientes</p>";
      }
    }

    // Botes
    async function loadBoats() {
      setActiveMenu('loadBoats()');
      document.getElementById("mainContent").innerHTML = \`
        <h2>Botes</h2>
        <input id="searchBoats" class="input-search" placeholder="Buscar..." style="width:300px;margin-bottom:16px;"/>
        <button class="btn-success" onclick="openBoatModal()">+ Nuevo Bote</button>
        <div id="boatTable" style="margin-top:16px;">Cargando...</div>
      \`;

      try {
        const res = await fetch('/api/boats');
        if (!res.ok) throw new Error();
        const data = await res.json();
        renderTable('boatTable', data, ['name', 'type', 'capacity', 'status', 'price_per_hour'], 'Bote');
      } catch {
        document.getElementById("boatTable").innerHTML = "<p style='color:red'>Error al cargar botes</p>";
      }
    }

    // Reservas
    async function loadReservations() {
      setActiveMenu('loadReservations()');
      document.getElementById("mainContent").innerHTML = \`
        <h2>Reservas</h2>
        <button class="btn-success" onclick="openReservationModal()">+ Nueva Reserva</button>
        <div id="reservationTable" style="margin-top:16px;">Cargando...</div>
      \`;

      try {
        const res = await fetch('/api/reservations');
        if (!res.ok) throw new Error();
        const data = await res.json();
        renderTable('reservationTable', data, ['customer_name', 'boat_name', 'start_time', 'end_time', 'status'], 'Reserva');
      } catch {
        document.getElementById("reservationTable").innerHTML = "<p style='color:red'>Error al cargar reservas</p>";
      }
    }

    // Facturación
    async function loadInvoices() {
      setActiveMenu('loadInvoices()');
      document.getElementById("mainContent").innerHTML = \`
        <h2>Facturación</h2>
        <button class="btn-success" onclick="openInvoiceModal()">+ Nueva Factura</button>
        <div id="invoiceTable" style="margin-top:16px;">Cargando...</div>
      \`;

      try {
        const res = await fetch('/api/invoices');
        if (!res.ok) throw new Error();
        const data = await res.json();
        renderTable('invoiceTable', data, ['id', 'reservation_id', 'total', 'payment_method'], 'Factura');
      } catch {
        document.getElementById("invoiceTable").innerHTML = "<p style='color:red'>Error al cargar facturas</p>";
      }
    }

    // Función auxiliar para renderizar tablas simples
    function renderTable(containerId, data, columns, entity) {
      const el = document.getElementById(containerId);
      if (!data?.length) {
        el.innerHTML = "<p>No hay registros</p>";
        return;
      }
      let html = '<table class="data-table"><thead><tr>';
      columns.forEach(col => html += `<th>\${col}</th>`);
      html += '<th>Acciones</th></tr></thead><tbody>';
      data.forEach(row => {
        html += '<tr>';
        columns.forEach(col => html += `<td>\${row[col] || '-'}</td>`);
        html += '<td><button class="btn-success">Editar</button></td></tr>';
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    }

    // Modal helpers (muy básicos por ahora)
    function openCustomerModal() { document.getElementById("customerModal").classList.add("active"); }
    function closeCustomerModal() { document.getElementById("customerModal").classList.remove("active"); }

    function openBoatModal() { document.getElementById("boatModal").classList.add("active"); }
    function closeBoatModal() { document.getElementById("boatModal").classList.remove("active"); }

    function openReservationModal() { document.getElementById("reservationModal").classList.add("active"); }
    function closeReservationModal() { document.getElementById("reservationModal").classList.remove("active"); }

    function openInvoiceModal() { document.getElementById("invoiceModal").classList.add("active"); }
    function closeInvoiceModal() { document.getElementById("invoiceModal").classList.remove("active"); }

    // Guardar cliente (ejemplo básico)
    async function saveCustomer() {
      const body = {
        full_name: document.getElementById("name").value,
        document_id: document.getElementById("doc").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value
      };
      try {
        await fetch('/api/customers', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(body)
        });
        showToast("Cliente guardado", "success");
        closeCustomerModal();
        loadCustomers();
      } catch {
        showToast("Error al guardar cliente", "error");
      }
    }

    // Inicio
    loadDashboard();
  </script>
</body>
</html>`;
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      }

      // =============================================
      //  API Endpoints
      // =============================================

      // Dashboard
      if (url.pathname === "/api/dashboard") {
        let income_today = 0;
        let active_rentals = 0;
        let available_boats = 0;
        let total_customers = 0;

        try {
          const i = await env.DB.prepare("SELECT COALESCE(SUM(total),0) as total FROM invoices WHERE DATE(created_at) = DATE('now')").first();
          income_today = i?.total || 0;
        } catch {}

        try {
          const r = await env.DB.prepare("SELECT COUNT(*) as count FROM reservations WHERE status = 'active'").first();
          active_rentals = r?.count || 0;
        } catch {}

        try {
          const b = await env.DB.prepare("SELECT COUNT(*) as count FROM boats WHERE status = 'available'").first();
          available_boats = b?.count || 0;
        } catch {}

        try {
          const c = await env.DB.prepare("SELECT COUNT(*) as count FROM customers").first();
          total_customers = c?.count || 0;
        } catch {}

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

        // PUT y DELETE se pueden agregar después
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
            body.name,
            body.type,
            body.capacity,
            body.status || 'available',
            body.price_per_hour || 0,
            body.price_per_day || 0,
            body.price_per_week || 0,
            body.price_per_month || 0,
            body.price_per_year || 0
          ).run();
          return json({ success: true });
        }
      }

      // Reservas
      if (url.pathname.startsWith("/api/reservations")) {
        if (request.method === "GET") {
          const { results } = await env.DB.prepare(`
            SELECT r.*, c.full_name AS customer_name, b.name AS boat_name
            FROM reservations r
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN boats b ON r.boat_id = b.id
            ORDER BY r.id DESC
          `).all();
          return json(results || []);
        }

        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(
            "INSERT INTO reservations (customer_id, boat_id, start_time, end_time, duration_hours) VALUES (?, ?, ?, ?, ?)"
          ).bind(
            body.customer_id,
            body.boat_id,
            body.start_time,
            body.end_time,
            body.duration_hours || 1
          ).run();
          return json({ success: true });
        }
      }

      // Facturas
      if (url.pathname.startsWith("/api/invoices")) {
        if (request.method === "GET") {
          const { results } = await env.DB.prepare("SELECT * FROM invoices ORDER BY id DESC").all();
          return json(results || []);
        }

        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(
            "INSERT INTO invoices (reservation_id, subtotal, itbis, total, payment_method) VALUES (?, ?, ?, ?, ?)"
          ).bind(
            body.reservation_id || null,
            body.subtotal || 0,
            body.itbis || 0,
            body.total || 0,
            body.payment_method || 'cash'
          ).run();
          return json({ success: true });
        }
      }

      return json({ error: "Not found" }, 404);
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  }
};
