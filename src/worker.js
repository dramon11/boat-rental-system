export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    });

    try {
      // =============================================
      //                PÁGINA PRINCIPAL
      // =============================================
      if (url.pathname === "/" && request.method === "GET") {
        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Boat Rental ERP</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * { box-sizing: border-box; margin:0; padding:0; }
    body { font-family: 'Inter', sans-serif; background: #f1f5f9; color: #1e293b; }
    .sidebar { width: 240px; height: 100vh; background: #0f172a; color: white; position: fixed; padding: 24px 16px; }
    .sidebar h2 { margin-bottom: 36px; font-size: 1.5rem; }
    .menu-item { padding: 12px 16px; border-radius: 8px; margin-bottom: 6px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 12px; }
    .menu-item:hover { background: #1e293b; }
    .menu-item.active { background: #2563eb; }
    .header { margin-left: 240px; height: 68px; background: #1e40af; color: white; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; font-weight: 600; }
    .content { margin-left: 240px; padding: 32px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .card h4 { margin-bottom: 12px; color: #64748b; font-weight: 500; }
    .card h2 { font-size: 1.8rem; font-weight: 700; }
    .table-container { background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 600; color: #475569; }
    .btn { padding: 8px 14px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }
    .btn-success { background: #16a34a; color: white; }
    .btn-danger { background: #dc2626; color: white; }
    .btn-primary { background: #2563eb; color: white; }
    .input-search { padding: 8px 14px; border: 1px solid #d1d5db; border-radius: 6px; width: 240px; }
    .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); justify-content: center; align-items: center; z-index: 1000; }
    .modal-overlay.active { display: flex; }
    .modal { background: white; border-radius: 12px; width: 560px; max-width: 94vw; max-height: 92vh; overflow-y: auto; padding: 24px; }
    input, select { width: 100%; padding: 10px 12px; margin-bottom: 12px; border: 1px solid #d1d5db; border-radius: 6px; }
    .toast { position: fixed; bottom: 24px; right: 24px; padding: 14px 24px; border-radius: 8px; color: white; opacity: 0; transition: all 0.4s; z-index: 2000; }
    .toast.show { opacity: 1; }
    .toast.success { background: #16a34a; }
    .toast.error { background: #dc2626; }
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
    <div>Panel de Alquiler de Embarcaciones</div>
    <div>Admin</div>
  </div>

  <div class="content" id="mainContent"></div>

  <!-- Modal Cliente -->
  <div id="modalCustomer" class="modal-overlay">
    <div class="modal">
      <h3 id="modalCustomerTitle">Nuevo Cliente</h3>
      <input id="customerName" placeholder="Nombre completo" required>
      <input id="customerDoc" placeholder="Cédula / Pasaporte">
      <input id="customerPhone" placeholder="Teléfono">
      <input id="customerEmail" placeholder="Email" type="email">
      <div style="text-align:right; margin-top:20px;">
        <button class="btn" onclick="closeModal('modalCustomer')">Cancelar</button>
        <button class="btn-success" onclick="saveCustomer()">Guardar</button>
      </div>
    </div>
  </div>

  <!-- Modal Bote -->
  <div id="modalBoat" class="modal-overlay">
    <div class="modal">
      <h3 id="modalBoatTitle">Nuevo Bote</h3>
      <input id="boatName" placeholder="Nombre / Matrícula" required>
      <input id="boatType" placeholder="Tipo (lancha, yate, etc)">
      <input id="boatCapacity" type="number" placeholder="Capacidad (personas)">
      <select id="boatStatus">
        <option value="available">Disponible</option>
        <option value="maintenance">Mantenimiento</option>
        <option value="rented">Alquilado</option>
      </select>
      <input id="priceHour" type="number" step="0.01" placeholder="Precio por hora">
      <div style="text-align:right; margin-top:20px;">
        <button class="btn" onclick="closeModal('modalBoat')">Cancelar</button>
        <button class="btn-success" onclick="saveBoat()">Guardar</button>
      </div>
    </div>
  </div>

  <!-- Modal Reserva (simplificado para depuración) -->
  <div id="modalReservation" class="modal-overlay">
    <div class="modal">
      <h3>Nueva Reserva</h3>
      <select id="resCustomer"></select>
      <select id="resBoat"></select>
      <input id="resStart" type="datetime-local">
      <input id="resEnd" type="datetime-local">
      <div style="text-align:right; margin-top:20px;">
        <button class="btn" onclick="closeModal('modalReservation')">Cancelar</button>
        <button class="btn-success" onclick="saveReservation()">Guardar</button>
      </div>
    </div>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    let currentView = 'dashboard';
    let editingId = null;

    function showToast(msg, type = 'success') {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.className = \`toast \${type} show\`;
      setTimeout(() => t.className = 'toast', 3000);
    }

    function closeModal(id) {
      document.getElementById(id).classList.remove('active');
    }

    async function loadView(view) {
      currentView = view;
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector(\`.menu-item[onclick="loadView('${view}')"]\`).classList.add('active');

      const content = document.getElementById('mainContent');

      if (view === 'dashboard') {
        content.innerHTML = \`
          <h2>Dashboard</h2>
          <div class="cards">
            <div class="card"><h4>Ingresos hoy</h4><h2 id="dashIncome">0</h2></div>
            <div class="card"><h4>Reservas activas</h4><h2 id="dashActive">0</h2></div>
            <div class="card"><h4>Botes disponibles</h4><h2 id="dashBoats">0</h2></div>
          </div>
          <button onclick="loadView('reservations')">Ir a Reservas</button>
        \`;
        loadDashboardData();
      }
      else if (view === 'customers') {
        content.innerHTML = \`
          <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
            <h2>Clientes</h2>
            <button class="btn-success" onclick="openCustomerModal()">+ Nuevo</button>
          </div>
          <div class="table-container" id="customersTable">Cargando...</div>
        \`;
        loadCustomers();
      }
      else if (view === 'boats') {
        content.innerHTML = \`
          <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
            <h2>Botes</h2>
            <button class="btn-success" onclick="openBoatModal()">+ Nuevo</button>
          </div>
          <div class="table-container" id="boatsTable">Cargando...</div>
        \`;
        loadBoats();
      }
      else if (view === 'reservations') {
        content.innerHTML = \`
          <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
            <h2>Reservas</h2>
            <button class="btn-success" onclick="openReservationModal()">+ Nueva</button>
          </div>
          <div class="table-container" id="reservationsTable">Cargando...</div>
        \`;
        loadReservations();
      }
    }

    // =============================================
    //             FUNCIONES BÁSICAS
    // =============================================

    async function loadDashboardData() {
      try {
        const r = await fetch('/api/dashboard');
        const d = await r.json();
        document.getElementById('dashIncome').textContent = '$' + d.income_today.toFixed(2);
        document.getElementById('dashActive').textContent = d.active_reservations;
        document.getElementById('dashBoats').textContent = d.available_boats;
      } catch(e) {
        showToast('Error cargando dashboard', 'error');
      }
    }

    async function loadCustomers() {
      try {
        const r = await fetch('/api/customers');
        const customers = await r.json();
        let html = '<table><thead><tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Email</th><th></th></tr></thead><tbody>';
        customers.forEach(c => {
          html += \`<tr>
            <td>\${c.full_name}</td>
            <td>\${c.document_id || '-'}</td>
            <td>\${c.phone || '-'}</td>
            <td>\${c.email || '-'}</td>
            <td><button class="btn-danger" onclick="deleteCustomer(\${c.id})">Eliminar</button></td>
          </tr>\`;
        });
        html += '</tbody></table>';
        document.getElementById('customersTable').innerHTML = html || '<p>No hay clientes</p>';
      } catch(e) {
        document.getElementById('customersTable').innerHTML = '<p style="color:red">Error al cargar clientes</p>';
      }
    }

    function openCustomerModal() {
      editingId = null;
      document.getElementById('modalCustomerTitle').textContent = 'Nuevo Cliente';
      document.getElementById('customerName').value = '';
      document.getElementById('customerDoc').value = '';
      document.getElementById('customerPhone').value = '';
      document.getElementById('customerEmail').value = '';
      document.getElementById('modalCustomer').classList.add('active');
    }

    async function saveCustomer() {
      const data = {
        full_name: document.getElementById('customerName').value.trim(),
        document_id: document.getElementById('customerDoc').value.trim(),
        phone: document.getElementById('customerPhone').value.trim(),
        email: document.getElementById('customerEmail').value.trim()
      };

      if (!data.full_name) return showToast('Nombre es obligatorio', 'error');

      try {
        await fetch('/api/customers', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(data)
        });
        showToast('Cliente guardado');
        closeModal('modalCustomer');
        loadCustomers();
      } catch(e) {
        showToast('Error al guardar cliente', 'error');
      }
    }

    async function deleteCustomer(id) {
      if (!confirm('¿Eliminar cliente?')) return;
      try {
        await fetch('/api/customers/' + id, { method: 'DELETE' });
        showToast('Cliente eliminado');
        loadCustomers();
      } catch(e) {
        showToast('Error al eliminar', 'error');
      }
    }

    // =============================================
    //                   INICIO
    // =============================================
    loadView('dashboard');
  </script>
</body>
</html>
        `;

        return new Response(html, {
          headers: { "Content-Type": "text/html;charset=UTF-8" }
        });
      }

      // =============================================
      //                  API ENDPOINTS
      // =============================================

      if (url.pathname === "/api/dashboard") {
        let income_today = 0;
        let active_reservations = 0;
        let available_boats = 0;

        try {
          const row = await env.DB.prepare("SELECT COALESCE(SUM(total), 0) as sum FROM invoices WHERE payment_status = 'paid' AND date(created_at) = date('now')").first();
          income_today = row?.sum || 0;
        } catch {}

        try {
          const row = await env.DB.prepare("SELECT COUNT(*) as cnt FROM reservations WHERE status IN ('pendiente','confirmada')").first();
          active_reservations = row?.cnt || 0;
        } catch {}

        try {
          const row = await env.DB.prepare("SELECT COUNT(*) as cnt FROM boats WHERE status = 'available'").first();
          available_boats = row?.cnt || 0;
        } catch {}

        return jsonResponse({ income_today, active_reservations, available_boats });
      }

      // Clientes
      if (url.pathname.startsWith("/api/customers")) {
        if (request.method === "GET") {
          const { results } = await env.DB.prepare("SELECT * FROM customers ORDER BY full_name").all();
          return jsonResponse(results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare("INSERT INTO customers (full_name, document_id, phone, email) VALUES (?,?,?,?)")
            .bind(body.full_name, body.document_id || null, body.phone || null, body.email || null)
            .run();
          return jsonResponse({ ok: true });
        }
        if (request.method === "DELETE") {
          const id = url.pathname.split("/").pop();
          await env.DB.prepare("DELETE FROM customers WHERE id = ?").bind(id).run();
          return jsonResponse({ ok: true });
        }
      }

      // Botes (GET básico por ahora)
      if (url.pathname === "/api/boats" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM boats").all();
        return jsonResponse(results || []);
      }

      // Si nada coincide
      return jsonResponse({ error: "Not found" }, 404);

    } catch (err) {
      console.error(err);
      return jsonResponse({ error: "Server error: " + err.message }, 500);
    }
  }
};
