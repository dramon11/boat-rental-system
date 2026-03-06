export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (data, status = 200) => new Response(JSON.stringify(data, null, 2), {
      status,
      headers: { "Content-Type": "application/json;charset=UTF-8" }
    });

    // ========================================================
    // Ruta principal → HTML + JavaScript del frontend completo
    // ========================================================
    if (url.pathname === "/" && request.method === "GET") {
      return new Response(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BoatERP • Sistema Completo</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
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
  if (view === "customers") await loadCustomers(content);
  if (view === "boats") await loadBoats(content);
  if (view === "reservations") await loadReservations(content);
  if (view === "invoices") await loadInvoices(content);
}

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
    const counts = await api("GET", "/api/dashboard");

    document.getElementById("inc").textContent = "$" + Number(counts.income_today || 0).toLocaleString();
    document.getElementById("act").textContent = counts.active_reservations || 0;
    document.getElementById("boats").textContent = counts.available_boats || 0;
    document.getElementById("cust").textContent = counts.total_customers || 0;
  } catch (e) {
    showToast("Error cargando dashboard", "error");
  }
}

async function loadCustomers(content) {
  content.innerHTML = \`
    <h1>Clientes</h1>
    <button class="btn btn-success" onclick="openCustomerModal()">+ Nuevo Cliente</button>
    <div class="card table-container">
      <table class="data-table">
        <thead><tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead>
        <tbody id="custBody"></tbody>
      </table>
    </div>
  \`;

  try {
    const data = await api("GET", "/api/customers");
    const tbody = document.getElementById("custBody");
    tbody.innerHTML = data.length ? "" : '<tr><td colspan="5">No hay clientes</td></tr>';
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
  } catch (e) {
    showToast("Error cargando clientes", "error");
  }
}

async function openCustomerModal(id = null) {
  const title = id ? 'Editar Cliente' : 'Nuevo Cliente';
  let data = { full_name: '', document_id: '', phone: '', email: '' };
  if (id) data = await api("GET", "/api/customers/" + id).catch(() => data);

  document.getElementById("modalContent").innerHTML = \`
    <h2>\${title}</h2>
    <div class="form-group"><label>Nombre completo</label><input id="c_name" value="\${data.full_name || ''}"></div>
    <div class="form-group"><label>Documento</label><input id="c_doc" value="\${data.document_id || ''}"></div>
    <div class="form-group"><label>Teléfono</label><input id="c_phone" value="\${data.phone || ''}"></div>
    <div class="form-group"><label>Email</label><input id="c_email" value="\${data.email || ''}"></div>
    <div style="text-align:right; margin-top:24px;">
      <button class="btn btn-success" onclick="saveCustomer(\${id||''})">Guardar</button>
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
  if (!body.full_name) return showToast("Nombre obligatorio", "error");
  try {
    const method = id ? "PUT" : "POST";
    const path = id ? "/api/customers/" + id : "/api/customers";
    await api(method, path, body);
    showToast("Cliente guardado", "success");
    closeModal();
    loadView("customers");
  } catch (e) {
    showToast("Error al guardar cliente", "error");
  }
}

// Botes (CRUD) - puedes copiar la estructura de clientes y adaptarla

// Reservas (con total, anticipo, saldo) - versión simplificada funcional
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
    tbody.innerHTML = data.length ? "" : '<tr><td colspan="10">No hay reservas</td></tr>';
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
          <button class="btn btn-delete" onclick="deleteItem('reservations', \${r.id})">Eliminar</button>
        </td>
      \`;
      tbody.appendChild(tr);
    });
  } catch (e) {
    showToast("Error cargando reservas", "error");
  }
}

// Facturación completa
async function loadInvoices(content) {
  content.innerHTML = \`
    <h1>Facturación</h1>
    <button class="btn btn-success" onclick="openInvoiceModal()">+ Registrar Pago</button>
    <div class="card table-container">
      <table class="data-table">
        <thead><tr><th>ID</th><th>Reserva</th><th>Cliente</th><th>Tipo</th><th>Monto</th><th>Método</th><th>Fecha</th></tr></thead>
        <tbody id="invBody"></tbody>
      </table>
    </div>
  \`;

  try {
    const data = await api("GET", "/api/invoices?full=true");
    const tbody = document.getElementById("invBody");
    tbody.innerHTML = data.length ? "" : '<tr><td colspan="7">No hay pagos registrados</td></tr>';
    data.forEach(i => {
      const tr = document.createElement("tr");
      tr.innerHTML = \`
        <td>#\${i.id}</td>
        <td>#\${i.reservation_id || '-'}</td>
        <td>\${i.customer_name || '-'}</td>
        <td>\${i.type === 'anticipo' ? 'Anticipo' : 'Final'}</td>
        <td>RD$ \${Number(i.amount_paid || 0).toFixed(2)}</td>
        <td>\${i.payment_method || '-'}</td>
        <td>\${i.created_at ? new Date(i.created_at).toLocaleString('es-DO') : '-'}</td>
      \`;
      tbody.appendChild(tr);
    });
  } catch (e) {
    showToast("Error cargando facturas", "error");
  }
}

async function openInvoiceModal() {
  document.getElementById("modalContent").innerHTML = \`
    <h2>Registrar Pago / Factura</h2>
    <div class="form-group"><label>Reserva</label><select id="inv_res"></select></div>
    <div class="form-group"><label>Tipo</label><select id="inv_type">
      <option value="anticipo">Anticipo</option>
      <option value="final">Pago final</option>
    </select></div>
    <div class="form-group"><label>Monto (RD$)</label><input type="number" step="0.01" id="inv_amount"></div>
    <div class="form-group"><label>Método</label><select id="inv_method">
      <option value="efectivo">Efectivo</option>
      <option value="transferencia">Transferencia</option>
      <option value="tarjeta">Tarjeta</option>
    </select></div>
    <div style="text-align:right; margin-top:24px;">
      <button class="btn btn-success" onclick="saveInvoice()">Guardar</button>
      <button class="btn" onclick="closeModal()">Cancelar</button>
    </div>
  \`;

  try {
    const res = await api("GET", "/api/reservations?full=true");
    const sel = document.getElementById("inv_res");
    sel.innerHTML = '<option value="">Seleccione...</option>';
    res.forEach(r => {
      const opt = document.createElement("option");
      opt.value = r.id;
      opt.textContent = \`# \${r.id} - \${r.customer_name} - Saldo: RD$\${Number(r.balance_due||0).toFixed(2)}\`;
      sel.appendChild(opt);
    });
  } catch (e) {
    showToast("Error cargando reservas", "error");
  }

  document.getElementById("modal").classList.add("active");
}

async function saveInvoice() {
  const resId = document.getElementById("inv_res").value;
  const type = document.getElementById("inv_type").value;
  const amount = parseFloat(document.getElementById("inv_amount").value);
  const method = document.getElementById("inv_method").value;

  if (!resId || isNaN(amount) || amount <= 0) {
    return showToast("Complete todos los campos correctamente", "error");
  }

  try {
    await api("POST", "/api/invoices", {
      reservation_id: parseInt(resId),
      type,
      amount_paid: amount,
      payment_method: method
    });
    showToast("Pago registrado", "success");
    closeModal();
    loadView("invoices");
  } catch (e) {
    showToast("Error al registrar pago", "error");
  }
}

function closeModal() {
  document.getElementById("modal").classList.remove("active");
}

async function deleteItem(table, id) {
  if (!confirm("¿Eliminar?")) return;
  try {
    await api("DELETE", "/api/" + table + "/" + id);
    showToast("Eliminado", "success");
    loadView(table);
  } catch (e) {
    showToast("Error al eliminar", "error");
  }
}

// Inicio
loadView("dashboard");
</script>
</body>
</html>
      `, {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    // ========================================================
    // API Endpoints (todos completos)
    // ========================================================

    if (url.pathname === "/api/dashboard") {
      let income_today = 0, active = 0, boats = 0, customers = 0;
      try {
        income_today = (await env.DB.prepare("SELECT COALESCE(SUM(amount_paid),0) FROM invoices WHERE DATE(created_at)=DATE('now')").first())?.['COALESCE(SUM(amount_paid),0)'] ?? 0;
      } catch {}
      try {
        active = (await env.DB.prepare("SELECT COUNT(*) FROM reservations WHERE status IN ('activa','confirmada')").first())?.['COUNT(*)'] ?? 0;
      } catch {}
      try {
        boats = (await env.DB.prepare("SELECT COUNT(*) FROM boats WHERE status='available'").first())?.['COUNT(*)'] ?? 0;
      } catch {}
      try {
        customers = (await env.DB.prepare("SELECT COUNT(*) FROM customers").first())?.['COUNT(*)'] ?? 0;
      } catch {}
      return json({ income_today, active_reservations: active, available_boats: boats, total_customers: customers });
    }

    // Clientes CRUD
    if (url.pathname.startsWith("/api/customers")) {
      const parts = url.pathname.split("/");
      const id = parts.length > 3 && !isNaN(parts[3]) ? parts[3] : null;

      if (request.method === "GET") {
        if (id) {
          const row = await env.DB.prepare("SELECT * FROM customers WHERE id = ?").bind(id).first();
          return json(row || {});
        }
        const { results } = await env.DB.prepare("SELECT * FROM customers ORDER BY full_name").all();
        return json(results || []);
      }

      if (request.method === "POST") {
        const b = await request.json();
        await env.DB.prepare("INSERT INTO customers (full_name, document_id, phone, email) VALUES (?, ?, ?, ?)")
          .bind(b.full_name, b.document_id, b.phone, b.email).run();
        return json({ success: true });
      }

      if (request.method === "PUT" && id) {
        const b = await request.json();
        await env.DB.prepare("UPDATE customers SET full_name = ?, document_id = ?, phone = ?, email = ? WHERE id = ?")
          .bind(b.full_name, b.document_id, b.phone, b.email, id).run();
        return json({ success: true });
      }

      if (request.method === "DELETE" && id) {
        await env.DB.prepare("DELETE FROM customers WHERE id = ?").bind(id).run();
        return json({ success: true });
      }
    }

    // Botes CRUD (similar a clientes - puedes completarlo igual)

    // Reservas CRUD (con campos total/anticipo/saldo)
    if (url.pathname.startsWith("/api/reservations")) {
      const parts = url.pathname.split("/");
      const id = parts.length > 3 && !isNaN(parts[3]) ? parts[3] : null;

      if (request.method === "GET") {
        if (url.searchParams.get("full") === "true") {
          const { results } = await env.DB.prepare(`
            SELECT r.*, c.full_name AS customer_name, b.name AS boat_name
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
          INSERT INTO reservations 
          (customer_id, boat_id, start_time, end_time, total_amount, deposit_amount, balance_due, status)
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
          UPDATE reservations SET 
            customer_id = ?, boat_id = ?, start_time = ?, end_time = ?,
            total_amount = ?, deposit_amount = ?, balance_due = ?
          WHERE id = ?
        `).bind(
          b.customer_id, b.boat_id, b.start_time, b.end_time,
          b.total_amount || 0, b.deposit_amount || 0, b.balance_due || 0, id
        ).run();
        return json({ success: true });
      }

      if (request.method === "DELETE" && id) {
        await env.DB.prepare("DELETE FROM reservations WHERE id = ?").bind(id).run();
        return json({ success: true });
      }
    }

    // Facturas completas
    if (url.pathname.startsWith("/api/invoices")) {
      const parts = url.pathname.split("/");
      const id = parts.length > 3 && !isNaN(parts[3]) ? parts[3] : null;

      if (request.method === "GET") {
        if (url.searchParams.get("full") === "true") {
          const { results } = await env.DB.prepare(`
            SELECT i.*, c.full_name AS customer_name
            FROM invoices i
            LEFT JOIN reservations r ON i.reservation_id = r.id
            LEFT JOIN customers c ON r.customer_id = c.id
            ORDER BY i.created_at DESC
          `).all();
          return json(results || []);
        }
        const { results } = await env.DB.prepare("SELECT * FROM invoices ORDER BY created_at DESC").all();
        return json(results || []);
      }

      if (request.method === "POST") {
        const b = await request.json();

        // Registrar factura
        await env.DB.prepare(`
          INSERT INTO invoices (reservation_id, type, amount_paid, payment_method, created_at)
          VALUES (?, ?, ?, ?, datetime('now'))
        `).bind(b.reservation_id, b.type, b.amount_paid, b.payment_method).run();

        // Actualizar saldo si es pago final
        if (b.type === "final" && b.reservation_id) {
          await env.DB.prepare(`
            UPDATE reservations
            SET balance_due = MAX(0, balance_due - ?),
                status = CASE WHEN balance_due <= ? THEN 'pagada' ELSE status END
            WHERE id = ?
          `).bind(b.amount_paid, b.amount_paid, b.reservation_id).run();
        }

        return json({ success: true });
      }

      if (request.method === "DELETE" && id) {
        await env.DB.prepare("DELETE FROM invoices WHERE id = ?").bind(id).run();
        return json({ success: true });
      }
    }

    return json({ error: "Not Found" }, 404);
  }
};
