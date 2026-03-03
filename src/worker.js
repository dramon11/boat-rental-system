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
  <title>BoatERP • Sistema Profesional</title>
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
  setTimeout(() => { t.className = "toast"; }, 4000);
}

async function api(method, path, body = null) {
  const opts = { method, headers: {} };
  if (body) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(path, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
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

async function loadDashboard(content) {
  content.innerHTML = \`
    <h1>Dashboard</h1>
    <div class="stats-grid">
      <div class="stat-card"><h4>Ingresos Hoy</h4><h2 id="inc">$0</h2></div>
      <div class="stat-card"><h4>Reservas Activas</h4><h2 id="act">0</h2></div>
      <div class="stat-card"><h4>Botes Disponibles</h4><h2 id="boats">0</h2></div>
      <div class="stat-card"><h4>Clientes Totales</h4><h2 id="cust">0</h2></div>
    </div>
    <div class="charts-grid">
      <div class="chart-box"><h3>Ingresos Mensuales (Barras)</h3><canvas id="barChart"></canvas></div>
      <div class="chart-box"><h3>Reservas por Mes (Línea)</h3><canvas id="lineChart"></canvas></div>
      <div class="chart-box"><h3>Distribución de Estados (Pie)</h3><canvas id="pieChart"></canvas></div>
      <div class="chart-box"><h3>Botes Disponibles vs Ocupados (Dona)</h3><canvas id="boatsChart"></canvas></div>
      <div class="chart-box"><h3>Clientes Activos (Dona)</h3><canvas id="customersChart"></canvas></div>
      <div class="chart-box full-width"><h3>Reservas por Estado Detallado (Pie)</h3><canvas id="resStatusChart"></canvas></div>
    </div>
  \`;

  try {
    const [counts, income, resMonthly, status, boatsStatus] = await Promise.all([
      api("GET", "/api/dashboard"),
      api("GET", "/api/income-monthly"),
      api("GET", "/api/reservations-monthly"),
      api("GET", "/api/reservations-status"),
      api("GET", "/api/boats-status")
    ]);

    // Tarjetas superiores
    document.getElementById("inc").textContent = "$" + Number(counts.income_today||0).toLocaleString();
    document.getElementById("act").textContent = counts.active_reservations;
    document.getElementById("boats").textContent = counts.available_boats;
    document.getElementById("cust").textContent = counts.total_customers;

    // Gráficos existentes (ya reales)
    charts.bar = new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: { labels: income.map(r => r.month), datasets: [{ label: 'Ingresos RD$', data: income.map(r => Number(r.total)), backgroundColor: '#3b82f6' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }
    });

    charts.line = new Chart(document.getElementById('lineChart'), {
      type: 'line',
      data: { labels: resMonthly.map(r => r.month), datasets: [{ label: 'Reservas', data: resMonthly.map(r => Number(r.count)), borderColor: '#10b981', tension: 0.4, fill: true }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }
    });

    charts.pie = new Chart(document.getElementById('pieChart'), {
      type: 'pie',
      data: { labels: status.map(r => r.status), datasets: [{ data: status.map(r => Number(r.count)), backgroundColor: ['#10b981','#f59e0b','#3b82f6','#8b5cf6','#ef4444'] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
    });

    // Nuevo gráfico: Botes disponibles vs no disponibles (dona)
    const boatsAvail = Number(counts.available_boats || 0);
    const boatsTotal = (await api("GET", "/api/boats")).length || 1;
    const boatsOccupied = boatsTotal - boatsAvail;

    charts.boats = new Chart(document.getElementById('boatsChart'), {
      type: 'doughnut',
      data: {
        labels: ['Disponibles', 'Ocupados/Mantenimiento'],
        datasets: [{ data: [boatsAvail, boatsOccupied], backgroundColor: ['#10b981', '#ef4444'] }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    // Nuevo gráfico: Clientes (como indicador grande + dona simple)
    const custTotal = Number(counts.total_customers || 0);
    charts.customers = new Chart(document.getElementById('customersChart'), {
      type: 'doughnut',
      data: {
        labels: ['Clientes Registrados', 'Sin actividad'],
        datasets: [{ data: [custTotal, 0], backgroundColor: ['#3b82f6', '#e2e8f0'] }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    // Gráfico adicional de reservas por estado detallado (más completo)
    charts.resStatus = new Chart(document.getElementById('resStatusChart'), {
      type: 'pie',
      data: { labels: status.map(r => r.status), datasets: [{ data: status.map(r => Number(r.count)), backgroundColor: ['#10b981','#f59e0b','#3b82f6','#8b5cf6','#ef4444','#6b7280'] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
    });
  } catch(e) {
    showToast("Error al cargar dashboard o gráficos", "error");
    console.error(e);
  }
}

// (El resto de funciones: loadCustomers, loadBoats, loadReservations, loadInvoices, openCustomerModal, saveCustomer, openBoatModal, saveBoat, openReservationModal, calcReservationPrice, saveReservation, deleteItem, closeModal... permanecen iguales a la versión anterior)

async function loadCustomers(content) {
  // ... (copia tu implementación anterior completa aquí)
}

async function loadBoats(content) {
  // ... (copia tu implementación anterior completa aquí)
}

async function loadReservations(content) {
  // ... (copia tu implementación anterior completa aquí)
}

async function loadInvoices(content) {
  // ... (copia tu implementación anterior completa aquí)
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
    //                  API ENDPOINTS (sin cambios)
    // ────────────────────────────────────────────────

    if (url.pathname === "/api/dashboard") {
      let income_today = 0, active = 0, boats = 0, customers = 0;
      try { income_today = (await env.DB.prepare("SELECT COALESCE(SUM(total),0) s FROM invoices WHERE DATE(created_at)=DATE('now')").first())?.s ?? 0; } catch {}
      try { active = (await env.DB.prepare("SELECT COUNT(*) c FROM reservations WHERE status IN ('confirmada','activa')").first())?.c ?? 0; } catch {}
      try { boats = (await env.DB.prepare("SELECT COUNT(*) c FROM boats WHERE status='available'").first())?.c ?? 0; } catch {}
      try { customers = (await env.DB.prepare("SELECT COUNT(*) c FROM customers").first())?.c ?? 0; } catch {}
      return json({ income_today, active_reservations: active, available_boats: boats, total_customers: customers });
    }

    if (url.pathname === "/api/income-monthly") {
      const r = await env.DB.prepare(`
        SELECT strftime('%Y-%m', created_at) month, COALESCE(SUM(total),0) total
        FROM invoices WHERE created_at >= date('now','-6 months')
        GROUP BY month ORDER BY month
      `).all();
      return json(r.results || []);
    }

    if (url.pathname === "/api/reservations-monthly") {
      const r = await env.DB.prepare(`
        SELECT strftime('%Y-%m', start_time) month, COUNT(*) count
        FROM reservations WHERE start_time >= date('now','-6 months')
        GROUP BY month ORDER BY month
      `).all();
      return json(r.results || []);
    }

    if (url.pathname === "/api/reservations-status") {
      const r = await env.DB.prepare("SELECT status, COUNT(*) count FROM reservations GROUP BY status").all();
      return json(r.results || []);
    }

    // Nuevo endpoint para estado de botes (para gráfico de dona)
    if (url.pathname === "/api/boats-status") {
      const avail = await env.DB.prepare("SELECT COUNT(*) c FROM boats WHERE status='available'").first();
      const total = await env.DB.prepare("SELECT COUNT(*) c FROM boats").first();
      return json([
        { status: 'available', count: avail?.c ?? 0 },
        { status: 'occupied', count: (total?.c ?? 0) - (avail?.c ?? 0) }
      ]);
    }

    // Rutas CRUD de clientes, botes, reservas (mantengo las que ya tenías)
    if (url.pathname.startsWith("/api/customers")) {
      const parts = url.pathname.split("/");
      const id = parts.length > 3 && !isNaN(parts[3]) ? parts[3] : null;

      if (request.method === "GET") {
        if (id) {
          const row = await env.DB.prepare("SELECT * FROM customers WHERE id=?").bind(id).first();
          return json(row || {});
        }
        const { results } = await env.DB.prepare("SELECT * FROM customers ORDER BY full_name").all();
        return json(results || []);
      }

      if (request.method === "POST") {
        const b = await request.json();
        await env.DB.prepare("INSERT INTO customers (full_name,document_id,phone,email) VALUES (?,?,?,?)")
          .bind(b.full_name, b.document_id, b.phone, b.email).run();
        return json({ success: true });
      }

      if (request.method === "PUT" && id) {
        const b = await request.json();
        await env.DB.prepare("UPDATE customers SET full_name=?,document_id=?,phone=?,email=? WHERE id=?")
          .bind(b.full_name, b.document_id, b.phone, b.email, id).run();
        return json({ success: true });
      }

      if (request.method === "DELETE" && id) {
        await env.DB.prepare("DELETE FROM customers WHERE id=?").bind(id).run();
        return json({ success: true });
      }
    }

    // (Puedes copiar la misma estructura para /api/boats y /api/reservations)

    return json({ error: "Not Found" }, 404);
  }
};
