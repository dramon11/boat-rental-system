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
    :root {
      --primary: #1e40af;
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
      --light: #f8fafc;
      --gray: #64748b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: var(--light);
      color: #1e2937;
    }
    .sidebar {
      width: 280px;
      height: 100vh;
      background: #0f172a;
      color: white;
      position: fixed;
      padding: 32px 20px;
      overflow-y: auto;
    }
    .sidebar h2 {
      font-size: 1.9rem;
      margin-bottom: 48px;
      font-weight: 700;
    }
    .menu-item {
      padding: 14px 20px;
      border-radius: 12px;
      margin-bottom: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 14px;
      font-weight: 500;
      transition: all 0.3s;
    }
    .menu-item:hover, .menu-item.active {
      background: var(--primary);
    }
    .header {
      margin-left: 280px;
      height: 72px;
      background: white;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 48px;
      font-weight: 600;
      color: #334155;
    }
    .content {
      margin-left: 280px;
      padding: 48px 60px;
    }
    h1 {
      font-size: 2.2rem;
      margin-bottom: 32px;
      color: #1e2937;
    }
    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.07);
      padding: 28px;
      margin-bottom: 32px;
    }
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
      gap: 32px;
    }
    .chart-box {
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.07);
      padding: 28px;
      height: 420px;
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .table-container {
      overflow-x: auto;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th {
      background: #f1f5f9;
      padding: 14px;
      text-align: left;
      font-weight: 600;
      color: var(--gray);
    }
    .data-table td {
      padding: 14px;
      border-bottom: 1px solid #e2e8f0;
    }
    .btn {
      padding: 10px 18px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      margin-right: 8px;
    }
    .btn-success { background: var(--success); color: white; }
    .btn-edit { background: #3b82f6; color: white; }
    .btn-delete { background: var(--danger); color: white; }
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.65);
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    .modal-overlay.active { display: flex; }
    .modal {
      background: white;
      border-radius: 16px;
      width: 640px;
      max-width: 94vw;
      padding: 36px;
      max-height: 92vh;
      overflow-y: auto;
    }
    .toast {
      position: fixed;
      bottom: 32px;
      right: 32px;
      padding: 16px 28px;
      border-radius: 12px;
      color: white;
      opacity: 0;
      transition: opacity 0.4s;
      z-index: 99999;
      font-weight: 500;
    }
    .toast.show { opacity: 1; }
    .toast.success { background: var(--success); }
    .toast.error { background: var(--danger); }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #475569;
    }
    .form-group input,
    .form-group select {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 1rem;
    }
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
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;margin-bottom:48px;">
      <div class="card"><h4>Ingresos Hoy</h4><h2 id="inc">$0</h2></div>
      <div class="card"><h4>Reservas Activas</h4><h2 id="act">0</h2></div>
      <div class="card"><h4>Botes Disponibles</h4><h2 id="boats">0</h2></div>
      <div class="card"><h4>Clientes Totales</h4><h2 id="cust">0</h2></div>
    </div>
    <div class="charts-grid">
      <div class="chart-box"><h3>Ingresos Mensuales (Barras)</h3><canvas id="barChart"></canvas></div>
      <div class="chart-box"><h3>Tendencia de Reservas (Línea)</h3><canvas id="lineChart"></canvas></div>
      <div class="chart-box full-width"><h3>Distribución de Estados de Reservas (Pie)</h3><canvas id="pieChart"></canvas></div>
    </div>
  \`;

  try {
    const d = await api("GET", "/api/dashboard");
    document.getElementById("inc").textContent = "$" + Number(d.income_today||0).toLocaleString();
    document.getElementById("act").textContent = d.active_reservations;
    document.getElementById("boats").textContent = d.available_boats;
    document.getElementById("cust").textContent = d.total_customers;

    // Datos de ejemplo para gráficos (puedes cambiar por datos reales vía API)
    const barData = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [{
        label: 'Ingresos (RD$)',
        data: [45000, 62000, 58000, 89000, 72000, 105000],
        backgroundColor: '#3b82f6',
        borderRadius: 6
      }]
    };

    const lineData = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [{
        label: 'Número de Reservas',
        data: [12, 19, 15, 28, 22, 35],
        borderColor: '#10b981',
        tension: 0.4,
        fill: false,
        pointBackgroundColor: '#10b981',
        pointRadius: 5
      }]
    };

    const pieData = {
      labels: ['Confirmadas', 'Pendientes', 'En Curso', 'Finalizadas', 'Canceladas'],
      datasets: [{
        data: [38, 15, 12, 25, 10],
        backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'],
        borderWidth: 0
      }]
    };

    const commonOpts = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    };

    charts.bar = new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: barData,
      options: commonOpts
    });

    charts.line = new Chart(document.getElementById('lineChart'), {
      type: 'line',
      data: lineData,
      options: commonOpts
    });

    charts.pie = new Chart(document.getElementById('pieChart'), {
      type: 'pie',
      data: pieData,
      options: { ...commonOpts, plugins: { legend: { position: 'right' } } }
    });
  } catch(e) {
    showToast("Error al cargar dashboard", "error");
    console.error(e);
  }
}

async function loadCustomers(content) {
  content.innerHTML = \`
    <h1>Clientes</h1>
    <button class="btn btn-success" style="margin-bottom:24px;" onclick="openCustomerModal()">+ Nuevo Cliente</button>
    <div class="card table-container">
      <table class="data-table" id="custTable">
        <thead><tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead>
        <tbody id="custBody"></tbody>
      </table>
    </div>
  \`;

  try {
    const data = await api("GET", "/api/customers");
    const tbody = document.getElementById("custBody");
    tbody.innerHTML = "";
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;">No hay clientes registrados</td></tr>';
      return;
    }
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
  } catch(e) {
    showToast("Error al cargar clientes", "error");
  }
}

async function openCustomerModal(id = null) {
  let title = id ? 'Editar Cliente' : 'Nuevo Cliente';
  let defaults = { full_name: '', document_id: '', phone: '', email: '' };

  if (id) {
    try {
      defaults = await api("GET", "/api/customers/" + id);
    } catch {}
  }

  document.getElementById("modalContent").innerHTML = \`
    <h2>\${title}</h2>
    <div class="form-group">
      <label>Nombre completo</label>
      <input id="c_name" value="\${defaults.full_name || ''}">
    </div>
    <div class="form-group">
      <label>Documento (Cédula/Pasaporte)</label>
      <input id="c_doc" value="\${defaults.document_id || ''}">
    </div>
    <div class="form-group">
      <label>Teléfono</label>
      <input id="c_phone" value="\${defaults.phone || ''}">
    </div>
    <div class="form-group">
      <label>Email</label>
      <input id="c_email" value="\${defaults.email || ''}">
    </div>
    <div style="margin-top:28px; text-align:right;">
      <button class="btn btn-success" onclick="saveCustomer(\${id || ''})">Guardar</button>
      <button class="btn" onclick="closeModal()">Cancelar</button>
    </div>
  \`;

  document.getElementById("modal").classList.add("active");
}

async function saveCustomer(id) {
  const body = {
    full_name: document.getElementById("c_name").value.trim(),
    document_id: document.getElementById("c_doc").value.trim(),
    phone: document.getElementById("c_phone").value.trim(),
    email: document.getElementById("c_email").value.trim()
  };

  if (!body.full_name) {
    return showToast("El nombre es obligatorio", "error");
  }

  try {
    if (id) {
      await api("PUT", "/api/customers/" + id, body);
      showToast("Cliente actualizado correctamente", "success");
    } else {
      await api("POST", "/api/customers", body);
      showToast("Cliente creado correctamente", "success");
    }
    closeModal();
    loadView("customers");
  } catch(e) {
    showToast("Error al guardar cliente", "error");
    console.error(e);
  }
}

function closeModal() {
  document.getElementById("modal").classList.remove("active");
}

async function deleteItem(table, id) {
  if (!confirm("¿Eliminar este registro? Esta acción no se puede deshacer.")) return;

  try {
    await api("DELETE", "/api/" + table + "/" + id);
    showToast("Registro eliminado correctamente", "success");
    loadView(table);
  } catch(e) {
    showToast("No se pudo eliminar el registro", "error");
  }
}

// Inicio
loadView("dashboard");
</script>
</body>
</html>`;

      return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    // API DASHBOARD
    if (url.pathname === "/api/dashboard") {
      let income_today = 0;
      let active_reservations = 0;
      let available_boats = 0;
      let total_customers = 0;

      try {
        const row = await env.DB.prepare("SELECT COALESCE(SUM(total),0) as s FROM invoices WHERE DATE(created_at) = DATE('now')").first();
        income_today = row?.s ?? 0;
      } catch {}

      try {
        const row = await env.DB.prepare("SELECT COUNT(*) as c FROM reservations WHERE status IN ('confirmada', 'activa')").first();
        active_reservations = row?.c ?? 0;
      } catch {}

      try {
        const row = await env.DB.prepare("SELECT COUNT(*) as c FROM boats WHERE status = 'available'").first();
        available_boats = row?.c ?? 0;
      } catch {}

      try {
        const row = await env.DB.prepare("SELECT COUNT(*) as c FROM customers").first();
        total_customers = row?.c ?? 0;
      } catch {}

      return json({ income_today, active_reservations, available_boats, total_customers });
    }

    // API CLIENTES (GET all, GET one, POST, PUT, DELETE)
    if (url.pathname.startsWith("/api/customers")) {
      const parts = url.pathname.split("/");
      const isSingle = parts.length > 3 && !isNaN(parts[3]);
      const id = isSingle ? parts[3] : null;

      if (request.method === "GET") {
        if (id) {
          const row = await env.DB.prepare("SELECT * FROM customers WHERE id = ?").bind(id).first();
          return json(row || {});
        } else {
          const { results } = await env.DB.prepare("SELECT * FROM customers ORDER BY full_name").all();
          return json(results || []);
        }
      }

      if (request.method === "POST") {
        const body = await request.json();
        await env.DB.prepare("INSERT INTO customers (full_name, document_id, phone, email) VALUES (?,?,?,?)")
          .bind(body.full_name, body.document_id, body.phone, body.email).run();
        return json({ success: true });
      }

      if (request.method === "PUT" && id) {
        const body = await request.json();
        await env.DB.prepare("UPDATE customers SET full_name=?, document_id=?, phone=?, email=? WHERE id=?")
          .bind(body.full_name, body.document_id, body.phone, body.email, id).run();
        return json({ success: true });
      }

      if (request.method === "DELETE" && id) {
        await env.DB.prepare("DELETE FROM customers WHERE id=?").bind(id).run();
        return json({ success: true });
      }
    }

    return json({ error: "Not Found" }, 404);
  }
};
