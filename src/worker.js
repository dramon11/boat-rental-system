export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });

    try {
      if (url.pathname === "/" && request.method === "GET") {
        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Boat Rental ERP</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * { box-sizing: border-box; margin:0; padding:0; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: #f8fafc;
      color: #1e293b;
    }
    .sidebar {
      width: 240px;
      height: 100vh;
      background: #0f172a;
      color: white;
      position: fixed;
      padding: 24px 20px;
    }
    .sidebar h2 {
      margin: 0 0 32px 0;
      font-weight: 700;
      font-size: 1.5rem;
    }
    .menu-item {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
    }
    .menu-item:hover { background: #1e293b; }
    .menu-item.active { background: #2563eb; }
    .header {
      margin-left: 240px;
      height: 64px;
      background: #1e40af;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      color: white;
      font-weight: 600;
    }
    .content {
      margin-left: 240px;
      padding: 32px;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
    }
    .card h4 {
      margin: 0 0 8px 0;
      color: #64748b;
      font-weight: 500;
      font-size: 0.875rem;
    }
    .card h2 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .data-table th, .data-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    .data-table th {
      background: #f1f5f9;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      font-size: 0.75rem;
    }
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    .btn-success { background: #16a34a; color: white; }
    .btn-success:hover { background: #15803d; }
    .btn-danger { background: #dc2626; color: white; }
    .btn-danger:hover { background: #b91c1c; }
    .input-search {
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      width: 240px;
    }
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-overlay.active { display: flex; }
    .modal {
      background: white;
      border-radius: 12px;
      padding: 24px;
      width: 100%;
      max-width: 520px;
      max-height: 92vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #334155;
      font-size: 0.95rem;
    }
    .form-group input,
    .form-group select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.95rem;
    }
    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
    }
    .price-summary {
      margin: 16px 0;
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .price-summary div {
      margin-bottom: 8px;
    }
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
      opacity: 0;
      transition: opacity 0.4s;
      z-index: 2000;
    }
    .toast.show { opacity: 1; }
    .toast.success { background: #16a34a; }
    .toast.error { background: #dc2626; }
  </style>
</head>
<body>

  <div class="sidebar">
    <h2>⚓ BoatERP</h2>
    <div class="menu-item active" onclick="showDashboard()"><span>📊</span> Dashboard</div>
    <div class="menu-item" onclick="loadCustomers()"><span>👥</span> Clientes</div>
    <div class="menu-item" onclick="loadBoats()"><span>⛵</span> Botes</div>
    <div class="menu-item" onclick="loadReservations()"><span>📅</span> Reservas</div>
    <div class="menu-item" onclick="loadInvoices()"><span>💳</span> Facturación</div>
  </div>

  <div class="header">
    <div>Panel Administrativo</div>
    <div>Administrador</div>
  </div>

  <div class="content" id="mainContent"></div>

  <!-- Modal Clientes -->
  <div id="customerModal" class="modal-overlay">
    <div class="modal">
      <h3 id="modalTitle">Nuevo Cliente</h3>
      <div class="form-group"><label>Nombre completo</label><input id="name" placeholder="Nombre y apellido"/></div>
      <div class="form-group"><label>Documento</label><input id="doc" placeholder="Cédula / Pasaporte"/></div>
      <div class="form-group"><label>Teléfono</label><input id="phone" placeholder="+1 829 123 4567"/></div>
      <div class="form-group"><label>Email</label><input id="email" type="email" placeholder="ejemplo@correo.com"/></div>
      <div style="text-align:right; margin-top:24px;">
        <button class="btn" onclick="closeCustomerModal()">Cancelar</button>
        <button class="btn-success" onclick="saveCustomer()">Guardar</button>
      </div>
    </div>
  </div>

  <!-- Modal Botes -->
  <div id="boatModal" class="modal-overlay">
    <div class="modal">
      <h3 id="boatModalTitle">Nuevo Bote</h3>
      <div class="form-group"><label>Nombre del bote</label><input id="boatName" placeholder="Ej: Caribe Queen"/></div>
      <div class="form-group"><label>Tipo</label><input id="boatType" placeholder="Lancha, Yate, Velero..."/></div>
      <div class="form-group"><label>Capacidad (personas)</label><input id="boatCapacity" type="number" min="1"/></div>
      <div class="form-group"><label>Estado</label>
        <select id="boatStatus">
          <option value="available">Disponible</option>
          <option value="rented">Alquilado</option>
          <option value="maintenance">En mantenimiento</option>
        </select>
      </div>

      <div style="margin:24px 0; display:grid; grid-template-columns: repeat(auto-fit, minmax(140px,1fr)); gap:16px;">
        <div class="form-group"><label>Precio por hora</label><input id="priceHour" type="number" step="0.01" placeholder="0.00"/></div>
        <div class="form-group"><label>Precio por día</label><input id="priceDay" type="number" step="0.01" placeholder="0.00"/></div>
        <div class="form-group"><label>Precio por semana</label><input id="priceWeek" type="number" step="0.01" placeholder="0.00"/></div>
        <div class="form-group"><label>Precio por mes</label><input id="priceMonth" type="number" step="0.01" placeholder="0.00"/></div>
        <div class="form-group"><label>Precio por año</label><input id="priceYear" type="number" step="0.01" placeholder="0.00"/></div>
      </div>

      <div style="text-align:right;">
        <button class="btn" onclick="closeBoatModal()">Cancelar</button>
        <button class="btn-success" onclick="saveBoat()">Guardar</button>
      </div>
    </div>
  </div>

  <!-- Modal Reservas (versión profesional) -->
  <div id="reservationModal" class="modal-overlay">
    <div class="modal">
      <h3 id="reservationModalTitle">Nueva Reserva</h3>

      <div class="form-group">
        <label for="customerId">Cliente</label>
        <select id="customerId">
          <option value="">Seleccione un cliente</option>
        </select>
      </div>

      <div class="form-group">
        <label for="boatId">Bote</label>
        <select id="boatId" onchange="updatePriceEstimate()">
          <option value="">Seleccione un bote</option>
        </select>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
        <div class="form-group">
          <label for="startTime">Inicio</label>
          <input id="startTime" type="datetime-local" onchange="updatePriceEstimate()">
        </div>
        <div class="form-group">
          <label for="endTime">Fin</label>
          <input id="endTime" type="datetime-local" onchange="updatePriceEstimate()">
        </div>
      </div>

      <div class="form-group">
        <label for="durationHours">Duración estimada (horas)</label>
        <input id="durationHours" type="number" min="0.5" step="0.5" value="2" onchange="updatePriceEstimate()">
      </div>

      <div class="price-summary" id="priceSummary" style="display:none;">
        <div>Precio por hora: <strong id="boatHourPrice">—</strong></div>
        <div>Duración: <strong id="estDuration">—</strong> horas</div>
        <div style="margin-top:12px; font-size:1.15rem; color:#1e40af;">
          Total estimado: <strong id="totalEstimate">RD$ 0.00</strong>
        </div>
      </div>

      <div style="text-align:right; margin-top:28px;">
        <button class="btn" onclick="closeReservationModal()">Cancelar</button>
        <button class="btn-success" onclick="saveReservation()">Crear Reserva</button>
      </div>
    </div>
  </div>

  <!-- Modal Facturas -->
  <div id="invoiceModal" class="modal-overlay">
    <div class="modal">
      <h3 id="invoiceModalTitle">Nueva Factura</h3>
      <div class="form-group">
        <label>Reserva (opcional)</label>
        <select id="reservationId">
          <option value="">Sin reserva asociada</option>
        </select>
      </div>
      <div class="form-group"><label>Subtotal</label><input id="subtotal" type="number" step="0.01"/></div>
      <div class="form-group"><label>ITBIS (18%)</label><input id="itbis" type="number" step="0.01"/></div>
      <div class="form-group"><label>Total</label><input id="total" type="number" step="0.01"/></div>
      <div class="form-group">
        <label>Método de pago</label>
        <select id="paymentMethod">
          <option value="cash">Efectivo</option>
          <option value="card">Tarjeta</option>
          <option value="transfer">Transferencia</option>
        </select>
      </div>
      <div style="text-align:right; margin-top:24px;">
        <button class="btn" onclick="closeInvoiceModal()">Cancelar</button>
        <button class="btn-success" onclick="saveInvoice()">Guardar</button>
      </div>
    </div>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    let editingCustomerId = null;
    let editingBoatId = null;
    let editingReservationId = null;
    let editingInvoiceId = null;
    let charts = {};
    let boatsData = [];

    const dashboardHTML = \`
      <div>
        <div class="cards">
          <div class="card"><h4>Ingresos Hoy</h4><h2 id="income">$0</h2></div>
          <div class="card"><h4>Alquileres Activos</h4><h2 id="active">0</h2></div>
          <div class="card"><h4>Botes Disponibles</h4><h2 id="boats">0</h2></div>
          <div class="card"><h4>Total Clientes</h4><h2 id="customers">0</h2></div>
        </div>
        <!-- Charts aquí si los quieres mantener -->
      </div>
    \`;

    async function loadDashboard() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="showDashboard()"]').classList.add('active');
      document.getElementById("mainContent").innerHTML = dashboardHTML;
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        document.getElementById("income").innerText = "$" + (data.income_today ?? 0).toLocaleString();
        document.getElementById("active").innerText = data.active_rentals ?? 0;
        document.getElementById("boats").innerText = data.available_boats ?? 0;
        document.getElementById("customers").innerText = data.total_customers ?? 0;
      } catch (e) {
        showToast("Error cargando dashboard", "error");
      }
    }

    function showDashboard() { loadDashboard(); }

    // ──────────────────────────────── Clientes ────────────────────────────────
    async function loadCustomers() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadCustomers()"]').classList.add('active');
      document.getElementById('mainContent').innerHTML = \`
        <h1 style="margin-bottom:24px;">Clientes</h1>
        <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
          <input id="searchInput" class="input-search" placeholder="Buscar cliente..."/>
          <button class="btn-success" onclick="openCustomerModal()">+ Nuevo Cliente</button>
        </div>
        <table class="data-table" id="customerTable"><tbody><tr><td>Cargando...</td></tr></tbody></table>
      \`;
      await fetchCustomers();
    }

    // ... (fetchCustomers, renderCustomerTable, openCustomerModal, editCustomer, saveCustomer, deleteCustomer iguales al código anterior) ...

    // ──────────────────────────────── Botes ────────────────────────────────
    // ... (loadBoats, fetchBoats, renderBoatTable, openBoatModal, editBoat, saveBoat, deleteBoat iguales al código anterior) ...

    // ──────────────────────────────── Reservas ────────────────────────────────
    async function loadReservations() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadReservations()"]').classList.add('active');
      document.getElementById('mainContent').innerHTML = \`
        <h1 style="margin-bottom:24px;">Reservas</h1>
        <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
          <input id="reservationSearchInput" class="input-search" placeholder="Buscar reserva..."/>
          <button class="btn-success" onclick="openReservationModal()">+ Nueva Reserva</button>
        </div>
        <table class="data-table" id="reservationTable"><tbody><tr><td>Cargando...</td></tr></tbody></table>
      \`;
      await fetchReservations();
    }

    async function fetchReservations() {
      try {
        const res = await fetch('/api/reservations');
        if (!res.ok) throw new Error();
        const data = await res.json();
        renderReservationsTable(data);
      } catch {
        document.getElementById("reservationTable").innerHTML = "<tr><td colspan='6'>Error al cargar reservas</td></tr>";
      }
    }

    function renderReservationsTable(data) {
      const tbody = document.getElementById("reservationTable");
      if (!data?.length) {
        tbody.innerHTML = "<tr><td colspan='6'>No hay reservas registradas</td></tr>";
        return;
      }
      let html = '';
      data.forEach(r => {
        html += \`
          <tr>
            <td>\${r.customer_name || '—'}</td>
            <td>\${r.boat_name || '—'}</td>
            <td>\${r.start_time ? new Date(r.start_time).toLocaleString('es-DO') : '—'}</td>
            <td>\${r.end_time ? new Date(r.end_time).toLocaleString('es-DO') : '—'}</td>
            <td><span style="color:\${r.status==='pendiente'?'#d97706':r.status==='confirmed'?'#15803d':'#dc2626'};">\${r.status}</span></td>
            <td>
              <button class="btn" style="margin-right:8px;" onclick="editReservation(\${r.id})">Editar</button>
              <button class="btn-danger" onclick="deleteReservation(\${r.id})">Eliminar</button>
            </td>
          </tr>\`;
      });
      tbody.innerHTML = \`<thead><tr><th>Cliente</th><th>Bote</th><th>Inicio</th><th>Fin</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>\${html}</tbody>\`;
    }

    async function openReservationModal() {
      editingReservationId = null;
      document.getElementById("reservationModalTitle").textContent = editingReservationId ? "Editar Reserva" : "Nueva Reserva";

      const customerSelect = document.getElementById("customerId");
      customerSelect.innerHTML = '<option value="">Cargando...</option>';

      try {
        const res = await fetch('/api/customers');
        const customers = await res.json();
        customerSelect.innerHTML = '<option value="">Seleccione cliente</option>';
        customers.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.id;
          opt.textContent = \`\${c.full_name} — \${c.document_id || 'sin doc'}\`;
          customerSelect.appendChild(opt);
        });
      } catch {
        customerSelect.innerHTML = '<option>Error al cargar clientes</option>';
      }

      const boatSelect = document.getElementById("boatId");
      boatSelect.innerHTML = '<option value="">Cargando...</option>';

      try {
        const res = await fetch('/api/boats');
        boatsData = await res.json();
        boatSelect.innerHTML = '<option value="">Seleccione bote</option>';
        boatsData.forEach(b => {
          if (b.status !== 'available') return;
          const opt = document.createElement('option');
          opt.value = b.id;
          opt.dataset.price = b.price_per_hour || 0;
          opt.textContent = \`\${b.name} — \${b.type || '?'}  (RD$\${Number(b.price_per_hour||0).toFixed(0)}/h)\`;
          boatSelect.appendChild(opt);
        });
      } catch {
        boatSelect.innerHTML = '<option>Error al cargar botes</option>';
      }

      document.getElementById("startTime").value = "";
      document.getElementById("endTime").value = "";
      document.getElementById("durationHours").value = "2";
      document.getElementById("priceSummary").style.display = "none";

      document.getElementById("reservationModal").classList.add("active");
    }

    function updatePriceEstimate() {
      const boatSelect = document.getElementById("boatId");
      const hoursInput = document.getElementById("durationHours");
      const summary = document.getElementById("priceSummary");

      const option = boatSelect.options[boatSelect.selectedIndex];
      const priceHour = parseFloat(option?.dataset?.price || 0);
      const hours = parseFloat(hoursInput.value) || 0;

      if (priceHour > 0 && hours > 0) {
        const total = priceHour * hours;
        document.getElementById("boatHourPrice").textContent = "RD$ " + priceHour.toLocaleString('es-DO', {minimumFractionDigits:2});
        document.getElementById("estDuration").textContent = hours.toLocaleString('es-DO', {minimumFractionDigits:1, maximumFractionDigits:1});
        document.getElementById("totalEstimate").textContent = "RD$ " + total.toLocaleString('es-DO', {minimumFractionDigits:2});
        summary.style.display = "block";
      } else {
        summary.style.display = "none";
      }
    }

    function closeReservationModal() {
      document.getElementById("reservationModal").classList.remove("active");
    }

    async function saveReservation() {
      const customer = document.getElementById("customerId").value;
      const boat = document.getElementById("boatId").value;
      const start = document.getElementById("startTime").value;
      const end = document.getElementById("endTime").value;
      const hours = parseFloat(document.getElementById("durationHours").value) || 1;

      if (!customer || !boat || !start || !end) {
        showToast("Faltan campos obligatorios", "error");
        return;
      }

      const body = {
        customer_id: customer,
        boat_id: boat,
        start_time: start,
        end_time: end,
        duration_hours: hours,
        status: "pendiente"
      };

      try {
        const method = editingReservationId ? 'PUT' : 'POST';
        const url = editingReservationId ? '/api/reservations/' + editingReservationId : '/api/reservations';

        const res = await fetch(url, {
          method,
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error(await res.text());

        showToast(editingReservationId ? "Reserva actualizada" : "Reserva creada", "success");
        closeReservationModal();
        await loadReservations();
      } catch (err) {
        showToast("Error al guardar: " + err.message, "error");
      }
    }

    // ... (resto de funciones: loadInvoices, saveInvoice, deleteInvoice, showToast, etc. sin cambios) ...

    // Inicio
    loadDashboard();
  </script>
</body>
</html>
        `;
        return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
      }

      // ─── API Endpoints ───────────────────────────────────────────────────────

      if (url.pathname === "/api/dashboard") {
        // ... (mismo código de dashboard que tenías antes)
      }

      if (url.pathname.startsWith("/api/customers")) {
        // ... (mismo código de customers)
      }

      if (url.pathname.startsWith("/api/boats")) {
        // ... (mismo código de boats con todos los precios)
      }

      if (url.pathname.startsWith("/api/reservations")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare(`
            SELECT 
              r.id,
              r.customer_id,
              r.boat_id,
              r.start_time,
              r.end_time,
              r.duration_hours,
              r.status,
              c.full_name AS customer_name,
              b.name AS boat_name
            FROM reservations r
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN boats b ON r.boat_id = b.id
            ORDER BY r.start_time DESC
          `).all();
          return json(rows.results || []);
        }

        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(`
            INSERT INTO reservations (
              customer_id, boat_id, start_time, end_time, duration_hours, status
            ) VALUES (?,?,?,?,?,?)
          `).bind(
            body.customer_id,
            body.boat_id,
            body.start_time,
            body.end_time,
            body.duration_hours,
            body.status || 'pendiente'
          ).run();
          return json({ success: true });
        }

        // PUT y DELETE según necesites implementarlos
        // ...
      }

      if (url.pathname.startsWith("/api/invoices")) {
        // ... (mismo código de invoices)
      }

      return json({ error: "Not found" }, 404);
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  }
};
