export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    });

    if (url.pathname === "/" && request.method === "GET") {
      const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>BoatERP • Sistema Completo</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    :root { --primary:#1e40af; --success:#10b981; --danger:#ef4444; --warning:#f59e0b; --light:#f8fafc; --gray:#64748b; }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Inter',sans-serif; background:var(--light); color:#1e2937; }
    .sidebar { width:280px; height:100vh; background:#0f172a; color:#fff; position:fixed; padding:32px 20px; overflow-y:auto; }
    .sidebar h2 { font-size:1.9rem; margin-bottom:48px; font-weight:700; }
    .menu-item { padding:14px 20px; border-radius:12px; margin-bottom:8px; cursor:pointer; display:flex; align-items:center; gap:14px; font-weight:500; transition:.3s; }
    .menu-item:hover, .menu-item.active { background:var(--primary); }
    .header { margin-left:280px; height:72px; background:white; box-shadow:0 2px 12px rgba(0,0,0,0.08); display:flex; align-items:center; justify-content:space-between; padding:0 48px; font-weight:600; color:#334155; }
    .content { margin-left:280px; padding:48px 60px; }
    h1 { font-size:2.2rem; margin-bottom:32px; color:#1e2937; }
    .card { background:white; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.07); padding:28px; margin-bottom:32px; }
    .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:24px; margin-bottom:48px; }
    .stat-card { background:white; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.07); padding:28px; text-align:center; }
    .stat-card h4 { margin-bottom:12px; color:var(--gray); font-weight:600; }
    .stat-card h2 { font-size:2.8rem; color:var(--primary); margin:0; }
    .charts-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(480px,1fr)); gap:32px; }
    .chart-box { background:white; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.07); padding:28px; height:420px; }
    .full-width { grid-column:1/-1; }
    .table-container { overflow-x:auto; }
    .data-table { width:100%; border-collapse:collapse; }
    .data-table th { background:#f1f5f9; padding:14px; text-align:left; font-weight:600; color:var(--gray); }
    .data-table td { padding:14px; border-bottom:1px solid #e2e8f0; }
    .btn { padding:10px 18px; border:none; border-radius:8px; cursor:pointer; font-weight:600; margin-right:8px; }
    .btn-success { background:var(--success); color:white; }
    .btn-edit { background:#3b82f6; color:white; }
    .btn-delete { background:var(--danger); color:white; }
    .modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.65); justify-content:center; align-items:center; z-index:9999; }
    .modal-overlay.active { display:flex; }
    .modal { background:white; border-radius:16px; width:680px; max-width:94vw; padding:36px; max-height:92vh; overflow-y:auto; }
    .toast { position:fixed; bottom:32px; right:32px; padding:16px 28px; border-radius:12px; color:white; opacity:0; transition:0.4s; z-index:99999; font-weight:500; }
    .toast.show { opacity:1; }
    .toast.success { background:var(--success); }
    .toast.error { background:var(--danger); }
    .form-group { margin-bottom:20px; }
    .form-group label { display:block; margin-bottom:8px; font-weight:500; color:#475569; }
    .form-group input, .form-group select { width:100%; padding:12px 16px; border:1px solid #cbd5e1; border-radius:8px; font-size:1rem; }
    .price-info { font-size:1.3rem; font-weight:600; color:var(--primary); margin:16px 0; }
  </style>
</head>
<body>
<div class="sidebar">
  <h2>⚓ BoatERP</h2>
  <div class="menu-item active" onclick="loadView('dashboard')"><i class="fas fa-chart-line"></i> Dashboard</div>
  <div class="menu-item" onclick="loadView('customers')"><i class="fas fa-users"></i> Clientes</div>
  <div class="menu-item" onclick="loadView('boats')"><i class="fas fa-ship"></i> Botes</div>
  <div class="menu-item" onclick="loadView('reservations')"><i class="fas fa-calendar-alt"></i> Reservas</div>
  <div class="menu-item" onclick="loadView('invoices')"><i class="fas fa-file-invoice-dollar"></i> Facturación</div>
</div>
<div class="header">
  <div>Sistema de Gestión de Alquiler de Embarcaciones</div>
  <div><i class="fas fa-user-circle"></i> Admin</div>
</div>
<div class="content" id="mainContent"></div>
<div id="modal" class="modal-overlay"><div class="modal" id="modalContent"></div></div>
<div id="toast" class="toast"></div>

<script>
// ────────────────────────────────────────────────
// JavaScript del frontend (adaptado con campos nuevos)
// ────────────────────────────────────────────────
let currentView = "";
let charts = {};

function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast " + type + " show";
  setTimeout(() => t.className = "toast", 4000);
}

async function api(method, path, body = null) {
  try {
    const opts = { method, headers: {} };
    if (body) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(path, opts);
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || res.statusText);
    }
    return await res.json();
  } catch (e) {
    showToast("Error: " + e.message, "error");
    throw e;
  }
}

async function loadView(view) {
  currentView = view;
  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
  document.querySelector(\`.menu-item[onclick="loadView('\${view}')"]\`).classList.add('active');
  const content = document.getElementById("mainContent");
  if (view === "dashboard") await loadDashboard(content);
  else if (view === "customers") await loadCustomers(content);
  else if (view === "boats") await loadBoats(content);
  else if (view === "reservations") await loadReservations(content);
  else if (view === "invoices") await loadInvoices(content);
}

// Dashboard (adaptado mínimamente)
async function loadDashboard(content) {
  content.innerHTML = \`
    <h1>Dashboard Ejecutivo</h1>
    <div class="stats-grid">
      <div class="stat-card"><h4>Ingresos Hoy</h4><h2 id="inc">$0</h2></div>
      <div class="stat-card"><h4>Reservas Activas</h4><h2 id="act">0</h2></div>
      <div class="stat-card"><h4>Botes Disponibles</h4><h2 id="boats">0</h2></div>
      <div class="stat-card"><h4>Clientes Totales</h4><h2 id="cust">0</h2></div>
    </div>
    <div class="charts-grid">
      <div class="chart-box"><canvas id="barChart"></canvas></div>
      <div class="chart-box"><canvas id="lineChart"></canvas></div>
      <div class="chart-box full-width"><canvas id="pieChart"></canvas></div>
    </div>
  \`;

  try {
    const [counts, incomeMonthly, resMonthly, resStatus] = await Promise.all([
      api("GET", "/api/dashboard"),
      api("GET", "/api/income-monthly"),
      api("GET", "/api/reservations-monthly"),
      api("GET", "/api/reservations-status")
    ]);

    document.getElementById("inc").textContent = "$" + Number(counts.income_today || 0).toLocaleString();
    document.getElementById("act").textContent = counts.active_reservations;
    document.getElementById("boats").textContent = counts.available_boats;
    document.getElementById("cust").textContent = counts.total_customers;

    // Gráficos (mismo que antes, solo actualizo labels si quieres)
    // ... (pega aquí el código de creación de charts.bar, charts.line, charts.pie del original)
    // Para no alargar demasiado, asumo que lo mantienes igual

  } catch(e) {
    showToast("Error cargando dashboard", "error");
  }
}

// Clientes (sin cambios importantes)
async function loadCustomers(content) {
  content.innerHTML = \`
    <h1>Clientes</h1>
    <button class="btn btn-success" onclick="openCustomerModal()">+ Nuevo Cliente</button>
    <div class="card table-container">
      <table class="data-table"><thead><tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead><tbody id="custBody"></tbody></table>
    </div>
  \`;
  try {
    const data = await api("GET", "/api/customers");
    const tbody = document.getElementById("custBody");
    tbody.innerHTML = data.length ? "" : '<tr><td colspan="5" style="text-align:center">No hay clientes</td></tr>';
    data.forEach(c => {
      const tr = document.createElement("tr");
      tr.innerHTML = \`
        <td>\${c.full_name || '-'}</td>
        <td>\${c.document_id || '-'}</td>
        <td>\${c.phone || '-'}</td>
        <td>\${c.email || '-'}</td>
        <td>
          <button class="btn btn-edit" onclick="openCustomerModal(\${c.id})">Editar</button>
          <button class="btn btn-delete" onclick="deleteItem('customers', \${c.id})">Eliminar</button>
        </td>
      \`;
      tbody.appendChild(tr);
    });
  } catch(e) { showToast("Error cargando clientes", "error"); }
}

async function openCustomerModal(id = null) {
  // ... (mismo que original)
}

async function saveCustomer(id) {
  // ... (mismo que original)
}

// Botes (sin cambios importantes)
async function loadBoats(content) {
  // ... (mismo que original)
}

async function openBoatModal(id = null) {
  // ... (mismo que original)
}

async function saveBoat(id) {
  // ... (mismo que original)
}

// Reservas - con campos nuevos (total, anticipo, saldo)
async function loadReservations(content) {
  content.innerHTML = \`
    <h1>Reservas</h1>
    <button class="btn btn-success" onclick="openReservationModal()">+ Nueva Reserva</button>
    <div class="card table-container">
      <table class="data-table">
        <thead><tr><th>ID</th><th>Cliente</th><th>Bote</th><th>Inicio</th><th>Fin</th><th>Total</th><th>Anticipo</th><th>Saldo</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody id="resBody"></tbody>
      </table>
    </div>
  \`;

  try {
    const data = await api("GET", "/api/reservations?full=true");
    const tbody = document.getElementById("resBody");
    tbody.innerHTML = data.length ? "" : '<tr><td colspan="10" style="text-align:center">No hay reservas</td></tr>';
    data.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = \`
        <td>#\${r.id}</td>
        <td>\${r.customer_name || '-'}</td>
        <td>\${r.boat_name || '-'}</td>
        <td>\${new Date(r.start_time).toLocaleString('es-DO')}</td>
        <td>\${new Date(r.end_time).toLocaleString('es-DO')}</td>
        <td>RD$ \${Number(r.total_amount||0).toFixed(2)}</td>
        <td>RD$ \${Number(r.deposit_amount||0).toFixed(2)}</td>
        <td>RD$ \${Number(r.balance_due||0).toFixed(2)}</td>
        <td>\${r.status}</td>
        <td>
          <button class="btn btn-edit" onclick="openReservationModal(\${r.id})">Editar</button>
          <button class="btn btn-delete" onclick="deleteItem('reservations',\${r.id})">Eliminar</button>
        </td>
      \`;
      tbody.appendChild(tr);
    });
  } catch(e) { showToast("Error cargando reservas", "error"); }
}

async function openReservationModal(id = null) {
  let title = id ? 'Editar Reserva' : 'Nueva Reserva';
  let data = { customer_id: '', boat_id: '', start_time: '', end_time: '', deposit_amount: '' };
  if (id) data = await api("GET", "/api/reservations/" + id).catch(() => data);

  document.getElementById("modalContent").innerHTML = \`
    <h2>\${title}</h2>
    <div class="form-group"><label>Cliente</label><select id="r_customer"></select></div>
    <div class="form-group"><label>Bote</label><select id="r_boat" onchange="calcReservationPrice()"></select></div>
    <div class="form-group"><label>Inicio</label><input type="datetime-local" id="r_start" onchange="calcReservationPrice()" value="\${data.start_time ? data.start_time.slice(0,16) : ''}"></div>
    <div class="form-group"><label>Fin</label><input type="datetime-local" id="r_end" onchange="calcReservationPrice()" value="\${data.end_time ? data.end_time.slice(0,16) : ''}"></div>
    <div class="form-group"><label>Anticipo (RD$)</label><input type="number" step="0.01" id="r_deposit" value="\${data.deposit_amount || 0}" onchange="calcReservationPrice()"></div>
    <div class="form-group"><label>Duración estimada</label><div id="r_duration" class="price-info">0 horas</div></div>
    <div class="form-group"><label>Precio total estimado</label><div id="r_total" class="price-info">RD$ 0.00</div></div>
    <div class="form-group"><label>Saldo pendiente</label><div id="r_balance" class="price-info">RD$ 0.00</div></div>
    <div style="margin-top:28px;text-align:right;">
      <button class="btn btn-success" onclick="saveReservation(\${id||''})">Guardar</button>
      <button class="btn" onclick="closeModal()">Cancelar</button>
    </div>
  \`;

  const customers = await api("GET", "/api/customers");
  const boats = await api("GET", "/api/boats");
  const custSel = document.getElementById("r_customer");
  const boatSel = document.getElementById("r_boat");

  custSel.innerHTML = '<option value="">Seleccionar cliente...</option>';
  customers.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.text = c.full_name;
    if (c.id == data.customer_id) opt.selected = true;
    custSel.appendChild(opt);
  });

  boatSel.innerHTML = '<option value="">Seleccionar bote...</option>';
  boats.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.text = \`\${b.name} - RD$\${Number(b.price_per_hour||0).toFixed(0)}/h\`;
    opt.dataset.price = b.price_per_hour || 0;
    if (b.id == data.boat_id) opt.selected = true;
    boatSel.appendChild(opt);
  });

  document.getElementById("modal").classList.add("active");
  calcReservationPrice();
}

function calcReservationPrice() {
  const start = document.getElementById("r_start")?.value;
  const end = document.getElementById("r_end")?.value;
  const boat = document.getElementById("r_boat")?.selectedOptions[0];
  const depositInput = document.getElementById("r_deposit");

  if (!start || !end || !boat?.value) {
    document.getElementById("r_duration").textContent = "0 horas";
    document.getElementById("r_total").textContent = "RD$ 0.00";
    document.getElementById("r_balance").textContent = "RD$ 0.00";
    return;
  }

  const ms = new Date(end) - new Date(start);
  if (ms <= 0) return showToast("Fecha final debe ser posterior", "error");

  const hours = (ms / 3600000).toFixed(1);
  const price = Number(boat.dataset.price || 0);
  const total = (hours * price).toFixed(2);
  const deposit = Number(depositInput.value || 0);
  const balance = (total - deposit).toFixed(2);

  document.getElementById("r_duration").textContent = hours + " horas";
  document.getElementById("r_total").textContent = "RD$ " + total;
  document.getElementById("r_balance").textContent = "RD$ " + (balance >= 0 ? balance : "0.00");
}

async function saveReservation(id) {
  const totalStr = document.getElementById("r_total").textContent.replace("RD$ ", "");
  const deposit = parseFloat(document.getElementById("r_deposit").value) || 0;
  const balance = parseFloat(totalStr) - deposit;

  const body = {
    customer_id: parseInt(document.getElementById("r_customer").value),
    boat_id: parseInt(document.getElementById("r_boat").value),
    start_time: document.getElementById("r_start").value + ":00Z",
    end_time: document.getElementById("r_end").value + ":00Z",
    deposit_amount: deposit,
    total_amount: parseFloat(totalStr) || 0,
    balance_due: balance >= 0 ? balance : 0
  };

  if (!body.customer_id || !body.boat_id || !body.start_time || !body.end_time) {
    return showToast("Complete todos los campos obligatorios", "error");
  }

  try {
    if (id) await api("PUT", "/api/reservations/" + id, body);
    else await api("POST", "/api/reservations", body);
    showToast("Reserva guardada", "success");
    closeModal();
    loadView("reservations");
  } catch(e) { showToast("Error al guardar reserva", "error"); }
}

// Facturación (adaptada)
async function loadInvoices(content) {
  content.innerHTML = \`
    <h1>Facturación</h1>
    <div class="card table-container">
      <table class="data-table">
        <thead><tr><th>ID</th><th>Reserva</th><th>Cliente</th><th>Total</th><th>Pagado</th><th>Tipo</th><th>Fecha</th></tr></thead>
        <tbody id="invBody"></tbody>
      </table>
    </div>
  \`;

  try {
    const data = await api("GET", "/api/invoices");
    const tbody = document.getElementById("invBody");
    tbody.innerHTML = data.length ? "" : '<tr><td colspan="7" style="text-align:center">No hay facturas</td></tr>';
    data.forEach(i => {
      const tr = document.createElement("tr");
      tr.innerHTML = \`
        <td>#\${i.id}</td>
        <td>#\${i.reservation_id || '-'}</td>
        <td>\${i.customer_name || '-'}</td>
        <td>RD$ \${Number(i.total||0).toFixed(2)}</td>
        <td>RD$ \${Number(i.amount_paid||0).toFixed(2)}</td>
        <td>\${i.type || '-'}</td>
        <td>\${i.created_at ? new Date(i.created_at).toLocaleString('es-DO') : '-'}</td>
      \`;
      tbody.appendChild(tr);
    });
  } catch(e) { showToast("Error cargando facturas", "error"); }
}

function closeModal() {
  document.getElementById("modal").classList.remove("active");
}

async function deleteItem(table, id) {
  if (!confirm("¿Eliminar este registro?")) return;
  try {
    await api("DELETE", "/api/" + table + "/" + id);
    showToast("Eliminado correctamente", "success");
    loadView(table);
  } catch(e) { showToast("Error al eliminar", "error"); }
}

// Inicio
loadView("dashboard");
</script>
</body>
</html>`;

      return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    // ────────────────────────────────────────────────
    // API Endpoints (adaptados al nuevo modelo)
    // ────────────────────────────────────────────────

    if (url.pathname === "/api/dashboard") {
      let income_today = 0, active = 0, boats = 0, customers = 0;
      try { income_today = (await env.DB.prepare("SELECT COALESCE(SUM(amount_paid),0) FROM invoices WHERE DATE(created_at)=DATE('now')").first())?.['COALESCE(SUM(amount_paid),0)'] ?? 0; } catch {}
      try { active = (await env.DB.prepare("SELECT COUNT(*) FROM reservations WHERE status IN ('confirmada','activa','pendiente_pago')").first())?.['COUNT(*)'] ?? 0; } catch {}
      try { boats = (await env.DB.prepare("SELECT COUNT(*) FROM boats WHERE status='available'").first())?.['COUNT(*)'] ?? 0; } catch {}
      try { customers = (await env.DB.prepare("SELECT COUNT(*) FROM customers").first())?.['COUNT(*)'] ?? 0; } catch {}
      return json({ income_today, active_reservations: active, available_boats: boats, total_customers: customers });
    }

    if (url.pathname === "/api/income-monthly") {
      const r = await env.DB.prepare("SELECT strftime('%Y-%m', created_at) month, COALESCE(SUM(amount_paid),0) total FROM invoices WHERE created_at >= date('now','-6 months') GROUP BY month ORDER BY month").all();
      return json(r.results || []);
    }

    if (url.pathname === "/api/reservations-monthly") {
      const r = await env.DB.prepare("SELECT strftime('%Y-%m', start_time) month, COUNT(*) count FROM reservations WHERE start_time >= date('now','-6 months') GROUP BY month ORDER BY month").all();
      return json(r.results || []);
    }

    if (url.pathname === "/api/reservations-status") {
      const r = await env.DB.prepare("SELECT status, COUNT(*) count FROM reservations GROUP BY status").all();
      return json(r.results || []);
    }

    // Clientes CRUD
    if (url.pathname.startsWith("/api/customers")) {
      const id = url.pathname.split("/")[3];
      if (request.method === "GET") {
        if (id) return json(await env.DB.prepare("SELECT * FROM customers WHERE id=?").bind(id).first() || {});
        return json((await env.DB.prepare("SELECT * FROM customers ORDER BY full_name").all()).results || []);
      }
      if (request.method === "POST") {
        const b = await request.json();
        await env.DB.prepare("INSERT INTO customers (full_name,document_id,phone,email) VALUES (?,?,?,?)").bind(b.full_name, b.document_id, b.phone, b.email).run();
        return json({ success: true });
      }
      if (request.method === "PUT" && id) {
        const b = await request.json();
        await env.DB.prepare("UPDATE customers SET full_name=?,document_id=?,phone=?,email=? WHERE id=?").bind(b.full_name, b.document_id, b.phone, b.email, id).run();
        return json({ success: true });
      }
      if (request.method === "DELETE" && id) {
        await env.DB.prepare("DELETE FROM customers WHERE id=?").bind(id).run();
        return json({ success: true });
      }
    }

    // Botes CRUD (igual que original)
    if (url.pathname.startsWith("/api/boats")) {
      const id = url.pathname.split("/")[3];
      if (request.method === "GET") {
        if (id) return json(await env.DB.prepare("SELECT * FROM boats WHERE id=?").bind(id).first() || {});
        return json((await env.DB.prepare("SELECT * FROM boats").all()).results || []);
      }
      if (request.method === "POST") {
        const b = await request.json();
        await env.DB.prepare("INSERT INTO boats (name,type,capacity,status,price_per_hour) VALUES (?,?,?,?,?)").bind(b.name, b.type, b.capacity, b.status, b.price_per_hour).run();
        return json({ success: true });
      }
      if (request.method === "PUT" && id) {
        const b = await request.json();
        await env.DB.prepare("UPDATE boats SET name=?,type=?,capacity=?,status=?,price_per_hour=? WHERE id=?").bind(b.name, b.type, b.capacity, b.status, b.price_per_hour, id).run();
        return json({ success: true });
      }
      if (request.method === "DELETE" && id) {
        await env.DB.prepare("DELETE FROM boats WHERE id=?").bind(id).run();
        return json({ success: true });
      }
    }

    // Reservas CRUD - con campos nuevos
    if (url.pathname.startsWith("/api/reservations")) {
      const id = url.pathname.split("/")[3];

      if (request.method === "GET") {
        if (url.searchParams.get("full") === "true") {
          const { results } = await env.DB.prepare(`
            SELECT r.*, c.full_name AS customer_name, b.name AS boat_name, b.price_per_hour
            FROM reservations r
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN boats b ON r.boat_id = b.id
            ORDER BY r.id DESC
          `).all();
          return json(results || []);
        }
        return json((await env.DB.prepare("SELECT * FROM reservations ORDER BY id DESC").all()).results || []);
      }

      if (request.method === "POST" || (request.method === "PUT" && id)) {
        const b = await request.json();
        const stmt = request.method === "POST" ?
          env.DB.prepare(`
            INSERT INTO reservations (customer_id, boat_id, start_time, end_time, total_amount, deposit_amount, balance_due, status)
            VALUES (?,?,?,?,?,?,?,'pendiente')
          `).bind(b.customer_id, b.boat_id, b.start_time, b.end_time, b.total_amount, b.deposit_amount, b.balance_due) :
          env.DB.prepare(`
            UPDATE reservations SET customer_id=?, boat_id=?, start_time=?, end_time=?, total_amount=?, deposit_amount=?, balance_due=?, status='pendiente'
            WHERE id=?
          `).bind(b.customer_id, b.boat_id, b.start_time, b.end_time, b.total_amount, b.deposit_amount, b.balance_due, id);

        await stmt.run();
        return json({ success: true });
      }

      if (request.method === "DELETE" && id) {
        await env.DB.prepare("DELETE FROM reservations WHERE id=?").bind(id).run();
        return json({ success: true });
      }
    }

    // Facturas
    if (url.pathname.startsWith("/api/invoices")) {
      if (request.method === "GET") {
        const { results } = await env.DB.prepare(`
          SELECT i.*, r.id AS reservation_id, c.full_name AS customer_name
          FROM invoices i
          LEFT JOIN reservations r ON i.reservation_id = r.id
          LEFT JOIN customers c ON i.customer_id = c.id
          ORDER BY i.created_at DESC
        `).all();
        return json(results || []);
      }

      if (request.method === "POST") {
        const b = await request.json();
        await env.DB.prepare(`
          INSERT INTO invoices (reservation_id, customer_id, total, amount_paid, type, notes, created_at)
          VALUES (?,?,?,?,?,? , datetime('now'))
        `).bind(
          b.reservation_id || null,
          b.customer_id,
          b.total || 0,
          b.amount_paid || 0,
          b.type || 'final',
          b.notes || ''
        ).run();

        // Si es factura final → reducir saldo de reserva
        if (b.type === 'final' && b.reservation_id && b.amount_paid > 0) {
          await env.DB.prepare(`
            UPDATE reservations 
            SET balance_due = MAX(0, balance_due - ?),
                status = CASE WHEN balance_due <= ? THEN 'pagada' ELSE status END
            WHERE id = ?
          `).bind(b.amount_paid, b.amount_paid, b.reservation_id).run();
        }

        return json({ success: true });
      }
    }

    return json({ error: "Not Found" }, 404);
  }
};
