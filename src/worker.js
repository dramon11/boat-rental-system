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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;background:#f1f5f9;color:#1e293b;line-height:1.5}
    .sidebar{width:240px;height:100vh;background:#0f172a;color:#e2e8f0;position:fixed;padding:24px 16px;overflow-y:auto}
    .sidebar h2{margin:0 0 32px;font-size:1.5rem}
    .menu-item{padding:12px 16px;border-radius:8px;margin-bottom:6px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:12px}
    .menu-item:hover{background:#1e293b}
    .menu-item.active{background:#2563eb;color:white}
    .header{margin-left:240px;height:68px;background:#1e40af;color:white;display:flex;align-items:center;justify-content:space-between;padding:0 32px;font-weight:600}
    .content{margin-left:240px;padding:32px}
    .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-bottom:40px}
    .card{background:white;padding:24px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.06)}
    .card h4{margin:0 0 8px;color:#64748b;font-weight:500}
    .card h2{margin:0;font-size:1.8rem;font-weight:700}
    .data-table{width:100%;border-collapse:collapse}
    .data-table th,.data-table td{padding:12px 16px;text-align:left;border-bottom:1px solid #e2e8f0}
    .data-table th{background:#f8fafc;font-weight:600;color:#475569}
    .btn{padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-weight:500}
    .btn-success{background:#22c55e;color:white}
    .btn-danger{background:#ef4444;color:white}
    .btn-outline{border:1px solid #cbd5e1;background:transparent}
    .input-search{padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;width:240px}
    .modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);justify-content:center;align-items:center;z-index:1000}
    .modal-overlay.active{display:flex}
    .modal{background:white;border-radius:12px;width:560px;max-width:92vw;max-height:90vh;overflow-y:auto;padding:24px;box-shadow:0 10px 30px rgba(0,0,0,0.2)}
    .toast{position:fixed;bottom:24px;right:24px;padding:14px 24px;border-radius:8px;color:white;opacity:0;transition:opacity .4s;z-index:2000}
    .toast.show{opacity:1}
    .toast.success{background:#22c55e}
    .toast.error{background:#ef4444}
    .form-group{margin-bottom:16px}
    .form-group label{display:block;margin-bottom:6px;color:#475569;font-weight:500}
    .price-info{margin:16px 0;padding:16px;background:#f0f9ff;border:1px solid #bfdbfe;border-radius:8px}
  </style>
</head>
<body>

<div class="sidebar">
  <h2>⚓ BoatERP</h2>
  <div class="menu-item active" onclick="loadView('dashboard')">Dashboard</div>
  <div class="menu-item" onclick="loadView('customers')">Clientes</div>
  <div class="menu-item" onclick="loadView('boats')">Botes</div>
  <div class="menu-item" onclick="loadView('reservations')">Reservas</div>
  <div class="menu-item" onclick="loadView('invoices')">Facturación</div>
</div>

<div class="header">
  <div>Panel de Gestión de Alquiler de Embarcaciones</div>
  <div>Administrador</div>
</div>

<div class="content" id="mainContent"></div>

<!-- Modal Cliente -->
<div id="customerModal" class="modal-overlay">
  <div class="modal">
    <h3 id="modalTitle">Nuevo Cliente</h3>
    <div class="form-group"><label>Nombre completo *</label><input id="name" required></div>
    <div class="form-group"><label>Documento (Cédula/Pasaporte)</label><input id="doc"></div>
    <div class="form-group"><label>Teléfono / WhatsApp</label><input id="phone"></div>
    <div class="form-group"><label>Email</label><input id="email" type="email"></div>
    <div style="text-align:right;margin-top:20px;">
      <button class="btn btn-outline" onclick="closeModal('customerModal')">Cancelar</button>
      <button class="btn-success" onclick="saveCustomer()">Guardar</button>
    </div>
  </div>
</div>

<!-- Modal Bote (sin cambios importantes) -->
<div id="boatModal" class="modal-overlay">
  <div class="modal">
    <h3 id="boatModalTitle">Nuevo Bote</h3>
    <div class="form-group"><label>Nombre / Identificador *</label><input id="boatName" required></div>
    <div class="form-group"><label>Tipo</label><input id="boatType"></div>
    <div class="form-group"><label>Capacidad (personas)</label><input id="boatCapacity" type="number"></div>
    <div class="form-group"><label>Estado</label>
      <select id="boatStatus">
        <option value="available">Disponible</option>
        <option value="rented">Alquilado</option>
        <option value="maintenance">Mantenimiento</option>
      </select>
    </div>
    <div class="price-group">
      <div><label>Precio/hora</label><input id="priceHour" type="number" step="0.01"></div>
      <div><label>Precio/día</label><input id="priceDay" type="number" step="0.01"></div>
      <div><label>Precio/semana</label><input id="priceWeek" type="number" step="0.01"></div>
      <div><label>Precio/mes</label><input id="priceMonth" type="number" step="0.01"></div>
    </div>
    <div style="text-align:right;margin-top:20px;">
      <button class="btn btn-outline" onclick="closeModal('boatModal')">Cancelar</button>
      <button class="btn-success" onclick="saveBoat()">Guardar</button>
    </div>
  </div>
</div>

<!-- Modal Reserva -->
<div id="reservationModal" class="modal-overlay">
  <div class="modal">
    <h3 id="reservationModalTitle">Nueva Reserva</h3>
    <div class="form-group"><label>Cliente *</label><select id="customerId" required></select></div>
    <div class="form-group"><label>Bote disponible *</label><select id="boatId" required onchange="calculateReservationAmount()"></select></div>
    <div class="form-group"><label>Fecha y hora inicio *</label><input id="startTime" type="datetime-local" required onchange="calculateReservationAmount()"></div>
    <div class="form-group"><label>Fecha y hora fin *</label><input id="endTime" type="datetime-local" required onchange="calculateReservationAmount()"></div>
    <div class="price-info" id="priceInfo" style="display:none">
      <strong>Duración:</strong> <span id="durationText">—</span><br>
      <strong>Precio por hora:</strong> RD$ <span id="boatPrice">0.00</span><br>
      <strong>Total estimado:</strong> <span style="font-size:1.3rem;font-weight:700;color:#1e40af" id="totalAmount">RD$ 0.00</span>
    </div>
    <div style="text-align:right;margin-top:24px;">
      <button class="btn btn-outline" onclick="closeModal('reservationModal')">Cancelar</button>
      <button class="btn-success" onclick="saveReservation()">Crear Reserva</button>
    </div>
  </div>
</div>

<div id="toast" class="toast"></div>

<script>
  let charts = {};
  let editingId = null;

  function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = \`toast \${type} show\`;
    setTimeout(() => t.className = 'toast', 4000);
  }

  function closeModal(id) {
    document.getElementById(id).classList.remove('active');
  }

  async function loadView(view) {
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    document.querySelector(\`.menu-item[onclick="loadView('\${view}')"]\`).classList.add('active');

    const content = document.getElementById('mainContent');

    if (view === 'dashboard') {
      content.innerHTML = dashboardHTML;
      loadDashboardData();
    } else if (view === 'customers') {
      content.innerHTML = \`
        <h2>Clientes</h2>
        <div style="margin:16px 0">
          <button class="btn-success" onclick="openCustomerModal()">+ Nuevo Cliente</button>
        </div>
        <div id="customerTable">Cargando...</div>
      \`;
      loadCustomers();
    } else if (view === 'boats') {
      content.innerHTML = \`
        <h2>Botes</h2>
        <div style="margin:16px 0">
          <button class="btn-success" onclick="openBoatModal()">+ Nuevo Bote</button>
        </div>
        <div id="boatTable">Cargando...</div>
      \`;
      loadBoats();
    } else if (view === 'reservations') {
      content.innerHTML = \`
        <h2>Reservas</h2>
        <div style="margin:16px 0">
          <button class="btn-success" onclick="openReservationModal()">+ Nueva Reserva</button>
        </div>
        <div id="reservationTable">Cargando...</div>
      \`;
      loadReservations();
    } else if (view === 'invoices') {
      content.innerHTML = \`
        <h2>Facturación</h2>
        <div id="invoiceTable">Cargando...</div>
      \`;
      loadInvoices();
    }
  }

  // Dashboard (ya funcionaba)
  const dashboardHTML = \`
    <div class="cards">
      <div class="card"><h4>Ingresos Hoy</h4><h2 id="income">$0.00</h2></div>
      <div class="card"><h4>Reservas Activas</h4><h2 id="active">0</h2></div>
      <div class="card"><h4>Botes Disponibles</h4><h2 id="boats">0</h2></div>
      <div class="card"><h4>Total Clientes</h4><h2 id="customers">0</h2></div>
    </div>
  \`;

  async function loadDashboardData() {
    try {
      const r = await fetch('/api/dashboard');
      const d = await r.json();
      document.getElementById('income').textContent = '$' + Number(d.income_today || 0).toLocaleString('es-DO', {minimumFractionDigits:2});
      document.getElementById('active').textContent = d.active_reservations || 0;
      document.getElementById('boats').textContent = d.available_boats || 0;
      document.getElementById('customers').textContent = d.total_customers || 0;
    } catch {}
  }

  // Inicio
  loadView('dashboard');
</script>
</body>
</html>
        `;
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      }

      // API endpoints (los mismos que ya tenías + mejoras)
      // ... (mantén tus rutas de /api/customers y /api/boats sin cambios)

      // API RESERVAS (mejorada)
      if (url.pathname.startsWith("/api/reservations")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare(`
            SELECT 
              r.id, r.reservation_number, r.customer_id, r.boat_id, r.start_time, r.end_time, r.duration_hours, r.total_amount, r.status,
              c.full_name AS customer_name,
              b.name AS boat_name
            FROM reservations r
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN boats b ON r.boat_id = b.id
            ORDER BY r.id DESC
          `).all();
          return json(rows.results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          const stmt = await env.DB.prepare(`
            INSERT INTO reservations (customer_id, boat_id, start_time, end_time, status)
            VALUES (?, ?, ?, ?, 'pendiente')
          `);
          const result = await stmt.bind(
            body.customer_id,
            body.boat_id,
            body.start_time,
            body.end_time
          ).run();
          return json({ok: true, id: result.lastRowId});
        }
        if (request.method === "PUT") {
          const id = url.pathname.split("/").pop();
          const body = await request.json();
          await env.DB.prepare("UPDATE reservations SET status = ? WHERE id = ?")
            .bind(body.status, id).run();
          return json({ok: true});
        }
      }

      // API FACTURAS (automática)
      if (url.pathname.startsWith("/api/invoices")) {
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(`
            INSERT INTO invoices (reservation_id, subtotal, itbis, total, payment_method, payment_status)
            VALUES (?, ?, ?, ?, ?, 'pending')
          `).bind(
            body.reservation_id,
            body.subtotal,
            body.itbis,
            body.total,
            body.payment_method || 'cash'
          ).run();
          return json({ok: true});
        }
        if (request.method === "GET") {
          const rows = await env.DB.prepare(`
            SELECT i.id, i.invoice_number, i.reservation_id, i.subtotal, i.itbis, i.total, i.payment_method, i.payment_status,
                   r.reservation_number, c.full_name AS customer_name, b.name AS boat_name
            FROM invoices i
            LEFT JOIN reservations r ON i.reservation_id = r.id
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN boats b ON r.boat_id = b.id
            ORDER BY i.id DESC
          `).all();
          return json(rows.results || []);
        }
      }

      return json({error:"Not Found"},404);
    } catch(err){
      return json({error:err.message},500);
    }
  }
}
