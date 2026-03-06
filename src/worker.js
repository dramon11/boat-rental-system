export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (data, status = 200) => new Response(JSON.stringify(data, null, 2), {
      status,
      headers: { "Content-Type": "application/json;charset=UTF-8" }
    });

    if (url.pathname === "/" && request.method === "GET") {
      return new Response(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>BoatERP - Versión Diagnóstico</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    :root { --primary:#1e40af; --success:#10b981; --danger:#ef4444; --light:#f8fafc; --gray:#64748b; }
    body { font-family:'Inter',sans-serif; background:var(--light); color:#1e2937; margin:0; }
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
    #debug { background:#fee2e2; padding:16px; margin:16px 0; border-radius:8px; white-space:pre-wrap; font-family:monospace; }
  </style>
</head>
<body>
<div class="sidebar">
  <h2>⚓ BoatERP</h2>
  <div class="menu-item active" onclick="loadView('dashboard')"><i class="fas fa-chart-line"></i> Dashboard</div>
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
<div id="debug"></div>

<script>
const debug = document.getElementById("debug");

function logDebug(msg) {
  debug.innerHTML += msg + "\\n";
  console.log(msg);
}

function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast " + type + " show";
  setTimeout(() => t.className = "toast", 4000);
}

async function api(method, path, body = null) {
  logDebug(\`→ \${method} \${path}\`);
  try {
    const opts = { method, headers: {} };
    if (body) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(path, opts);
    logDebug(\`← \${res.status} \${res.statusText}\`);
    if (!res.ok) {
      const err = await res.text();
      logDebug("Error API: " + err);
      throw new Error(err);
    }
    const data = await res.json();
    logDebug("Respuesta OK");
    return data;
  } catch (e) {
    logDebug("Fallo fetch: " + e.message);
    showToast("Error de conexión: " + e.message, "error");
    throw e;
  }
}

async function loadView(view) {
  const content = document.getElementById("mainContent");
  content.innerHTML = "<h1>Cargando " + view + "...</h1>";

  if (view === "dashboard") {
    content.innerHTML = \`
      <h1>Dashboard (modo diagnóstico)</h1>
      <div class="stats-grid">
        <div class="stat-card"><h4>Ingresos Hoy</h4><h2 id="inc">$0</h2></div>
        <div class="stat-card"><h4>Reservas Activas</h4><h2 id="act">0</h2></div>
      </div>
      <p>Revisa la consola (F12) y el panel debug abajo para ver qué falla.</p>
    \`;
    try {
      const counts = await api("GET", "/api/dashboard");
      document.getElementById("inc").textContent = "$" + Number(counts.income_today || 0).toLocaleString();
      document.getElementById("act").textContent = counts.active_reservations || 0;
    } catch (e) {
      content.innerHTML += "<p style='color:red'>Error al cargar datos: " + e.message + "</p>";
    }
  }

  if (view === "reservations") {
    content.innerHTML = \`
      <h1>Reservas</h1>
      <button class="btn btn-success" onclick="openReservationModal()">+ Nueva Reserva</button>
      <div class="card table-container">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Cliente</th><th>Bote</th><th>Inicio</th><th>Fin</th><th>Total</th><th>Anticipo</th><th>Saldo</th><th>Estado</th></tr></thead>
          <tbody id="resBody"></tbody>
        </table>
      </div>
    \`;
    try {
      const data = await api("GET", "/api/reservations?full=true");
      const tbody = document.getElementById("resBody");
      tbody.innerHTML = "";
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="8">No hay reservas</td></tr>';
      } else {
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
          \`;
          tbody.appendChild(tr);
        });
      }
    } catch (e) {
      content.innerHTML += "<p style='color:red'>Error al cargar reservas: " + e.message + "</p>";
    }
  }

  if (view === "invoices") {
    content.innerHTML = \`
      <h1>Facturación</h1>
      <button class="btn btn-success" onclick="openInvoiceModal()">+ Registrar Pago</button>
      <div class="card table-container">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Reserva</th><th>Tipo</th><th>Monto</th><th>Método</th><th>Fecha</th></tr></thead>
          <tbody id="invBody"></tbody>
        </table>
      </div>
    \`;
    try {
      const data = await api("GET", "/api/invoices?full=true");
      const tbody = document.getElementById("invBody");
      tbody.innerHTML = "";
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="6">No hay facturas</td></tr>';
      } else {
        data.forEach(i => {
          const tr = document.createElement("tr");
          tr.innerHTML = \`
            <td>#\${i.id}</td>
            <td>#\${i.reservation_id || '-'}</td>
            <td>\${i.type}</td>
            <td>RD$ \${Number(i.amount_paid||0).toFixed(2)}</td>
            <td>\${i.payment_method || '-'}</td>
            <td>\${i.created_at ? new Date(i.created_at).toLocaleString('es-DO') : '-'}</td>
          \`;
          tbody.appendChild(tr);
        });
      }
    } catch (e) {
      content.innerHTML += "<p style='color:red'>Error al cargar facturas: " + e.message + "</p>";
    }
  }
}

async function openInvoiceModal() {
  document.getElementById("modalContent").innerHTML = \`
    <h2>Registrar Pago</h2>
    <div class="form-group"><label>Reserva ID</label><input type="number" id="inv_res_id" placeholder="ID de la reserva"></div>
    <div class="form-group"><label>Tipo</label><select id="inv_type">
      <option value="anticipo">Anticipo</option>
      <option value="final">Pago final</option>
    </select></div>
    <div class="form-group"><label>Monto (RD$)</label><input type="number" step="0.01" id="inv_amount"></div>
    <div class="form-group"><label>Método</label><input id="inv_method" value="efectivo"></div>
    <div style="text-align:right;">
      <button class="btn btn-success" onclick="saveInvoice()">Guardar</button>
      <button class="btn" onclick="closeModal()">Cancelar</button>
    </div>
  \`;
  document.getElementById("modal").classList.add("active");
}

async function saveInvoice() {
  const resId = parseInt(document.getElementById("inv_res_id").value);
  const type = document.getElementById("inv_type").value;
  const amount = parseFloat(document.getElementById("inv_amount").value);
  const method = document.getElementById("inv_method").value;

  if (!resId || isNaN(amount) || amount <= 0) {
    return showToast("Complete correctamente", "error");
  }

  try {
    await api("POST", "/api/invoices", {
      reservation_id: resId,
      type,
      amount_paid: amount,
      payment_method: method
    });
    showToast("Pago registrado", "success");
    closeModal();
    loadView("invoices");
  } catch (e) {
    showToast("No se pudo guardar: " + e.message, "error");
  }
}

function closeModal() {
  document.getElementById("modal").classList.remove("active");
}

// Inicio
loadView("dashboard");
</script>
</body>
</html>`, {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    // API endpoints básicos para diagnóstico
    if (url.pathname === "/api/dashboard") {
      return json({ income_today: 0, active_reservations: 0, available_boats: 0, total_customers: 0 });
    }

    if (url.pathname.startsWith("/api/invoices")) {
      if (request.method === "GET") {
        return json([]);
      }
      if (request.method === "POST") {
        const b = await request.json();
        logDebug("POST /api/invoices recibido: " + JSON.stringify(b));
        // Aquí debería ir la lógica real de INSERT + UPDATE
        // Por ahora devolvemos success para probar frontend
        return json({ success: true, message: "Simulado - pago registrado" });
      }
    }

    return json({ error: "Not Found" }, 404);
  }
};
