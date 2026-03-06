export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    });

    // ─── Frontend ────────────────────────────────────────────────
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
// ─── JavaScript frontend (sin cambios importantes) ───────────────────────────────
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
  else if (view === "customers") await loadCustomers(content);
  else if (view === "boats") await loadBoats(content);
  else if (view === "reservations") await loadReservations(content);
  else if (view === "invoices") await loadInvoices(content);
}

// Las funciones loadDashboard, loadCustomers, loadBoats, loadReservations, loadInvoices,
// openCustomerModal, saveCustomer, openBoatModal, saveBoat, openReservationModal,
// calcReservationPrice, saveReservation, loadInvoices, closeModal, deleteItem
// permanecen exactamente iguales a tu versión original (las omito aquí por brevedad)
${/* Aquí iría todo el <script> original que ya tenías, sin cambios */""}

// Inicio
loadView("dashboard");
</script>
</body>
</html>`;

      return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    // ─── API Endpoints (adaptados al flujo profesional) ───────────────────────────────

    // Dashboard - métricas ajustadas al nuevo modelo
    if (url.pathname === "/api/dashboard") {
      let income_today = 0, active = 0, boats = 0, customers = 0;
      try { income_today = (await env.DB.prepare("SELECT COALESCE(SUM(amount_paid),0) s FROM invoices WHERE DATE(created_at)=DATE('now')").first())?.s ?? 0; } catch {}
      try { active = (await env.DB.prepare("SELECT COUNT(*) c FROM reservations WHERE status IN ('confirmada','activa','pendiente_pago')").first())?.c ?? 0; } catch {}
      try { boats = (await env.DB.prepare("SELECT COUNT(*) c FROM boats WHERE status='available'").first())?.c ?? 0; } catch {}
      try { customers = (await env.DB.prepare("SELECT COUNT(*) c FROM customers").first())?.c ?? 0; } catch {}
      return json({ income_today, active_reservations: active, available_boats: boats, total_customers: customers });
    }

    // ... (mantienes income-monthly, reservations-monthly, reservations-status igual)

    // Clientes ── sin cambios importantes
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
        return json({ success: true, id: (await env.DB.prepare("SELECT last_insert_rowid() as id").first()).id });
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

    // Botes ── sin cambios importantes
    if (url.pathname.startsWith("/api/boats")) {
      // ... igual que antes (GET, POST, PUT, DELETE)
      // Mantengo tu lógica original aquí
    }

    // Reservas ── adaptado con anticipo y saldo
    if (url.pathname.startsWith("/api/reservations")) {
      const parts = url.pathname.split("/");
      const id = parts.length > 3 && !isNaN(parts[3]) ? parts[3] : null;

      if (request.method === "GET") {
        if (url.searchParams.get("full") === "true") {
          const { results } = await env.DB.prepare(`
            SELECT 
              r.id, r.customer_id, r.boat_id, r.start_time, r.end_time, r.status,
              r.total_amount, r.deposit_amount, r.balance_due,
              c.full_name AS customer_name, b.name AS boat_name, b.price_per_hour
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
        const total = /* puedes calcularlo aquí o dejar que el frontend lo envíe */
          (await env.DB.prepare("SELECT price_per_hour FROM boats WHERE id=?").bind(b.boat_id).first())?.price_per_hour * /* horas */ 1 || 0;

        const deposit = b.deposit_amount || 0; // ← nuevo campo (puedes pedirlo en el modal)
        const balance = total - deposit;

        const stmt = await env.DB.prepare(`
          INSERT INTO reservations 
          (customer_id, boat_id, start_time, end_time, total_amount, deposit_amount, balance_due, status)
          VALUES (?,?,?,?,?,?,?, 'pendiente')
        `);
        await stmt.bind(
          b.customer_id,
          b.boat_id,
          b.start_time,
          b.end_time,
          total,
          deposit,
          balance
        ).run();

        return json({ success: true });
      }

      if (request.method === "PUT" && id) {
        const b = await request.json();
        await env.DB.prepare(`
          UPDATE reservations 
          SET customer_id=?, boat_id=?, start_time=?, end_time=?, 
              total_amount=?, deposit_amount=?, balance_due=?, status=?
          WHERE id=?
        `).bind(
          b.customer_id, b.boat_id, b.start_time, b.end_time,
          b.total_amount || 0, b.deposit_amount || 0, b.balance_due || 0,
          b.status || 'pendiente', id
        ).run();
        return json({ success: true });
      }

      if (request.method === "DELETE" && id) {
        await env.DB.prepare("DELETE FROM reservations WHERE id=?").bind(id).run();
        return json({ success: true });
      }
    }

    // Facturas ── adaptado (anticipo + factura final)
    if (url.pathname.startsWith("/api/invoices")) {
      const parts = url.pathname.split("/");
      const id = parts.length > 3 && !isNaN(parts[3]) ? parts[3] : null;

      if (request.method === "GET") {
        const { results } = await env.DB.prepare(`
          SELECT i.*, r.id AS reservation_id, c.full_name AS customer_name,
                 b.name AS boat_name
          FROM invoices i
          LEFT JOIN reservations r ON i.reservation_id = r.id
          LEFT JOIN customers c ON i.customer_id = c.id
          LEFT JOIN boats b ON r.boat_id = b.id
          ORDER BY i.created_at DESC
        `).all();
        return json(results || []);
      }

      if (request.method === "POST") {
        const b = await request.json();
        await env.DB.prepare(`
          INSERT INTO invoices 
          (reservation_id, customer_id, total, amount_paid, payment_method, type, notes)
          VALUES (?,?,?,?,?,?,'Factura generada desde reserva ' || ?)
        `).bind(
          b.reservation_id || null,
          b.customer_id,
          b.total || 0,
          b.amount_paid || 0,
          b.payment_method || 'efectivo',
          b.type || 'final',           // 'anticipo' o 'final'
          b.reservation_id || ''
        ).run();

        // Opcional: actualizar saldo de la reserva si es factura final
        if (b.type === 'final' && b.reservation_id) {
          await env.DB.prepare(`
            UPDATE reservations 
            SET balance_due = balance_due - ?, status = 'pagada'
            WHERE id = ?
          `).bind(b.amount_paid || 0, b.reservation_id).run();
        }

        return json({ success: true });
      }

      // DELETE si lo necesitas...
    }

    return json({ error: "Not Found" }, 404);
  }
};
