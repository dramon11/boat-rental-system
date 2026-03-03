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
<html>
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

  <!-- MODAL CLIENTES (sin cambios) -->
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

  <!-- MODAL BOTES (con precios) -->
  <div id="boatModal" class="modal-overlay">
    <div class="modal">
      <h3 id="boatModalTitle">Nuevo Bote</h3>
      <input id="boatName" placeholder="Nombre del bote" style="width:100%;margin-bottom:8px"/>
      <input id="boatType" placeholder="Tipo (Lancha, Yate, Velero...)" style="width:100%;margin-bottom:8px"/>
      <input id="boatCapacity" placeholder="Capacidad (personas)" type="number" style="width:100%;margin-bottom:8px"/>
      <input id="boatStatus" placeholder="Estado (available/rented/maintenance)" style="width:100%;margin-bottom:12px"/>

      <div class="price-group">
        <div>
          <label>Precio por hora</label>
          <input id="priceHour" type="number" step="0.01" placeholder="0.00" style="width:100%"/>
        </div>
        <div>
          <label>Precio por día</label>
          <input id="priceDay" type="number" step="0.01" placeholder="0.00" style="width:100%"/>
        </div>
        <div>
          <label>Precio por semana</label>
          <input id="priceWeek" type="number" step="0.01" placeholder="0.00" style="width:100%"/>
        </div>
        <div>
          <label>Precio por mes</label>
          <input id="priceMonth" type="number" step="0.01" placeholder="0.00" style="width:100%"/>
        </div>
        <div>
          <label>Precio por año</label>
          <input id="priceYear" type="number" step="0.01" placeholder="0.00" style="width:100%"/>
        </div>
      </div>

      <div style="text-align:right;margin-top:16px;">
        <button class="btn-success" onclick="saveBoat()">Guardar</button>
        <button class="btn" onclick="closeBoatModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <!-- MODAL RESERVAS -->
  <div id="reservationModal" class="modal-overlay">
    <div class="modal" style="width:500px">
      <h3 id="reservationModalTitle">Nueva Reserva</h3>
      <select id="customerId" style="width:100%;margin-bottom:8px">
        <option value="">Seleccionar Cliente</option>
      </select>
      <select id="boatId" style="width:100%;margin-bottom:8px">
        <option value="">Seleccionar Bote</option>
      </select>
      <input id="startTime" type="datetime-local" placeholder="Inicio" style="width:100%;margin-bottom:8px"/>
      <input id="endTime" type="datetime-local" placeholder="Fin" style="width:100%;margin-bottom:8px"/>
      <input id="duration" placeholder="Duración (horas)" type="number" style="width:100%;margin-bottom:8px"/>
      <div style="text-align:right;margin-top:10px;">
        <button class="btn-success" onclick="saveReservation()">Guardar</button>
        <button class="btn" onclick="closeReservationModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <!-- MODAL FACTURAS -->
  <div id="invoiceModal" class="modal-overlay">
    <div class="modal" style="width:500px">
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
      <div style="text-align:right;margin-top:10px;">
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

    // Dashboard – corregido para usar tablas reales
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
      document.querySelector('.menu-item[onclick="showDashboard()"]').classList.add('active');
      document.getElementById("mainContent").innerHTML = dashboardHTML;
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error(\`Status \${res.status}\`);
        const data = await res.json();
        document.getElementById("income").innerText = "$" + Number(data.income_today || 0).toLocaleString('es-DO', {minimumFractionDigits:2});
        document.getElementById("active").innerText = data.active_reservations || 0;
        document.getElementById("boats").innerText = data.available_boats || 0;
        document.getElementById("customers").innerText = data.total_customers || 0;
      } catch (err) {
        console.error("Dashboard error:", err);
        document.getElementById("mainContent").innerHTML += '<p style="color:red; margin-top:20px;">Error cargando dashboard: ' + err.message + '</p>';
        showToast("Error cargando dashboard", "error");
      }
    }
    function showDashboard() { loadDashboard(); }

    // ... (todo el código de clientes y botes que ya tenías permanece exactamente igual)

    // Reservas (sin cambios mayores, pero con nombres)
    async function loadReservations() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadReservations()"]').classList.add('active');
      document.getElementById('mainContent').innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h2>Reservas</h2>
          <div>
            <input id="reservationSearchInput" class="input-search" placeholder="Buscar por cliente o bote..." />
            <button class="btn-success" onclick="openReservationModal()">+ Nueva Reserva</button>
          </div>
        </div>
        <div class="card"><div id="reservationTable">Cargando reservas...</div></div>
      \`;
      await fetchReservations();
    }

    async function fetchReservations() {
      try {
        const res = await fetch('/api/reservations');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        renderReservationsTable(data);
      } catch (err) {
        document.getElementById("reservationTable").innerHTML = "<p style='color:red'>Error: " + err.message + "</p>";
      }
    }

    function renderReservationsTable(data) {
      const el = document.getElementById("reservationTable");
      if (!data || data.length === 0) { el.innerHTML = "<p>No hay reservas.</p>"; return; }
      let html = '<table class="data-table"><thead><tr><th>Cliente</th><th>Bote</th><th>Inicio</th><th>Fin</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
      data.forEach(r => {
        html += \`<tr data-id="\${r.id}">
          <td>\${r.customer_name || '-'}</td>
          <td>\${r.boat_name || '-'}</td>
          <td>\${r.start_time || '-'}</td>
          <td>\${r.end_time || '-'}</td>
          <td>\${r.status || '-'}</td>
          <td>
            <button class="btn btn-success" onclick="editReservation(this)">Editar</button>
            <button class="btn btn-danger" onclick="deleteReservation(\${r.id})">Eliminar</button>
          </td>
        </tr>\`;
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    }

    // Facturación – con nombres
    async function loadInvoices() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadInvoices()"]').classList.add('active');
      document.getElementById('mainContent').innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h2>Facturación</h2>
          <div>
            <input id="invoiceSearchInput" class="input-search" placeholder="Buscar..." />
            <button class="btn-success" onclick="openInvoiceModal()">+ Nueva Factura</button>
          </div>
        </div>
        <div class="card"><div id="invoiceTable">Cargando facturas...</div></div>
      \`;
      await fetchInvoices();
    }

    async function fetchInvoices() {
      try {
        const res = await fetch('/api/invoices');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        renderInvoicesTable(data);
      } catch (err) {
        document.getElementById("invoiceTable").innerHTML = "<p style='color:red'>Error: " + err.message + "</p>";
      }
    }

    function renderInvoicesTable(data) {
      const el = document.getElementById("invoiceTable");
      if (!data || data.length === 0) { el.innerHTML = "<p>No hay facturas.</p>"; return; }
      let html = '<table class="data-table"><thead><tr><th>ID</th><th>Cliente</th><th>Reserva</th><th>Total</th><th>Método</th><th>Acciones</th></tr></thead><tbody>';
      data.forEach(i => {
        html += \`<tr data-id="\${i.id}">
          <td>\${i.id}</td>
          <td>\${i.customer_name || '-'}</td>
          <td>\${i.reservation_id || '-'}</td>
          <td>RD$ \${Number(i.total || 0).toFixed(2)}</td>
          <td>\${i.payment_method || '-'}</td>
          <td>
            <button class="btn btn-success" onclick="editInvoice(this)">Editar</button>
            <button class="btn btn-danger" onclick="deleteInvoice(\${i.id})">Eliminar</button>
          </td>
        </tr>\`;
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    }

    // ... (resto de funciones: openInvoiceModal, saveInvoice, etc. sin cambios)

    // Inicio
    loadDashboard();
  </script>
</body>
</html>
        `;
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      }

      // API DASHBOARD – ajustado a tablas reales
      if (url.pathname === "/api/dashboard") {
        let income_today = 0;
        let active_reservations = 0;
        let available_boats = 0;
        let total_customers = 0;

        try {
          const income = await env.DB.prepare("SELECT IFNULL(SUM(total),0) as total FROM invoices WHERE DATE(created_at)=DATE('now')").first();
          income_today = income?.total ?? 0;
        } catch {}

        try {
          const active = await env.DB.prepare("SELECT COUNT(*) as total FROM reservations WHERE status='active'").first();
          active_reservations = active?.total ?? 0;
        } catch {}

        try {
          const boats = await env.DB.prepare("SELECT COUNT(*) as total FROM boats WHERE TRIM(LOWER(status)) = 'available'").first();
          available_boats = boats?.total ?? 0;
        } catch {}

        try {
          const customers = await env.DB.prepare("SELECT COUNT(*) as total FROM customers").first();
          total_customers = customers?.total ?? 0;
        } catch {}

        return json({ income_today, active_reservations, available_boats, total_customers });
      }

      // API CLIENTES (sin cambios)
      if (url.pathname.startsWith("/api/customers")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare("SELECT id, full_name, document_id, phone, email FROM customers").all();
          return json(rows.results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare("INSERT INTO customers (full_name, document_id, phone, email) VALUES (?,?,?,?)")
            .bind(body.full_name, body.document_id, body.phone, body.email).run();
          return json({ok:true});
        }
        if (request.method === "PUT") {
          const parts = url.pathname.split("/");
          const id = parts[parts.length-1];
          const body = await request.json();
          await env.DB.prepare("UPDATE customers SET full_name=?, document_id=?, phone=?, email=? WHERE id=?")
            .bind(body.full_name, body.document_id, body.phone, body.email, id).run();
          return json({ok:true});
        }
        if (request.method === "DELETE") {
          const parts = url.pathname.split("/");
          const id = parts[parts.length-1];
          await env.DB.prepare("DELETE FROM customers WHERE id=?").bind(id).run();
          return json({ok:true});
        }
      }

      // API BOTES (con precios)
      if (url.pathname.startsWith("/api/boats")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare(`
            SELECT id, name, type, capacity, status,
                   price_per_hour, price_per_day, price_per_week,
                   price_per_month, price_per_year
            FROM boats
          `).all();
          return json(rows.results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(`
            INSERT INTO boats (
              name, type, capacity, status,
              price_per_hour, price_per_day, price_per_week,
              price_per_month, price_per_year
            ) VALUES (?,?,?,?,?,?,?,?,?,?)
          `).bind(
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
          return json({ok:true});
        }
        if (request.method === "PUT") {
          const parts = url.pathname.split("/");
          const id = parts[parts.length-1];
          const body = await request.json();
          await env.DB.prepare(`
            UPDATE boats SET
              name = ?,
              type = ?,
              capacity = ?,
              status = ?,
              price_per_hour = ?,
              price_per_day = ?,
              price_per_week = ?,
              price_per_month = ?,
              price_per_year = ?
            WHERE id = ?
          `).bind(
            body.name,
            body.type,
            body.capacity,
            body.status || 'available',
            body.price_per_hour || 0,
            body.price_per_day || 0,
            body.price_per_week || 0,
            body.price_per_month || 0,
            body.price_per_year || 0,
            id
          ).run();
          return json({ok:true});
        }
        if (request.method === "DELETE") {
          const parts = url.pathname.split("/");
          const id = parts[parts.length-1];
          await env.DB.prepare("DELETE FROM boats WHERE id=?").bind(id).run();
          return json({ok:true});
        }
      }

      // API RESERVAS – con nombres
      if (url.pathname.startsWith("/api/reservations")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare(`
            SELECT 
              r.id, r.boat_id, r.customer_id, r.start_time, r.end_time, r.duration_hours, r.total_amount, r.status,
              c.full_name AS customer_name,
              b.name AS boat_name
            FROM reservations r
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN boats b ON r.boat_id = b.id
          `).all();
          return json(rows.results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare("INSERT INTO reservations (boat_id, customer_id, start_time, end_time, duration_hours, total_amount, status) VALUES (?,?,?,?,?,?,?)")
            .bind(body.boat_id, body.customer_id, body.start_time, body.end_time, body.duration_hours, body.total_amount || 0, body.status || 'pendiente').run();
          return json({ok:true});
        }
        // PUT y DELETE sin cambios
      }

      // API FACTURAS – con nombre del cliente
      if (url.pathname.startsWith("/api/invoices")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare(`
            SELECT i.id, i.reservation_id, i.subtotal, i.itbis, i.total, i.payment_method,
                   c.full_name AS customer_name
            FROM invoices i
            LEFT JOIN reservations r ON i.reservation_id = r.id
            LEFT JOIN customers c ON r.customer_id = c.id
          `).all();
          return json(rows.results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare("INSERT INTO invoices (reservation_id, subtotal, itbis, total, payment_method) VALUES (?,?,?,?,?)")
            .bind(body.reservation_id || null, body.subtotal || 0, body.itbis || 0, body.total || 0, body.payment_method).run();
          return json({ok:true});
        }
        // PUT y DELETE sin cambios
      }

      return json({error:"Not Found"},404);
    } catch(err){
      return json({error:err.message},500);
    }
  }
}
