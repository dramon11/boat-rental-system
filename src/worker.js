
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
  <title>Boat Rental ERP</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    *{box-sizing:border-box}
    body{margin:0;font-family:'Inter',sans-serif;background:#f1f5f9;}
    .sidebar{width:240px;height:100vh;background:#0f172a;color:#fff;position:fixed;padding:25px 20px;}
    .sidebar h2{margin:0 0 40px 0;font-weight:700;}
    .menu-item{padding:12px 14px;border-radius:8px;margin-bottom:10px;cursor:pointer;transition:.2s;display:flex;align-items:center;gap:12px;}
    .menu-item:hover{background:#1e293b;}
    .menu-item.active{background:#2563eb;}
    .header{margin-left:240px;height:65px;background:#1e3a8a;display:flex;align-items:center;justify-content:space-between;padding:0 30px;color:white;font-weight:600;}
    .content{margin-left:240px;padding:30px;}
    .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
    .card{background:white;padding:20px;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,0.05);}
    .card h4{margin:0;font-weight:600;color:#64748b;}
    .card h2{margin:10px 0 0 0;}
    .charts{margin-top:40px;display:grid;grid-template-columns:repeat(2,1fr);gap:30px;}
    .chart-box{background:white;padding:25px;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,0.05);height:340px;}
    .full-width{grid-column:span 2;}
    .chart-container{height:280px;position:relative;}
    .data-table{width:100%;border-collapse:collapse;}
    .data-table th, .data-table td{padding:10px;border-bottom:1px solid #ccc;text-align:left;}
    .btn{padding:6px 12px;border:none;border-radius:4px;cursor:pointer;}
    .btn-danger{background:#ef4444;color:white;}
    .btn-success{background:#22c55e;color:white;}
    .input-search{padding:6px 12px;border:1px solid #ccc;border-radius:4px;}
    .modal-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);justify-content:center;align-items:center;}
    .modal-overlay.active{display:flex;}
    .modal{background:white;padding:20px;border-radius:10px;width:520px;max-width:92vw;}
    .toast{position:fixed;bottom:20px;right:20px;color:white;padding:12px 18px;border-radius:6px;opacity:0;transition:opacity .4s;z-index:1000;}
    .toast.show{opacity:1;}
    .toast.error{background:#ef4444;}
    .toast.success{background:#22c55e;}
    .price-group{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:16px 0;}
    .price-group label{font-size:0.9em;color:#64748b;display:block;margin-bottom:4px;}
  </style>
</head>
<body>
  <div class="sidebar">
    <h2>⚓ BoatERP</h2>
    <div class="menu-item active" onclick="loadDashboard()"><span>📊</span> Dashboard</div>
    <div class="menu-item" onclick="loadCustomers()"><span>👥</span> Clientes</div>
    <div class="menu-item" onclick="loadBoats()"><span>⛵</span> Botes</div>
    <div class="menu-item" onclick="loadReservations()"><span>📅</span> Reservas</div>
    <div class="menu-item" onclick="loadInvoices()"><span>💳</span> Facturación</div>
  </div>
  <div class="header">
    <div>Panel Administrativo</div>
    <div>Admin</div>
  </div>
  <div class="content" id="mainContent"></div>

  <!-- MODAL CLIENTES -->
  <div id="customerModal" class="modal-overlay">
    <div class="modal">
      <h3 id="modalTitle">Nuevo Cliente</h3>
      <input id="name" placeholder="Nombre completo" style="width:100%;margin-bottom:8px"/>
      <input id="doc" placeholder="Documento" style="width:100%;margin-bottom:8px"/>
      <input id="phone" placeholder="Teléfono" style="width:100%;margin-bottom:8px"/>
      <input id="email" placeholder="Email" style="width:100%;margin-bottom:8px"/>
      <div style="text-align:right;margin-top:10px;">
        <button class="btn-success" onclick="saveCustomer()">Guardar</button>
        <button class="btn" onclick="closeCustomerModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <!-- MODAL BOTES -->
  <div id="boatModal" class="modal-overlay">
    <div class="modal">
      <h3 id="boatModalTitle">Nuevo Bote</h3>
      <input id="boatName" placeholder="Nombre del bote" style="width:100%;margin-bottom:8px"/>
      <input id="boatType" placeholder="Tipo (Lancha, Yate, Velero...)" style="width:100%;margin-bottom:8px"/>
      <input id="boatCapacity" placeholder="Capacidad (personas)" type="number" style="width:100%;margin-bottom:8px"/>
      <input id="boatStatus" placeholder="Estado (available/rented/maintenance)" style="width:100%;margin-bottom:12px"/>
      <div class="price-group">
        <div><label>Precio por hora</label><input id="priceHour" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
        <div><label>Precio por día</label><input id="priceDay" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
        <div><label>Precio por semana</label><input id="priceWeek" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
        <div><label>Precio por mes</label><input id="priceMonth" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
        <div><label>Precio por año</label><input id="priceYear" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
      </div>
      <div style="text-align:right;margin-top:16px;">
        <button class="btn-success" onclick="saveBoat()">Guardar</button>
        <button class="btn" onclick="closeBoatModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <!-- MODAL RESERVAS -->
  <div id="reservationModal" class="modal-overlay">
    <div class="modal" style="width:520px">
      <h3 id="reservationModalTitle">Nueva Reserva</h3>
      <select id="customerId" style="width:100%;margin-bottom:12px">
        <option value="">Seleccionar Cliente</option>
      </select>
      <select id="inventoryId" style="width:100%;margin-bottom:12px">
        <option value="">Seleccionar Bote</option>
      </select>
      <input id="startTime" type="datetime-local" placeholder="Inicio" style="width:100%;margin-bottom:8px"/>
      <input id="endTime" type="datetime-local" placeholder="Fin" style="width:100%;margin-bottom:8px"/>
      <input id="duration" placeholder="Duración (horas)" type="number" step="0.5" style="width:100%;margin-bottom:12px"/>
      <div style="text-align:right;margin-top:10px;">
        <button class="btn-success" onclick="saveReservation()">Guardar</button>
        <button class="btn" onclick="closeReservationModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <!-- MODAL FACTURAS -->
  <div id="invoiceModal" class="modal-overlay">
    <div class="modal" style="width:520px">
      <h3 id="invoiceModalTitle">Nueva Factura</h3>
      <select id="reservationId" style="width:100%;margin-bottom:12px">
        <option value="">Seleccionar Reserva (opcional)</option>
      </select>
      <input id="subtotal" type="number" step="0.01" placeholder="Subtotal" style="width:100%;margin-bottom:8px"/>
      <input id="itbis" type="number" step="0.01" placeholder="ITBIS 18%" style="width:100%;margin-bottom:8px"/>
      <input id="total" type="number" step="0.01" placeholder="Total" style="width:100%;margin-bottom:8px"/>
      <select id="paymentMethod" style="width:100%;margin-bottom:12px">
        <option value="cash">Efectivo</option>
        <option value="card">Tarjeta</option>
        <option value="transfer">Transferencia</option>
      </select>
      <div style="text-align:right;margin-top:10px;">
        <button class="btn-success" onclick="saveInvoice()">Guardar</button>
        <button class="btn" onclick="closeInvoiceModal()">Cancelar</button>
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

    // ── Dashboard ────────────────────────────────────────────────────────────
    const dashboardHTML = \`
      <div id="dashboard">
        <div class="cards">
          <div class="card"><h4>Ingresos Hoy</h4><h2 id="income">$0</h2></div>
          <div class="card"><h4>Reservas Activas</h4><h2 id="active">0</h2></div>
          <div class="card"><h4>Botes Disponibles</h4><h2 id="boats">0</h2></div>
          <div class="card"><h4>Total Clientes</h4><h2 id="customers">0</h2></div>
        </div>
        <div class="charts">
          <div class="chart-box"><h4>Resumen General (Barras)</h4><div class="chart-container"><canvas id="barChart"></canvas></div></div>
          <div class="chart-box"><h4>Tendencia (Línea)</h4><div class="chart-container"><canvas id="lineChart"></canvas></div></div>
          <div class="chart-box full-width"><h4>Distribución (Pie)</h4><div class="chart-container"><canvas id="pieChart"></canvas></div></div>
        </div>
      </div>
    \`;

    async function loadDashboard() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadDashboard()"]').classList.add('active');
      document.getElementById("mainContent").innerHTML = dashboardHTML;
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error(\`Status \${res.status}\`);
        const data = await res.json();
        document.getElementById("income").innerText = "$" + (data.income_today ?? 0).toFixed(2);
        document.getElementById("active").innerText = data.active_reservations ?? 0;
        document.getElementById("boats").innerText = data.available_boats ?? 0;
        document.getElementById("customers").innerText = data.total_customers ?? 0;

        const values = [data.income_today ?? 0, data.active_reservations ?? 0, data.available_boats ?? 0, data.total_customers ?? 0];
        const labels = ["Ingresos Hoy", "Reservas Activas", "Botes Disponibles", "Clientes"];
        const opts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

        charts.bar = new Chart(document.getElementById("barChart"), { type: 'bar', data: { labels, datasets: [{ data: values, backgroundColor: ['#3b82f6','#10b981','#f59e0b','#8b5cf6'] }] }, options: opts });
        charts.line = new Chart(document.getElementById("lineChart"), { type: 'line', data: { labels, datasets: [{ data: values, tension: 0.4, borderColor: '#3b82f6' }] }, options: opts });
        charts.pie = new Chart(document.getElementById("pieChart"), { type: 'pie', data: { labels, datasets: [{ data: values, backgroundColor: ['#3b82f6','#10b981','#f59e0b','#8b5cf6'] }] }, options: { ...opts, plugins: { legend: { position: 'right' } } } });
      } catch (err) {
        console.error("Dashboard error:", err);
        showToast("Error cargando dashboard", "error");
      }
    }

    // ── Toast ────────────────────────────────────────────────────────────────
    function showToast(msg, type = "success") {
      const toast = document.getElementById("toast");
      toast.textContent = msg;
      toast.className = \`toast \${type} show\`;
      setTimeout(() => toast.className = "toast", 3500);
    }

    // ── Clientes ─────────────────────────────────────────────────────────────
    async function loadCustomers() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadCustomers()"]').classList.add('active');
      document.getElementById('mainContent').innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h2>Clientes</h2>
          <div>
            <input id="searchInput" class="input-search" placeholder="Buscar por nombre o documento..." />
            <button class="btn-success" onclick="openCustomerModal()">+ Nuevo Cliente</button>
          </div>
        </div>
        <div class="card"><div id="customerTable">Cargando clientes...</div></div>
      \`;
      await fetchCustomers();
    }

    async function fetchCustomers() {
      try {
        const res = await fetch('/api/customers');
        if (!res.ok) throw new Error();
        const data = await res.json();
        renderCustomerTable(data);
        document.getElementById("searchInput").addEventListener("input", e => {
          const val = e.target.value.toLowerCase();
          renderCustomerTable(data.filter(c =>
            (c.full_name || '').toLowerCase().includes(val) ||
            (c.document_id || '').toLowerCase().includes(val)
          ));
        });
      } catch {
        document.getElementById("customerTable").innerHTML = "<p>Error cargando clientes.</p>";
      }
    }

    function renderCustomerTable(data) {
      const el = document.getElementById("customerTable");
      if (!data || data.length === 0) { el.innerHTML = "<p>No hay clientes.</p>"; return; }
      let html = '<table class="data-table"><thead><tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead><tbody>';
      data.forEach(c => {
        html += \`<tr data-id="\${c.id}">
          <td>\${c.full_name || ''}</td>
          <td>\${c.document_id || ''}</td>
          <td>\${c.phone || '-'}</td>
          <td>\${c.email || '-'}</td>
          <td>
            <button class="btn btn-success" onclick="editCustomer(this)">Editar</button>
            <button class="btn btn-danger" onclick="deleteCustomer(\${c.id})">Eliminar</button>
          </td>
        </tr>\`;
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    }

    function openCustomerModal() {
      editingCustomerId = null;
      document.getElementById("modalTitle").textContent = "Nuevo Cliente";
      document.getElementById("name").value = "";
      document.getElementById("doc").value = "";
      document.getElementById("phone").value = "";
      document.getElementById("email").value = "";
      document.getElementById("customerModal").classList.add("active");
    }

    function closeCustomerModal() {
      document.getElementById("customerModal").classList.remove("active");
    }

    async function saveCustomer() {
      const body = {
        full_name: document.getElementById("name").value.trim(),
        document_id: document.getElementById("doc").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim()
      };
      if (!body.full_name) return showToast("Nombre es obligatorio", "error");

      try {
        const res = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error();
        showToast("Cliente creado", "success");
        closeCustomerModal();
        loadCustomers();
      } catch {
        showToast("Error al guardar cliente", "error");
      }
    }

    function editCustomer(btn) {
      const row = btn.closest('tr');
      editingCustomerId = row.dataset.id;
      document.getElementById("modalTitle").textContent = "Editar Cliente";
      document.getElementById("name").value = row.cells[0].textContent.trim();
      document.getElementById("doc").value = row.cells[1].textContent.trim();
      document.getElementById("phone").value = row.cells[2].textContent.trim() === '-' ? '' : row.cells[2].textContent.trim();
      document.getElementById("email").value = row.cells[3].textContent.trim() === '-' ? '' : row.cells[3].textContent.trim();
      document.getElementById("customerModal").classList.add("active");
    }

    async function deleteCustomer(id) {
      if (!confirm("¿Eliminar cliente?")) return;
      try {
        const res = await fetch('/api/customers/' + id, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        showToast("Cliente eliminado", "success");
        loadCustomers();
      } catch {
        showToast("Error al eliminar cliente", "error");
      }
    }

    // ── Botes ────────────────────────────────────────────────────────────────
    async function loadBoats() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadBoats()"]').classList.add('active');
      document.getElementById('mainContent').innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h2>Botes</h2>
          <div>
            <input id="boatSearchInput" class="input-search" placeholder="Buscar por nombre o tipo..." />
            <button class="btn-success" onclick="openBoatModal()">+ Nuevo Bote</button>
          </div>
        </div>
        <div class="card"><div id="boatTable">Cargando botes...</div></div>
      \`;
      await fetchBoats();
    }

    async function fetchBoats() {
      try {
        const res = await fetch('/api/boats');
        if (!res.ok) throw new Error();
        const data = await res.json();
        renderBoatTable(data);
        document.getElementById("boatSearchInput").addEventListener("input", e => {
          const val = e.target.value.toLowerCase();
          renderBoatTable(data.filter(b =>
            (b.name || '').toLowerCase().includes(val) ||
            (b.type || '').toLowerCase().includes(val)
          ));
        });
      } catch {
        document.getElementById("boatTable").innerHTML = "<p>Error cargando botes.</p>";
      }
    }

    function renderBoatTable(data) {
      const el = document.getElementById("boatTable");
      if (!data || data.length === 0) { el.innerHTML = "<p>No hay botes.</p>"; return; }
      let html = '<table class="data-table"><thead><tr><th>Nombre</th><th>Tipo</th><th>Capacidad</th><th>Precio/h</th><th>Precio/día</th><th>Precio/sem</th><th>Precio/mes</th><th>Precio/año</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
      data.forEach(b => {
        html += \`<tr data-id="\${b.id}">
          <td>\${b.name || ''}</td>
          <td>\${b.type || ''}</td>
          <td>\${b.capacity || '-'}</td>
          <td>RD$ \${Number(b.price_per_hour || 0).toFixed(2)}</td>
          <td>RD$ \${Number(b.price_per_day || 0).toFixed(2)}</td>
          <td>RD$ \${Number(b.price_per_week || 0).toFixed(2)}</td>
          <td>RD$ \${Number(b.price_per_month || 0).toFixed(2)}</td>
          <td>RD$ \${Number(b.price_per_year || 0).toFixed(2)}</td>
          <td>\${b.status || '-'}</td>
          <td>
            <button class="btn btn-success" onclick="editBoat(this)">Editar</button>
            <button class="btn btn-danger" onclick="deleteBoat(\${b.id})">Eliminar</button>
          </td>
        </tr>\`;
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    }

    function openBoatModal() {
      editingBoatId = null;
      document.getElementById("boatModalTitle").textContent = "Nuevo Bote";
      document.getElementById("boatName").value = "";
      document.getElementById("boatType").value = "";
      document.getElementById("boatCapacity").value = "";
      document.getElementById("boatStatus").value = "available";
      document.getElementById("priceHour").value = "";
      document.getElementById("priceDay").value = "";
      document.getElementById("priceWeek").value = "";
      document.getElementById("priceMonth").value = "";
      document.getElementById("priceYear").value = "";
      document.getElementById("boatModal").classList.add("active");
    }

    function editBoat(btn) {
      const row = btn.closest('tr');
      editingBoatId = parseInt(row.dataset.id);
      document.getElementById("boatModalTitle").textContent = "Editar Bote";
      document.getElementById("boatName").value = row.cells[0].textContent.trim();
      document.getElementById("boatType").value = row.cells[1].textContent.trim();
      document.getElementById("boatCapacity").value = row.cells[2].textContent.trim() === '-' ? '' : row.cells[2].textContent.trim();
      document.getElementById("boatStatus").value = row.cells[8].textContent.trim();
      document.getElementById("priceHour").value = parseFloat(row.cells[3].textContent.replace(/[^0-9.]/g,'')) || '';
      document.getElementById("priceDay").value = parseFloat(row.cells[4].textContent.replace(/[^0-9.]/g,'')) || '';
      document.getElementById("priceWeek").value = parseFloat(row.cells[5].textContent.replace(/[^0-9.]/g,'')) || '';
      document.getElementById("priceMonth").value = parseFloat(row.cells[6].textContent.replace(/[^0-9.]/g,'')) || '';
      document.getElementById("priceYear").value = parseFloat(row.cells[7].textContent.replace(/[^0-9.]/g,'')) || '';
      document.getElementById("boatModal").classList.add("active");
    }

    function closeBoatModal() {
      document.getElementById("boatModal").classList.remove("active");
    }

    async function saveBoat() {
      const body = {
        name: document.getElementById("boatName").value.trim(),
        type: document.getElementById("boatType").value.trim(),
        capacity: parseInt(document.getElementById("boatCapacity").value) || 0,
        status: document.getElementById("boatStatus").value.trim() || "available",
        price_per_hour: parseFloat(document.getElementById("priceHour").value) || 0,
        price_per_day: parseFloat(document.getElementById("priceDay").value) || 0,
        price_per_week: parseFloat(document.getElementById("priceWeek").value) || 0,
        price_per_month: parseFloat(document.getElementById("priceMonth").value) || 0,
        price_per_year: parseFloat(document.getElementById("priceYear").value) || 0
      };
      const isEdit = editingBoatId !== null;
      try {
        const res = await fetch(isEdit ? '/api/boats/' + editingBoatId : '/api/boats', {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(await res.text());
        showToast(isEdit ? "Bote actualizado" : "Bote creado", "success");
        closeBoatModal();
        await fetchBoats();
        await loadDashboard();
      } catch (err) {
        console.error(err);
        showToast("Error al guardar bote", "error");
      }
    }

    async function deleteBoat(id) {
      if (!confirm("¿Seguro eliminar bote?")) return;
      try {
        const res = await fetch('/api/boats/' + id, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        showToast("Bote eliminado", "success");
        await fetchBoats();
        await loadDashboard();
      } catch {
        showToast("Error al eliminar bote", "error");
      }
    }

    // ── Reservas ─────────────────────────────────────────────────────────────
    async function loadReservations() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadReservations()"]').classList.add('active');
      document.getElementById('mainContent').innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h2>Reservas</h2>
          <button class="btn-success" onclick="openReservationModal()">+ Nueva Reserva</button>
        </div>
        <div class="card"><div id="reservationTable">Cargando reservas...</div></div>
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
        document.getElementById("reservationTable").innerHTML = "<p>Error cargando reservas.</p>";
      }
    }

    function renderReservationsTable(data) {
      const el = document.getElementById("reservationTable");
      if (!data || data.length === 0) { el.innerHTML = "<p>No hay reservas.</p>"; return; }
      let html = '<table class="data-table"><thead><tr><th>ID</th><th>Cliente</th><th>Bote</th><th>Inicio</th><th>Fin</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
      data.forEach(r => {
        html += \`<tr>
          <td>\${r.id}</td>
          <td>\${r.customer_name || '-'}</td>
          <td>\${r.boat_name || '-'}</td>
          <td>\${new Date(r.start_time).toLocaleString()}</td>
          <td>\${new Date(r.end_time).toLocaleString()}</td>
          <td>\${r.status}</td>
          <td><button class="btn btn-success" onclick="editReservation(\${r.id})">Editar</button></td>
        </tr>\`;
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    }

    async function openReservationModal() {
      document.getElementById("reservationModalTitle").textContent = "Nueva Reserva";

      // Cargar clientes
      const cRes = await fetch('/api/customers');
      const customers = await cRes.json();
      let cOpts = '<option value="">Seleccionar Cliente</option>';
      customers.forEach(c => cOpts += \`<option value="\${c.id}">\${c.full_name}</option>\`);
      document.getElementById("customerId").innerHTML = cOpts;

      // Cargar botes
      const bRes = await fetch('/api/boats');
      const boats = await bRes.json();
      let bOpts = '<option value="">Seleccionar Bote</option>';
      boats.forEach(b => bOpts += \`<option value="\${b.id}">\${b.name} (RD$\${b.price_per_hour || 0}/h)</option>\`);
      document.getElementById("inventoryId").innerHTML = bOpts;

      document.getElementById("reservationModal").classList.add("active");
    }

    function closeReservationModal() {
      document.getElementById("reservationModal").classList.remove("active");
    }

    async function saveReservation() {
      const body = {
        customer_id: document.getElementById("customerId").value,
        inventory_id: document.getElementById("inventoryId").value,
        start_time: document.getElementById("startTime").value,
        end_time: document.getElementById("endTime").value,
        status: 'pendiente'
      };

      if (!body.customer_id || !body.inventory_id || !body.start_time || !body.end_time) {
        showToast("Complete todos los campos", "error");
        return;
      }

      try {
        const res = await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(await res.text());
        showToast("Reserva creada", "success");
        closeReservationModal();
        loadReservations();
      } catch (err) {
        showToast("Error al guardar reserva", "error");
      }
    }

    // ── Facturación ──────────────────────────────────────────────────────────
    async function loadInvoices() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadInvoices()"]').classList.add('active');
      document.getElementById('mainContent').innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h2>Facturación</h2>
          <button class="btn-success" onclick="openInvoiceModal()">+ Nueva Factura</button>
        </div>
        <div class="card"><div id="invoiceTable">Cargando facturas...</div></div>
      \`;
      await fetchInvoices();
    }

    async function fetchInvoices() {
      try {
        const res = await fetch('/api/invoices');
        if (!res.ok) throw new Error();
        const data = await res.json();
        renderInvoicesTable(data);
      } catch {
        document.getElementById("invoiceTable").innerHTML = "<p>Error cargando facturas.</p>";
      }
    }

    function renderInvoicesTable(data) {
      const el = document.getElementById("invoiceTable");
      if (!data || data.length === 0) { el.innerHTML = "<p>No hay facturas.</p>"; return; }
      let html = '<table class="data-table"><thead><tr><th>ID</th><th>Reserva</th><th>Subtotal</th><th>ITBIS</th><th>Total</th><th>Método</th><th>Acciones</th></tr></thead><tbody>';
      data.forEach(i => {
        html += \`<tr>
          <td>\${i.id}</td>
          <td>\${i.reservation_id || '-'}</td>
          <td>RD$ \${Number(i.subtotal || 0).toFixed(2)}</td>
          <td>RD$ \${Number(i.itbis || 0).toFixed(2)}</td>
          <td>RD$ \${Number(i.total || 0).toFixed(2)}</td>
          <td>\${i.payment_method || '-'}</td>
          <td><button class="btn btn-success">Editar</button></td>
        </tr>\`;
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    }

    function openInvoiceModal() {
      editingInvoiceId = null;
      document.getElementById("invoiceModalTitle").textContent = "Nueva Factura";
      document.getElementById("subtotal").value = "";
      document.getElementById("itbis").value = "";
      document.getElementById("total").value = "";
      document.getElementById("paymentMethod").value = "cash";
      document.getElementById("invoiceModal").classList.add("active");
    }

    function closeInvoiceModal() {
      document.getElementById("invoiceModal").classList.remove("active");
    }

    async function saveInvoice() {
      const body = {
        reservation_id: document.getElementById("reservationId").value || null,
        subtotal: parseFloat(document.getElementById("subtotal").value) || 0,
        itbis: parseFloat(document.getElementById("itbis").value) || 0,
        total: parseFloat(document.getElementById("total").value) || 0,
        payment_method: document.getElementById("paymentMethod").value
      };

      try {
        const res = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error();
        showToast("Factura creada", "success");
        closeInvoiceModal();
        loadInvoices();
      } catch {
        showToast("Error al guardar factura", "error");
      }
    }

    // Inicio
    loadDashboard();
  </script>
</body>
</html>
        `;
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      }

      // API DASHBOARD – ajustado para usar facturas
      if (url.pathname === "/api/dashboard") {
        let income_today = 0;
        let active_reservations = 0;
        let available_boats = 0;
        let total_customers = 0;
        try {
          const income = await env.DB.prepare("SELECT COALESCE(SUM(total),0) as total FROM invoices WHERE payment_status = 'paid' AND DATE(created_at) = DATE('now')").first();
          income_today = income?.total ?? 0;
        } catch {}
        try {
          const active = await env.DB.prepare("SELECT COUNT(*) as total FROM reservations WHERE status IN ('pendiente','confirmada')").first();
          active_reservations = active?.total ?? 0;
        } catch {}
        try {
          const boats = await env.DB.prepare("SELECT COUNT(*) as total FROM boats WHERE TRIM(LOWER(status)) = 'available'").first();
          available_boats = boats?.total ?? 0;
        } catch {}
        try {
          const customers = await env.DB.prepare("SELECT COUNT(*) as total FROM customers").first();
          total_customers = customers?.total ?? 0;
        } catch {}
        return json({ income_today, active_reservations, available_boats, total_customers });
      }

      // API CLIENTES (sin cambios)
      if (url.pathname.startsWith("/api/customers")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare("SELECT id, full_name, document_id, phone, email FROM customers").all();
          return json(rows.results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare("INSERT INTO customers (full_name, document_id, phone, email) VALUES (?,?,?,?)")
            .bind(body.full_name, body.document_id, body.phone, body.email).run();
          return json({ok:true});
        }
        if (request.method === "PUT") {
          const id = url.pathname.split("/").pop();
          const body = await request.json();
          await env.DB.prepare("UPDATE customers SET full_name=?, document_id=?, phone=?, email=? WHERE id=?")
            .bind(body.full_name, body.document_id, body.phone, body.email, id).run();
          return json({ok:true});
        }
        if (request.method === "DELETE") {
          const id = url.pathname.split("/").pop();
          await env.DB.prepare("DELETE FROM customers WHERE id=?").bind(id).run();
          return json({ok:true});
        }
      }

      // API BOTES (sin cambios)
      if (url.pathname.startsWith("/api/boats")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare(`
            SELECT id, name, type, capacity, status,
                   price_per_hour, price_per_day, price_per_week,
                   price_per_month, price_per_year
            FROM boats
          `).all();
          return json(rows.results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(`
            INSERT INTO boats (
              name, type, capacity, status,
              price_per_hour, price_per_day, price_per_week,
              price_per_month, price_per_year
            ) VALUES (?,?,?,?,?,?,?,?,?,?)
          `).bind(
            body.name,
            body.type,
            body.capacity,
            body.status || 'available',
            body.price_per_hour || 0,
            body.price_per_day || 0,
            body.price_per_week || 0,
            body.price_per_month || 0,
            body.price_per_year || 0
          ).run();
          return json({ok:true});
        }
        if (request.method === "PUT") {
          const id = url.pathname.split("/").pop();
          const body = await request.json();
          await env.DB.prepare(`
            UPDATE boats SET
              name = ?,
              type = ?,
              capacity = ?,
              status = ?,
              price_per_hour = ?,
              price_per_day = ?,
              price_per_week = ?,
              price_per_month = ?,
              price_per_year = ?
            WHERE id = ?
          `).bind(
            body.name,
            body.type,
            body.capacity,
            body.status || 'available',
            body.price_per_hour || 0,
            body.price_per_day || 0,
            body.price_per_week || 0,
            body.price_per_month || 0,
            body.price_per_year || 0,
            id
          ).run();
          return json({ok:true});
        }
        if (request.method === "DELETE") {
          const id = url.pathname.split("/").pop();
          await env.DB.prepare("DELETE FROM boats WHERE id=?").bind(id).run();
          return json({ok:true});
        }
      }

     // API FACTURAS - Profesional, segura y con mejor manejo de datos
if (url.pathname.startsWith("/api/invoices")) {
  const pathParts = url.pathname.split('/');
  const id = pathParts.length > 2 ? pathParts[2] : null;

  if (request.method === "GET") {
    try {
      const rows = await env.DB.prepare(`
        SELECT 
          i.id,
          i.invoice_number,
          i.reservation_id,
          i.subtotal,
          i.itbis,
          i.total,
          i.payment_method,
          i.payment_status,
          i.notes,
          i.created_at,
          r.reservation_number,
          c.full_name AS customer_name,
          b.name AS boat_name
        FROM invoices i
        LEFT JOIN reservations r ON i.reservation_id = r.id
        LEFT JOIN customers c ON r.customer_id = c.id
        LEFT JOIN boats b ON r.boat_id = b.id
        ORDER BY i.created_at DESC
      `).all();

      return json({
        success: true,
        count: rows.results.length,
        data: rows.results || []
      });
    } catch (e) {
      console.error("Error GET invoices:", e);
      return json({ success: false, error: "Error al obtener facturas" }, 500);
    }
  }

  if (request.method === "POST") {
    try {
      const body = await request.json();

      // Validación estricta
      if (!body.reservation_id) {
        return json({ success: false, error: "reservation_id es obligatorio" }, 400);
      }

      if (body.subtotal == null || body.itbis == null || body.total == null) {
        return json({ success: false, error: "subtotal, itbis y total son obligatorios" }, 400);
      }

      if (body.total !== body.subtotal + body.itbis) {
        return json({ success: false, error: "El total no coincide con subtotal + itbis" }, 400);
      }

      const result = await env.DB.prepare(`
        INSERT INTO invoices (
          reservation_id,
          subtotal,
          itbis,
          total,
          payment_method,
          payment_status,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        RETURNING id, invoice_number
      `).bind(
        body.reservation_id,
        body.subtotal,
        body.itbis,
        body.total,
        body.payment_method || 'cash',
        body.payment_status || 'pending',
        body.notes || null
      ).first();

      return json({
        success: true,
        message: "Factura creada correctamente",
        data: {
          id: result.id,
          invoice_number: result.invoice_number
        }
      }, 201);
    } catch (e) {
      console.error("Error POST invoice:", e);
      return json({ success: false, error: "Error al crear factura: " + e.message }, 500);
    }
  }

  if (request.method === "PUT" && id) {
    try {
      const body = await request.json();

      const exists = await env.DB.prepare("SELECT 1 FROM invoices WHERE id = ?").bind(id).first();
      if (!exists) {
        return json({ success: false, error: "Factura no encontrada" }, 404);
      }

      await env.DB.prepare(`
        UPDATE invoices SET
          subtotal = COALESCE(?, subtotal),
          itbis = COALESCE(?, itbis),
          total = COALESCE(?, total),
          payment_method = COALESCE(?, payment_method),
          payment_status = COALESCE(?, payment_status),
          notes = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).bind(
        body.subtotal,
        body.itbis,
        body.total,
        body.payment_method,
        body.payment_status,
        body.notes || null,
        id
      ).run();

      return json({ success: true, message: "Factura actualizada correctamente" });
    } catch (e) {
      console.error("Error PUT invoice:", e);
      return json({ success: false, error: "Error al actualizar factura" }, 500);
    }
  }

  if (request.method === "DELETE" && id) {
    try {
      const exists = await env.DB.prepare("SELECT 1 FROM invoices WHERE id = ?").bind(id).first();
      if (!exists) {
        return json({ success: false, error: "Factura no encontrada" }, 404);
      }

      await env.DB.prepare("DELETE FROM invoices WHERE id = ?").bind(id).run();

      return json({ success: true, message: "Factura eliminada correctamente" });
    } catch (e) {
      console.error("Error DELETE invoice:", e);
      return json({ success: false, error: "Error al eliminar factura" }, 500);
    }
  }

  return json({ success: false, error: "Método no permitido para /invoices" }, 405);
}

      return json({error:"Not Found"},404);
    } catch(err){
      console.error("Error global:", err);
      return json({error:err.message},500);
    }
  }
};
