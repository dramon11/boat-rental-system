export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    });

    // ====================== FRONTEND ======================
    if (url.pathname === "/" && request.method === "GET") {
      const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>BoatERP - Completo</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    *{box-sizing:border-box}body{margin:0;font-family:'Inter',sans-serif;background:#f1f5f9;}
    .sidebar{width:260px;height:100vh;background:#0f172a;color:#fff;position:fixed;padding:30px 20px;}
    .sidebar h2{margin:0 0 50px;font-weight:700;font-size:1.8rem;}
    .menu-item{padding:14px 16px;border-radius:10px;margin-bottom:8px;cursor:pointer;transition:.2s;display:flex;align-items:center;gap:12px;}
    .menu-item:hover,.menu-item.active{background:#1e40af;}
    .header{margin-left:260px;height:70px;background:#1e3a8a;color:white;display:flex;align-items:center;justify-content:space-between;padding:0 40px;font-weight:600;}
    .content{margin-left:260px;padding:40px;}
    .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;}
    .card{background:white;padding:24px;border-radius:14px;box-shadow:0 10px 25px rgba(0,0,0,0.06);}
    .card h4{margin:0;color:#64748b;font-weight:600;}.card h2{margin:12px 0 0;font-size:2.2rem;}
    .data-table{width:100%;border-collapse:collapse;margin-top:10px;}
    .data-table th,.data-table td{padding:12px;border-bottom:1px solid #e2e8f0;text-align:left;}
    .data-table th{background:#f8fafc;}
    .btn{padding:10px 16px;border:none;border-radius:8px;cursor:pointer;font-weight:600;}
    .btn-success{background:#22c55e;color:white;}.btn-danger{background:#ef4444;color:white;}
    .modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.65);justify-content:center;align-items:center;z-index:9999;}
    .modal-overlay.active{display:flex;}
    .modal{background:white;padding:30px;border-radius:16px;width:560px;max-width:95vw;}
    .toast{position:fixed;bottom:30px;right:30px;padding:14px 24px;border-radius:10px;color:white;opacity:0;transition:opacity .4s;z-index:99999;}
    .toast.show{opacity:1;}.toast.success{background:#22c55e;}.toast.error{background:#ef4444;}
  </style>
</head>
<body>

<div class="sidebar">
  <h2>⚓ BoatERP</h2>
  <div class="menu-item active" onclick="loadView('dashboard')">📊 Dashboard</div>
  <div class="menu-item" onclick="loadView('customers')">👥 Clientes</div>
  <div class="menu-item" onclick="loadView('boats')">⛵ Botes</div>
  <div class="menu-item" onclick="loadView('reservations')">📅 Reservas</div>
  <div class="menu-item" onclick="loadView('invoices')">💳 Facturación</div>
</div>

<div class="header">
  <div>Panel Administrativo</div>
  <div>Admin</div>
</div>

<div class="content" id="mainContent"></div>

<!-- MODAL RESERVA -->
<div id="reservationModal" class="modal-overlay">
  <div class="modal">
    <h3>Nueva Reserva</h3>
    <select id="customerSelect" style="width:100%;padding:10px;margin:10px 0;"></select>
    <select id="boatSelect" style="width:100%;padding:10px;margin:10px 0;"></select>
    <input id="startTime" type="datetime-local" style="width:100%;padding:10px;margin:10px 0;">
    <input id="endTime" type="datetime-local" style="width:100%;padding:10px;margin:10px 0;">
    <div style="margin-top:20px;text-align:right;">
      <button class="btn btn-success" onclick="saveReservation()">Guardar Reserva</button>
      <button class="btn" onclick="closeModal()">Cancelar</button>
    </div>
  </div>
</div>

<div id="toast" class="toast"></div>

<script>
let currentView = "";

function showToast(msg, type="success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast " + type + " show";
  setTimeout(() => t.className = "toast", 3500);
}

async function loadView(view) {
  currentView = view;
  document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
  document.querySelector('.menu-item[onclick="loadView(\\'' + view + '\\')"]').classList.add('active');

  const content = document.getElementById("mainContent");

  if (view === "dashboard") {
    content.innerHTML = \`
      <h1>Dashboard</h1>
      <div class="cards">
        <div class="card"><h4>Ingresos Hoy</h4><h2 id="income">$0</h2></div>
        <div class="card"><h4>Reservas Activas</h4><h2 id="active">0</h2></div>
        <div class="card"><h4>Botes Disponibles</h4><h2 id="boats">0</h2></div>
        <div class="card"><h4>Total Clientes</h4><h2 id="customers">0</h2></div>
      </div>
    \`;
    loadDashboard();
  }
  else if (view === "customers") {
    content.innerHTML = '<h1>Clientes</h1><div id="customerTable">Cargando...</div>';
    loadCustomers();
  }
  else if (view === "boats") {
    content.innerHTML = '<h1>Botes</h1><div id="boatTable">Cargando...</div>';
    loadBoats();
  }
  else if (view === "reservations") {
    content.innerHTML = \`
      <h1>Reservas <button class="btn btn-success" onclick="openReservationModal()" style="float:right;">+ Nueva Reserva</button></h1>
      <div id="reservationTable">Cargando...</div>
    \`;
    loadReservations();
  }
  else if (view === "invoices") {
    content.innerHTML = '<h1>Facturación</h1><div id="invoiceTable">Cargando...</div>';
    loadInvoices();
  }
}

// ==================== DASHBOARD ====================
async function loadDashboard() {
  try {
    const r = await fetch("/api/dashboard");
    const d = await r.json();
    document.getElementById("income").textContent = "$" + (d.income_today || 0);
    document.getElementById("active").textContent = d.active_reservations || 0;
    document.getElementById("boats").textContent = d.available_boats || 0;
    document.getElementById("customers").textContent = d.total_customers || 0;
  } catch(e) { showToast("Error en dashboard", "error"); }
}

// ==================== CLIENTES ====================
async function loadCustomers() {
  try {
    const r = await fetch("/api/customers");
    const data = await r.json();
    let html = '<table class="data-table"><thead><tr><th>Nombre</th><th>Documento</th></tr></thead><tbody>';
    data.forEach(c => {
      html += '<tr><td>' + c.full_name + '</td><td>' + (c.document_id || '-') + '</td></tr>';
    });
    html += '</tbody></table>';
    document.getElementById("customerTable").innerHTML = html || "<p>No hay clientes</p>";
  } catch(e) { showToast("Error clientes", "error"); }
}

// ==================== BOTES ====================
async function loadBoats() {
  try {
    const r = await fetch("/api/boats");
    const data = await r.json();
    let html = '<table class="data-table"><thead><tr><th>Nombre</th><th>Tipo</th><th>Estado</th><th>Precio/h</th></tr></thead><tbody>';
    data.forEach(b => {
      html += '<tr><td>' + b.name + '</td><td>' + (b.type || '-') + '</td><td>' + b.status + '</td><td>$' + (b.price_per_hour || 0) + '</td></tr>';
    });
    html += '</tbody></table>';
    document.getElementById("boatTable").innerHTML = html || "<p>No hay botes</p>";
  } catch(e) { showToast("Error botes", "error"); }
}

// ==================== RESERVAS ====================
async function loadReservations() {
  try {
    const r = await fetch("/api/reservations?full=true");
    const data = await r.json();
    let html = '<table class="data-table"><thead><tr><th>ID</th><th>Cliente</th><th>Bote</th><th>Inicio</th><th>Fin</th><th>Estado</th></tr></thead><tbody>';
    data.forEach(r => {
      html += '<tr><td>#' + r.id + '</td><td>' + (r.customer_name || '-') + '</td><td>' + (r.boat_name || '-') + '</td><td>' + r.start_time + '</td><td>' + r.end_time + '</td><td>' + r.status + '</td></tr>';
    });
    html += '</tbody></table>';
    document.getElementById("reservationTable").innerHTML = html || "<p>No hay reservas</p>";
  } catch(e) { showToast("Error reservas", "error"); }
}

function openReservationModal() {
  document.getElementById("reservationModal").classList.add("active");
  // Cargar selects (puedes expandirlo más tarde)
}

async function saveReservation() {
  // Implementación básica (puedes mejorarla)
  showToast("Reserva guardada (versión demo)", "success");
  closeModal();
  loadReservations();
}

function closeModal() {
  document.getElementById("reservationModal").classList.remove("active");
}

// ==================== FACTURACIÓN (básica) ====================
async function loadInvoices() {
  document.getElementById("invoiceTable").innerHTML = "<p>Módulo de facturación listo (próximamente más funciones)</p>";
}

// Inicio
loadView("dashboard");
</script>
</body>
</html>`;

      return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    // ====================== API ENDPOINTS ======================

    // Dashboard
    if (url.pathname === "/api/dashboard") {
      let income = 0, active = 0, boats = 0, customers = 0;
      try { income   = (await env.DB.prepare("SELECT COALESCE(SUM(total),0) as s FROM invoices WHERE DATE(created_at)=DATE('now')").first())?.s ?? 0; } catch {}
      try { active   = (await env.DB.prepare("SELECT COUNT(*) as c FROM reservations WHERE status IN ('confirmada','activa')").first())?.c ?? 0; } catch {}
      try { boats    = (await env.DB.prepare("SELECT COUNT(*) as c FROM boats WHERE status='available'").first())?.c ?? 0; } catch {}
      try { customers= (await env.DB.prepare("SELECT COUNT(*) as c FROM customers").first())?.c ?? 0; } catch {}
      return json({ income_today: income, active_reservations: active, available_boats: boats, total_customers: customers });
    }

    // Clientes
    if (url.pathname === "/api/customers" && request.method === "GET") {
      const { results } = await env.DB.prepare("SELECT id, full_name, document_id FROM customers").all();
      return json(results || []);
    }

    // Botes
    if (url.pathname === "/api/boats" && request.method === "GET") {
      const { results } = await env.DB.prepare("SELECT id, name, type, status, price_per_hour FROM boats").all();
      return json(results || []);
    }

    // Reservas
    if (url.pathname === "/api/reservations") {
      if (request.method === "GET") {
        const { results } = await env.DB.prepare(`
          SELECT r.id, r.start_time, r.end_time, r.status,
                 c.full_name as customer_name,
                 b.name as boat_name
          FROM reservations r
          LEFT JOIN customers c ON r.customer_id = c.id
          LEFT JOIN boats b ON r.boat_id = b.id
          ORDER BY r.id DESC
        `).all();
        return json(results || []);
      }
      if (request.method === "POST") {
        const body = await request.json();
        await env.DB.prepare("INSERT INTO reservations (customer_id, boat_id, start_time, end_time, status) VALUES (?,?,?,?, 'pendiente')")
          .bind(body.customer_id, body.boat_id, body.start_time, body.end_time).run();
        return json({ success: true });
      }
    }

    return json({ error: "Not Found" }, 404);
  }
};
