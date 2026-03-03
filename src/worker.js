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
  <title>BoatERP • Sistema de Gestión</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    :root { --primary: #1e40af; --success: #10b981; --danger: #ef4444; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Inter', sans-serif; background: #f8fafc; color: #1e2937; }
    .sidebar { width: 280px; height: 100vh; background: #0f172a; color: #fff; position: fixed; padding: 30px 20px; overflow-y: auto; }
    .sidebar h2 { margin: 0 0 40px; font-size: 1.9rem; font-weight: 700; }
    .menu-item { padding: 14px 20px; border-radius: 12px; margin-bottom: 6px; cursor: pointer; display: flex; align-items: center; gap: 14px; font-weight: 500; transition: .3s; }
    .menu-item:hover, .menu-item.active { background: var(--primary); }
    .header { margin-left: 280px; height: 72px; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: space-between; padding: 0 40px; font-weight: 600; color: #334155; }
    .content { margin-left: 280px; padding: 40px 50px; }
    .card { background: white; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.07); padding: 28px; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: #f1f5f9; padding: 14px; text-align: left; font-weight: 600; color: #64748b; }
    .data-table td { padding: 14px; border-bottom: 1px solid #e2e8f0; }
    .btn { padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-right: 6px; }
    .btn-success { background: var(--success); color: white; }
    .btn-edit { background: #3b82f6; color: white; }
    .btn-delete { background: var(--danger); color: white; }
    .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); justify-content: center; align-items: center; z-index: 9999; }
    .modal-overlay.active { display: flex; }
    .modal { background: white; border-radius: 16px; width: 620px; max-width: 94vw; padding: 32px; max-height: 92vh; overflow-y: auto; }
    .toast { position: fixed; bottom: 30px; right: 30px; padding: 16px 24px; border-radius: 12px; color: white; opacity: 0; transition: .4s; z-index: 99999; font-weight: 500; }
    .toast.show { opacity: 1; }
    .toast.success { background: var(--success); }
    .toast.error { background: var(--danger); }
    .form-group { margin-bottom: 18px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 500; color: #475569; }
    .form-group input, .form-group select { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; }
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
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
      <div class="card"><h4>Ingresos Hoy</h4><h2 id="inc">$0</h2></div>
      <div class="card"><h4>Reservas Activas</h4><h2 id="act">0</h2></div>
      <div class="card"><h4>Botes Disponibles</h4><h2 id="boats">0</h2></div>
      <div class="card"><h4>Clientes Totales</h4><h2 id="cust">0</h2></div>
    </div>
  \`;
  try {
    const d = await api("GET", "/api/dashboard");
    document.getElementById("inc").textContent = "$" + Number(d.income_today||0).toLocaleString();
    document.getElementById("act").textContent = d.active_reservations;
    document.getElementById("boats").textContent = d.available_boats;
    document.getElementById("cust").textContent = d.total_customers;
  } catch(e) { showToast("Error al cargar dashboard", "error"); }
}

async function loadCustomers(content) {
  content.innerHTML = \`<h1>Clientes <button class="btn btn-success" onclick="openCustomerModal()">+ Nuevo Cliente</button></h1>
    <div class="card table-container"><table class="data-table" id="custTable"></table></div>\`;
  try {
    const data = await api("GET", "/api/customers");
    let html = \`<thead><tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead><tbody>\`;
    data.forEach(c => {
      html += \`<tr>
        <td>\${c.full_name}</td>
        <td>\${c.document_id || '-'}</td>
        <td>\${c.phone || '-'}</td>
        <td>\${c.email || '-'}</td>
        <td>
          <button class="btn btn-edit" onclick="editCustomer(\${c.id})">Editar</button>
          <button class="btn btn-delete" onclick="deleteItem('customers',\${c.id})">Eliminar</button>
        </td>
      </tr>\`;
    });
    document.getElementById("custTable").innerHTML = html + \`</tbody>\`;
  } catch(e) { showToast("Error al cargar clientes", "error"); }
}

async function loadBoats(content) {
  content.innerHTML = \`<h1>Botes <button class="btn btn-success" onclick="openBoatModal()">+ Nuevo Bote</button></h1>
    <div class="card table-container"><table class="data-table" id="boatTable"></table></div>\`;
  try {
    const data = await api("GET", "/api/boats");
    let html = \`<thead><tr><th>Nombre</th><th>Tipo</th><th>Estado</th><th>Precio/h</th><th>Acciones</th></tr></thead><tbody>\`;
    data.forEach(b => {
      html += \`<tr>
        <td>\${b.name}</td>
        <td>\${b.type || '-'}</td>
        <td>\${b.status}</td>
        <td>RD$ \${Number(b.price_per_hour || 0).toFixed(2)}</td>
        <td>
          <button class="btn btn-edit" onclick="editBoat(\${b.id})">Editar</button>
          <button class="btn btn-delete" onclick="deleteItem('boats',\${b.id})">Eliminar</button>
        </td>
      </tr>\`;
    });
    document.getElementById("boatTable").innerHTML = html + \`</tbody>\`;
  } catch(e) { showToast("Error al cargar botes", "error"); }
}

async function loadReservations(content) {
  content.innerHTML = \`<h1>Reservas <button class="btn btn-success" onclick="openReservationModal()">+ Nueva Reserva</button></h1>
    <div class="card table-container"><table class="data-table" id="resTable"></table></div>\`;
  try {
    const data = await api("GET", "/api/reservations?full=true");
    let html = \`<thead><tr><th>ID</th><th>Cliente</th><th>Bote</th><th>Inicio</th><th>Fin</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>\`;
    data.forEach(r => {
      html += \`<tr>
        <td>#\${r.id}</td>
        <td>\${r.customer_name || '-'}</td>
        <td>\${r.boat_name || '-'}</td>
        <td>\${new Date(r.start_time).toLocaleString('es-DO')}</td>
        <td>\${new Date(r.end_time).toLocaleString('es-DO')}</td>
        <td><strong>\${r.status.toUpperCase()}</strong></td>
        <td>
          <button class="btn btn-edit" onclick="editReservation(\${r.id})">Editar</button>
          <button class="btn btn-delete" onclick="deleteItem('reservations',\${r.id})">Eliminar</button>
        </td>
      </tr>\`;
    });
    document.getElementById("resTable").innerHTML = html + \`</tbody>\`;
  } catch(e) { showToast("Error al cargar reservas", "error"); }
}

async function loadInvoices(content) {
  content.innerHTML = \`<h1>Facturación <button class="btn btn-success" onclick="openInvoiceModal()">+ Nueva Factura</button></h1>
    <div class="card table-container"><table class="data-table" id="invTable"></table></div>\`;
  try {
    const data = await api("GET", "/api/invoices?full=true");
    let html = \`<thead><tr><th>ID</th><th>Reserva</th><th>Cliente</th><th>Total</th><th>Método</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody>\`;
    data.forEach(i => {
      html += \`<tr>
        <td>#\${i.id}</td>
        <td>#\${i.reservation_id || '-'}</td>
        <td>\${i.customer_name || '-'}</td>
        <td>RD$ \${Number(i.total || 0).toFixed(2)}</td>
        <td>\${i.payment_method || '-'}</td>
        <td>\${i.created_at ? new Date(i.created_at).toLocaleDateString('es-DO') : '-'}</td>
        <td>
          <button class="btn btn-delete" onclick="deleteItem('invoices',\${i.id})">Eliminar</button>
        </td>
      </tr>\`;
    });
    document.getElementById("invTable").innerHTML = html + \`</tbody>\`;
  } catch(e) { showToast("Error al cargar facturas", "error"); }
}

function closeModal() {
  document.getElementById("modal").classList.remove("active");
}

async function deleteItem(table, id) {
  if (!confirm("¿Realmente eliminar este registro?")) return;
  try {
    await api("DELETE", \`/api/\${table}/\${id}\`);
    showToast("Eliminado correctamente", "success");
    loadView(table);
  } catch(e) {
    showToast("No se pudo eliminar", "error");
  }
}

// Inicio
loadView("dashboard");
</script>
</body>
</html>`;

      return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    // ────────────────────────────────────────────────
    //                    API ENDPOINTS
    // ────────────────────────────────────────────────

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

    if (url.pathname.startsWith("/api/customers")) {
      if (request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM customers ORDER BY full_name").all();
        return json(results || []);
      }
      if (request.method === "POST" || request.method === "PUT") {
        const body = await request.json();
        const id = url.pathname.split("/").pop();
        const isUpdate = request.method === "PUT" && id !== "customers";
        const query = isUpdate
          ? "UPDATE customers SET full_name=?, document_id=?, phone=?, email=? WHERE id=?"
          : "INSERT INTO customers (full_name, document_id, phone, email) VALUES (?,?,?,?)";
        const params = isUpdate
          ? [body.full_name, body.document_id, body.phone, body.email, id]
          : [body.full_name, body.document_id, body.phone, body.email];
        await env.DB.prepare(query).bind(...params).run();
        return json({ success: true });
      }
      if (request.method === "DELETE") {
        const id = url.pathname.split("/").pop();
        await env.DB.prepare("DELETE FROM customers WHERE id=?").bind(id).run();
        return json({ success: true });
      }
    }

    // Puedes replicar la misma lógica para /api/boats, /api/reservations, /api/invoices

    if (url.pathname.startsWith("/api/boats")) {
      if (request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM boats").all();
        return json(results || []);
      }
      // POST, PUT, DELETE similares a customers (agrega cuando lo necesites)
    }

    if (url.pathname.startsWith("/api/reservations")) {
      if (request.method === "GET") {
        const full = url.searchParams.get("full") === "true";
        if (full) {
          const { results } = await env.DB.prepare(`
            SELECT r.*, c.full_name AS customer_name, b.name AS boat_name
            FROM reservations r
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN boats b ON r.boat_id = b.id
            ORDER BY r.id DESC
          `).all();
          return json(results || []);
        } else {
          const { results } = await env.DB.prepare("SELECT * FROM reservations").all();
          return json(results || []);
        }
      }
      if (request.method === "POST") {
        const body = await request.json();
        await env.DB.prepare(`
          INSERT INTO reservations (customer_id, boat_id, start_time, end_time, status)
          VALUES (?,?,?,?, 'pendiente')
        `).bind(body.customer_id, body.boat_id, body.start_time, body.end_time).run();
        return json({ success: true });
      }
      if (request.method === "DELETE") {
        const id = url.pathname.split("/").pop();
        await env.DB.prepare("DELETE FROM reservations WHERE id=?").bind(id).run();
        return json({ success: true });
      }
    }

    return json({ error: "Not Found" }, 404);
  }
};
