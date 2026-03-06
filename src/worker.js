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
    if (!res.ok) throw new Error(await res.text());
    return res.json();
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

// Dashboard (sin cambios)
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
      <div class="chart-box"><div class="chart-title">Ingresos Mensuales</div><canvas id="barChart"></canvas></div>
      <div class="chart-box"><div class="chart-title">Tendencia de Reservas</div><canvas id="lineChart"></canvas></div>
      <div class="chart-box full-width"><div class="chart-title">Distribución de Estados de Reservas</div><canvas id="pieChart"></canvas></div>
      <div class="chart-box"><div class="chart-title">Botes Disponibles vs Ocupados</div><canvas id="boatsChart"></canvas></div>
      <div class="chart-box"><div class="chart-title">Base de Clientes</div><canvas id="customersChart"></canvas></div>
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

    const vibrantColors = ['#6366f1','#8b5cf6','#d946ef','#ec4899','#f43f5e','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#10b981','#06b6d4','#0ea5e9','#3b82f6'];

    // Gráficos (igual que antes)
    new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: { labels: incomeMonthly.map(r => r.month || 'Sin datos'), datasets: [{ label: 'Ingresos Mensuales (RD$)', data: incomeMonthly.map(r => Number(r.total || 0)), backgroundColor: vibrantColors.slice(0, incomeMonthly.length), borderRadius: 5 }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });

    new Chart(document.getElementById('lineChart'), {
      type: 'line',
      data: { labels: resMonthly.map(r => r.month || 'Sin datos'), datasets: [{ label: 'Número de Reservas', data: resMonthly.map(r => Number(r.count || 0)), borderColor: '#10b981', fill: true }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });

    new Chart(document.getElementById('pieChart'), {
      type: 'pie',
      data: { labels: resStatus.map(r => r.status || 'Desconocido'), datasets: [{ data: resStatus.map(r => Number(r.count || 0)), backgroundColor: vibrantColors }] },
      options: { responsive: true, maintainAspectRatio: false }
    });

    const boatsTotal = (await api("GET", "/api/boats")).length || 1;
    new Chart(document.getElementById('boatsChart'), {
      type: 'bar',
      data: { labels: ['Disponibles', 'Ocupados'], datasets: [{ data: [counts.available_boats || 0, boatsTotal - (counts.available_boats || 0)], backgroundColor: ['#22c55e', '#ef4444'] }] },
      options: { responsive: true, maintainAspectRatio: false }
    });

    new Chart(document.getElementById('customersChart'), {
      type: 'doughnut',
      data: { labels: ['Clientes Registrados', 'Otros'], datasets: [{ data: [counts.total_customers || 0, 0], backgroundColor: ['#6366f1', '#e2e8f0'] }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  } catch(e) {
    showToast("Error al cargar dashboard", "error");
  }
}

// Clientes, Botes, Facturación (sin cambios mayores, solo carga básica)
async function loadCustomers(content) { /* mismo código que tenías */ }
async function openCustomerModal(id = null) { /* mismo */ }
async function saveCustomer(id) { /* mismo */ }

async function loadBoats(content) { /* mismo código que tenías */ }
async function openBoatModal(id = null) { /* mismo */ }
async function saveBoat(id) { /* mismo */ }

async function loadInvoices(content) {
  content.innerHTML = \`
    <h1>Facturación</h1>
    <p style="color:#64748b;">(Próximamente: registro de anticipos y facturas finales)</p>
    <div class="card table-container">
      <table class="data-table" id="invTable">
        <thead><tr><th>ID</th><th>Reserva</th><th>Total</th><th>Método</th><th>Fecha</th></tr></thead>
        <tbody id="invBody"></tbody>
      </table>
    </div>
  \`;
  try {
    const data = await api("GET", "/api/invoices");
    document.getElementById("invBody").innerHTML = data.length ? "" : '<tr><td colspan="5" style="text-align:center">No hay facturas aún</td></tr>';
    // ... resto igual
  } catch(e) { showToast("Error cargando facturas", "error"); }
}

// Reservas - MODIFICADO con anticipo y saldo
async function loadReservations(content) {
  content.innerHTML = \`
    <h1>Reservas</h1>
    <button class="btn btn-success" style="margin-bottom:24px;" onclick="openReservationModal()">+ Nueva Reserva</button>
    <div class="card table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th><th>Cliente</th><th>Bote</th><th>Inicio</th><th>Fin</th>
            <th>Total</th><th>Anticipo</th><th>Saldo</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
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
        <td>RD$ \${Number(r.total_amount || 0).toFixed(2)}</td>
        <td>RD$ \${Number(r.deposit_amount || 0).toFixed(2)}</td>
        <td>RD$ \${Number(r.balance_due || 0).toFixed(2)}</td>
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
  let data = { customer_id: '', boat_id: '', start_time: '', end_time: '', deposit_amount: 0 };
  if (id) data = await api("GET", "/api/reservations/" + id).catch(() => data);

  document.getElementById("modalContent").innerHTML = \`
    <h2>\${title}</h2>
    <div class="form-group"><label>Cliente</label><select id="r_customer"></select></div>
    <div class="form-group"><label>Bote</label><select id="r_boat" onchange="updatePriceCalc()"></select></div>
    <div class="form-group"><label>Inicio</label><input type="datetime-local" id="r_start" onchange="updatePriceCalc()" value="\${data.start_time?.slice(0,16)||''}"></div>
    <div class="form-group"><label>Fin</label><input type="datetime-local" id="r_end" onchange="updatePriceCalc()" value="\${data.end_time?.slice(0,16)||''}"></div>
    <div class="form-group"><label>Anticipo / Depósito (RD$)</label><input type="number" step="0.01" id="r_deposit" value="\${data.deposit_amount || 0}" onchange="updatePriceCalc()"></div>
    <div class="form-group"><label>Duración</label><div id="r_duration" class="price-info">—</div></div>
    <div class="form-group"><label>Total estimado</label><div id="r_total" class="price-info">RD$ 0.00</div></div>
    <div class="form-group"><label>Saldo pendiente</label><div id="r_saldo" class="price-info">RD$ 0.00</div></div>
    <div style="margin-top:28px; text-align:right;">
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
    opt.textContent = c.full_name;
    if (c.id == data.customer_id) opt.selected = true;
    custSel.appendChild(opt);
  });

  boatSel.innerHTML = '<option value="">Seleccionar bote...</option>';
  boats.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.textContent = \`\${b.name} — RD$\${Number(b.price_per_hour||0).toFixed(0)}/h\`;
    opt.dataset.price = b.price_per_hour || 0;
    if (b.id == data.boat_id) opt.selected = true;
    boatSel.appendChild(opt);
  });

  document.getElementById("modal").classList.add("active");
  updatePriceCalc();
}

function updatePriceCalc() {
  const start = document.getElementById("r_start")?.value;
  const end = document.getElementById("r_end")?.value;
  const boatOpt = document.getElementById("r_boat")?.selectedOptions[0];
  const deposit = parseFloat(document.getElementById("r_deposit")?.value) || 0;

  let durationText = "—";
  let totalText = "RD$ 0.00";
  let saldoText = "RD$ 0.00";

  if (start && end && boatOpt?.value) {
    const ms = new Date(end) - new Date(start);
    if (ms > 0) {
      const hours = (ms / 3600000).toFixed(1);
      const price = Number(boatOpt.dataset.price || 0);
      const total = hours * price;
      const saldo = Math.max(0, total - deposit);

      durationText = hours + " horas";
      totalText = "RD$ " + total.toFixed(2);
      saldoText = "RD$ " + saldo.toFixed(2);
    } else if (ms <= 0) {
      showToast("La fecha final debe ser posterior al inicio", "error");
    }
  }

  document.getElementById("r_duration").textContent = durationText;
  document.getElementById("r_total").textContent = totalText;
  document.getElementById("r_saldo").textContent = saldoText;
}

async function saveReservation(id) {
  const totalStr = document.getElementById("r_total").textContent.replace("RD$ ", "");
  const deposit = parseFloat(document.getElementById("r_deposit").value) || 0;
  const total = parseFloat(totalStr) || 0;
  const balance = Math.max(0, total - deposit);

  const body = {
    customer_id: parseInt(document.getElementById("r_customer").value),
    boat_id: parseInt(document.getElementById("r_boat").value),
    start_time: document.getElementById("r_start").value + ":00",
    end_time: document.getElementById("r_end").value + ":00",
    total_amount: total,
    deposit_amount: deposit,
    balance_due: balance
  };

  if (!body.customer_id || !body.boat_id || !body.start_time || !body.end_time) {
    return showToast("Faltan campos obligatorios", "error");
  }

  try {
    const path = id ? "/api/reservations/" + id : "/api/reservations";
    const method = id ? "PUT" : "POST";
    await api(method, path, body);
    showToast("Reserva guardada", "success");
    closeModal();
    loadView("reservations");
  } catch(e) {
    showToast("Error al guardar reserva", "error");
  }
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
  } catch(e) {
    showToast("Error al eliminar", "error");
  }
}

// Inicio
loadView("dashboard");
</script>
</body>
</html>`;

      return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    // API Endpoints (solo modificamos reservations para aceptar los nuevos campos)
    if (url.pathname.startsWith("/api/reservations")) {
      const parts = url.pathname.split("/");
      const id = parts.length > 3 && !isNaN(parts[3]) ? parts[3] : null;

      if (request.method === "GET") {
        if (url.searchParams.get("full") === "true") {
          const { results } = await env.DB.prepare(`
            SELECT r.id, r.customer_id, r.boat_id, r.start_time, r.end_time, r.status,
                   r.total_amount, r.deposit_amount, r.balance_due,
                   c.full_name AS customer_name, b.name AS boat_name
            FROM reservations r
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN boats b ON r.boat_id = b.id
            ORDER BY r.id DESC
          `).all();
          return json(results || []);
        }
        const { results } = await env.DB.prepare("SELECT * FROM reservations ORDER BY id DESC").all();
        return json(results || []);
      }

      if (request.method === "POST") {
        const b = await request.json();
        await env.DB.prepare(`
          INSERT INTO reservations (customer_id, boat_id, start_time, end_time, total_amount, deposit_amount, balance_due, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')
        `).bind(
          b.customer_id, b.boat_id, b.start_time, b.end_time,
          b.total_amount || 0, b.deposit_amount || 0, b.balance_due || 0
        ).run();
        return json({ success: true });
      }

      if (request.method === "PUT" && id) {
        const b = await request.json();
        await env.DB.prepare(`
          UPDATE reservations
          SET customer_id = ?, boat_id = ?, start_time = ?, end_time = ?,
              total_amount = ?, deposit_amount = ?, balance_due = ?
          WHERE id = ?
        `).bind(
          b.customer_id, b.boat_id, b.start_time, b.end_time,
          b.total_amount || 0, b.deposit_amount || 0, b.balance_due || 0, id
        ).run();
        return json({ success: true });
      }

      if (request.method === "DELETE" && id) {
        await env.DB.prepare("DELETE FROM reservations WHERE id=?").bind(id).run();
        return json({ success: true });
      }
    }

    // El resto de endpoints (customers, boats, dashboard, invoices, etc.) permanecen iguales
    // ... (copia aquí el resto del código original de API que no modificamos)

    return json({ error: "Not Found" }, 404);
  }
};
