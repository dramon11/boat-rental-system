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
<html>
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

  <!-- MODAL CLIENTES (sin cambios) -->
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

  <!-- MODAL BOTES – con precios -->
  <div id="boatModal" class="modal-overlay">
    <div class="modal">
      <h3 id="boatModalTitle">Nuevo Bote</h3>
      <input id="boatName" placeholder="Nombre del bote" style="width:100%;margin-bottom:8px"/>
      <input id="boatType" placeholder="Tipo (Lancha, Yate, Velero...)" style="width:100%;margin-bottom:8px"/>
      <input id="boatCapacity" placeholder="Capacidad (personas)" type="number" style="width:100%;margin-bottom:8px"/>
      <input id="boatStatus" placeholder="Estado (available/rented/maintenance)" style="width:100%;margin-bottom:12px"/>

      <div class="price-group">
        <div>
          <label>Precio por hora</label>
          <input id="priceHour" type="number" step="0.01" placeholder="0.00" style="width:100%"/>
        </div>
        <div>
          <label>Precio por día</label>
          <input id="priceDay" type="number" step="0.01" placeholder="0.00" style="width:100%"/>
        </div>
        <div>
          <label>Precio por semana</label>
          <input id="priceWeek" type="number" step="0.01" placeholder="0.00" style="width:100%"/>
        </div>
        <div>
          <label>Precio por mes</label>
          <input id="priceMonth" type="number" step="0.01" placeholder="0.00" style="width:100%"/>
        </div>
        <div>
          <label>Precio por año</label>
          <input id="priceYear" type="number" step="0.01" placeholder="0.00" style="width:100%"/>
        </div>
      </div>

      <div style="text-align:right;margin-top:16px;">
        <button class="btn-success" onclick="saveBoat()">Guardar</button>
        <button class="btn" onclick="closeBoatModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <!-- MODAL RESERVAS – profesional -->
  <div id="reservationModal" class="modal-overlay">
    <div class="modal" style="width:520px">
      <h3 id="reservationModalTitle">Nueva Reserva</h3>
      <div class="form-group">
        <label>Cliente</label>
        <select id="customerId"></select>
      </div>
      <div class="form-group">
        <label>Bote</label>
        <select id="boatId" onchange="calculateDurationAndTotal()"></select>
      </div>
      <div class="form-group">
        <label>Inicio</label>
        <input id="startTime" type="datetime-local" onchange="calculateDurationAndTotal()">
      </div>
      <div class="form-group">
        <label>Fin</label>
        <input id="endTime" type="datetime-local" onchange="calculateDurationAndTotal()">
      </div>
      <div class="form-group">
        <label>Duración (horas)</label>
        <input id="duration" type="number" step="0.5" readonly style="background:#f8fafc;">
      </div>
      <div class="form-group">
        <label>Total estimado</label>
        <input id="totalAmount" type="text" readonly style="background:#f8fafc;font-weight:bold;">
      </div>
      <div style="text-align:right;margin-top:20px;">
        <button class="btn" onclick="closeReservationModal()">Cancelar</button>
        <button class="btn-success" onclick="saveReservation()">Guardar</button>
      </div>
    </div>
  </div>

  <!-- MODAL FACTURAS – profesional -->
  <div id="invoiceModal" class="modal-overlay">
    <div class="modal" style="width:520px">
      <h3 id="invoiceModalTitle">Nueva Factura</h3>
      <div class="form-group">
        <label>Reserva (opcional)</label>
        <select id="reservationId" onchange="loadFromReservation()"></select>
      </div>
      <div class="form-group">
        <label>Cliente</label>
        <input id="invoiceCustomer" readonly style="background:#f8fafc;">
      </div>
      <div class="form-group">
        <label>Subtotal</label>
        <input id="subtotal" type="number" step="0.01">
      </div>
      <div class="form-group">
        <label>ITBIS (18%)</label>
        <input id="itbis" type="number" step="0.01">
      </div>
      <div class="form-group">
        <label>Total</label>
        <input id="total" type="number" step="0.01">
      </div>
      <div class="form-group">
        <label>Método de pago</label>
        <select id="paymentMethod">
          <option value="cash">Efectivo</option>
          <option value="card">Tarjeta</option>
          <option value="transfer">Transferencia</option>
        </select>
      </div>
      <div style="text-align:right;margin-top:20px;">
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

    // Dashboard (sin cambios)
    const dashboardHTML = \`
      <div id="dashboard">
        <div class="cards">
          <div class="card"><h4>Ingresos Hoy</h4><h2 id="income">$0</h2></div>
          <div class="card"><h4>Reservas Activas</h4><h2 id="active">0</h2></div>
          <div class="card"><h4>Botes Disponibles</h4><h2 id="boats">0</h2></div>
          <div class="card"><h4>Total Clientes</h4><h2 id="customers">0</h2></div>
        </div>
      </div>
    \`;

    async function loadDashboard() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="showDashboard()"]').classList.add('active');
      document.getElementById("mainContent").innerHTML = dashboardHTML;
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error(\`Status \${res.status}\`);
        const data = await res.json();
        document.getElementById("income").innerText = "$" + (data.income_today ?? 0);
        document.getElementById("active").innerText = data.active_rentals ?? 0;
        document.getElementById("boats").innerText = data.available_boats ?? 0;
        document.getElementById("customers").innerText = data.total_customers ?? 0;
        const values = [data.income_today ?? 0, data.active_rentals ?? 0, data.available_boats ?? 0, data.total_customers ?? 0];
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
    function showDashboard() { loadDashboard(); }

    // Clientes (sin cambios)
    async function loadCustomers() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadCustomers()"]').classList.add('active');
      const container = document.getElementById('mainContent');
      container.innerHTML = \`
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
          const filtered = data.filter(c =>
            (c.full_name || '').toLowerCase().includes(val) ||
            (c.document_id || '').toLowerCase().includes(val)
          );
          renderCustomerTable(filtered);
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

    // Botes (sin cambios)
    async function loadBoats() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadBoats()"]').classList.add('active');
      const container = document.getElementById('mainContent');
      container.innerHTML = \`
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
          const filtered = data.filter(b =>
            (b.name || '').toLowerCase().includes(val) ||
            (b.type || '').toLowerCase().includes(val)
          );
          renderBoatTable(filtered);
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

    // Reservas – profesional
    async function loadReservations() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadReservations()"]').classList.add('active');
      document.getElementById('mainContent').innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h2>Reservas</h2>
          <div>
            <input id="reservationSearchInput" class="input-search" placeholder="Buscar por cliente o bote..." />
            <button class="btn-success" onclick="openReservationModal()">+ Nueva Reserva</button>
          </div>
        </div>
        <div class="card"><div id="reservationTable">Cargando reservas...</div></div>
      \`;
      await fetchReservations();
    }

    async function fetchReservations() {
      try {
        const res = await fetch('/api/reservations');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        renderReservationsTable(data);
        document.getElementById("reservationSearchInput").addEventListener("input", e => {
          const val = e.target.value.toLowerCase();
          const filtered = data.filter(r =>
            (r.customer_name || '').toLowerCase().includes(val) ||
            (r.boat_name || '').toLowerCase().includes(val)
          );
          renderReservationsTable(filtered);
        });
      } catch (err) {
        document.getElementById("reservationTable").innerHTML = "<p style='color:red'>Error cargando reservas: " + err.message + "</p>";
      }
    }

    function renderReservationsTable(data) {
      const el = document.getElementById("reservationTable");
      if (!data || data.length === 0) { el.innerHTML = "<p>No hay reservas.</p>"; return; }
      let html = '<table class="data-table"><thead><tr><th>Cliente</th><th>Bote</th><th>Inicio</th><th>Fin</th><th>Duración (h)</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
      data.forEach(r => {
        html += \`<tr data-id="\${r.id}">
          <td>\${r.customer_name || '-'}</td>
          <td>\${r.boat_name || '-'}</td>
          <td>\${r.start_time || '-'}</td>
          <td>\${r.end_time || '-'}</td>
          <td>\${r.duration_hours || '-'}</td>
          <td>RD$ \${Number(r.total_amount || 0).toFixed(2)}</td>
          <td>\${r.status || 'pendiente'}</td>
          <td>
            <button class="btn btn-success" onclick="editReservation(this)">Editar</button>
            <button class="btn btn-danger" onclick="deleteReservation(\${r.id})">Eliminar</button>
          </td>
        </tr>\`;
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    }

    async function openReservationModal() {
      editingReservationId = null;
      document.getElementById("reservationModalTitle").textContent = "Nueva Reserva";

      // Cargar clientes
      const customerSelect = document.getElementById("customerId");
      customerSelect.innerHTML = '<option value="">Cargando clientes...</option>';
      try {
        const res = await fetch('/api/customers');
        if (!res.ok) throw new Error('Clientes ' + res.status);
        const customers = await res.json();
        customerSelect.innerHTML = '<option value="">Seleccione cliente</option>';
        customers.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.id;
          opt.textContent = c.full_name + (c.document_id ? ' (' + c.document_id + ')' : '');
          customerSelect.appendChild(opt);
        });
      } catch (err) {
        customerSelect.innerHTML = '<option value="">Error al cargar clientes</option>';
      }

      // Cargar botes
      const boatSelect = document.getElementById("boatId");
      boatSelect.innerHTML = '<option value="">Cargando botes...</option>';
      try {
        const res = await fetch('/api/boats');
        if (!res.ok) throw new Error('Botes ' + res.status);
        const boats = await res.json();
        boatSelect.innerHTML = '<option value="">Seleccione bote</option>';
        boats.forEach(b => {
          const opt = document.createElement('option');
          opt.value = b.id;
          opt.dataset.priceHour = b.price_per_hour || 0;
          opt.textContent = b.name + ' - ' + (b.type || 'Sin tipo') + ' ($' + Number(b.price_per_hour || 0).toFixed(2) + '/h)';
          boatSelect.appendChild(opt);
        });
      } catch (err) {
        boatSelect.innerHTML = '<option value="">Error al cargar botes</option>';
      }

      document.getElementById("startTime").value = "";
      document.getElementById("endTime").value = "";
      document.getElementById("duration").value = "";
      document.getElementById("reservationModal").classList.add("active");
    }

    function calculateDurationAndTotal() {
      const start = document.getElementById("startTime").value;
      const end = document.getElementById("endTime").value;
      const boatSelect = document.getElementById("boatId");
      const selected = boatSelect.options[boatSelect.selectedIndex];
      const priceHour = parseFloat(selected?.dataset?.priceHour || 0);

      if (start && end && priceHour > 0) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffMs = endDate - startDate;
        const hours = diffMs / (1000 * 60 * 60);
        const total = hours * priceHour;

        document.getElementById("duration").value = hours.toFixed(2);
        document.getElementById("totalAmount").value = "RD$ " + total.toFixed(2);
      } else {
        document.getElementById("duration").value = "";
        document.getElementById("totalAmount").value = "";
      }
    }

    async function saveReservation() {
      const customerId = document.getElementById("customerId").value;
      const boatId = document.getElementById("boatId").value;
      const startTime = document.getElementById("startTime").value;
      const endTime = document.getElementById("endTime").value;
      const duration = parseFloat(document.getElementById("duration").value) || 0;
      const totalAmount = parseFloat(document.getElementById("totalAmount").value.replace("RD$ ", "")) || 0;

      if (!customerId || !boatId || !startTime || !endTime || duration <= 0) {
        showToast("Complete todos los campos obligatorios", "error");
        return;
      }

      const body = {
        boat_id: boatId,
        customer_id: customerId,
        start_time: startTime,
        end_time: endTime,
        duration_hours: duration,
        total_amount: totalAmount,
        status: 'pendiente'
      };

      try {
        const res = await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(await res.text());
        showToast("Reserva creada correctamente", "success");
        closeReservationModal();
        await loadReservations();
        await loadDashboard();
      } catch (err) {
        console.error(err);
        showToast("Error al guardar reserva: " + err.message, "error");
      }
    }

    function closeReservationModal() {
      document.getElementById("reservationModal").classList.remove("active");
    }

    // Facturación
    async function loadInvoices() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadInvoices()"]').classList.add('active');
      document.getElementById('mainContent').innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h2>Facturación</h2>
          <div>
            <input id="invoiceSearchInput" class="input-search" placeholder="Buscar por cliente o reserva..." />
            <button class="btn-success" onclick="openInvoiceModal()">+ Nueva Factura</button>
          </div>
        </div>
        <div class="card"><div id="invoiceTable">Cargando facturas...</div></div>
      \`;
      await fetchInvoices();
    }

    async function fetchInvoices() {
      try {
        const res = await fetch('/api/invoices');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        renderInvoicesTable(data);
        document.getElementById("invoiceSearchInput").addEventListener("input", e => {
          const val = e.target.value.toLowerCase();
          const filtered = data.filter(i =>
            (i.customer_name || '').toLowerCase().includes(val) ||
            (i.reservation_id + '').includes(val)
          );
          renderInvoicesTable(filtered);
        });
      } catch (err) {
        document.getElementById("invoiceTable").innerHTML = "<p style='color:red'>Error cargando facturas: " + err.message + "</p>";
      }
    }

    function renderInvoicesTable(data) {
      const el = document.getElementById("invoiceTable");
      if (!data || data.length === 0) { el.innerHTML = "<p>No hay facturas.</p>"; return; }
      let html = '<table class="data-table"><thead><tr><th>ID</th><th>Cliente</th><th>Reserva</th><th>Subtotal</th><th>ITBIS</th><th>Total</th><th>Método</th><th>Acciones</th></tr></thead><tbody>';
      data.forEach(i => {
        html += \`<tr data-id="\${i.id}">
          <td>\${i.id}</td>
          <td>\${i.customer_name || '-'}</td>
          <td>\${i.reservation_id || '-'}</td>
          <td>RD$ \${Number(i.subtotal || 0).toFixed(2)}</td>
          <td>RD$ \${Number(i.itbis || 0).toFixed(2)}</td>
          <td><strong>RD$ \${Number(i.total || 0).toFixed(2)}</strong></td>
          <td>\${i.payment_method || '-'}</td>
          <td>
            <button class="btn btn-success" onclick="editInvoice(this)">Editar</button>
            <button class="btn btn-danger" onclick="deleteInvoice(\${i.id})">Eliminar</button>
          </td>
        </tr>\`;
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    }

    async function openInvoiceModal() {
      editingInvoiceId = null;
      document.getElementById("invoiceModalTitle").textContent = "Nueva Factura";

      // Cargar reservas
      const resSelect = document.getElementById("reservationId");
      resSelect.innerHTML = '<option value="">Cargando reservas...</option>';
      try {
        const res = await fetch('/api/reservations');
        const reservations = await res.json();
        resSelect.innerHTML = '<option value="">Factura manual (sin reserva)</option>';
        reservations.forEach(r => {
          const opt = document.createElement('option');
          opt.value = r.id;
          opt.textContent = 'Reserva #' + r.id + ' - ' + (r.customer_name || 'Cliente') + ' - RD$ ' + Number(r.total_amount || 0).toFixed(2);
          opt.dataset.subtotal = r.total_amount || 0;
          opt.dataset.customer = r.customer_name || '';
          resSelect.appendChild(opt);
        });
      } catch {
        resSelect.innerHTML = '<option value="">Error al cargar reservas</option>';
      }

      document.getElementById("invoiceCustomer").value = "";
      document.getElementById("subtotal").value = "";
      document.getElementById("itbis").value = "";
      document.getElementById("total").value = "";
      document.getElementById("paymentMethod").value = "cash";

      document.getElementById("invoiceModal").classList.add("active");
    }

    function loadFromReservation() {
      const select = document.getElementById("reservationId");
      const option = select.options[select.selectedIndex];
      if (option.dataset.subtotal) {
        const subtotal = parseFloat(option.dataset.subtotal);
        document.getElementById("invoiceCustomer").value = option.dataset.customer || "Cliente";
        document.getElementById("subtotal").value = subtotal.toFixed(2);
        const itbis = subtotal * 0.18;
        document.getElementById("itbis").value = itbis.toFixed(2);
        document.getElementById("total").value = (subtotal + itbis).toFixed(2);
      } else {
        document.getElementById("invoiceCustomer").value = "";
        document.getElementById("subtotal").value = "";
        document.getElementById("itbis").value = "";
        document.getElementById("total").value = "";
      }
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
        if (!res.ok) throw new Error(await res.text());
        showToast("Factura creada correctamente", "success");
        closeInvoiceModal();
        await loadInvoices();
        await loadDashboard();
      } catch (err) {
        console.error(err);
        showToast("Error al guardar factura: " + err.message, "error");
      }
    }

    function closeInvoiceModal() {
      document.getElementById("invoiceModal").classList.remove("active");
    }

    function showToast(msg, type) {
      const toast = document.getElementById("toast");
      toast.innerText = msg;
      toast.className = "toast show " + type;
      setTimeout(() => { toast.className = "toast"; }, 4000);
    }

    // Inicio
    loadDashboard();
  </script>
</body>
</html>
        `;
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      }

      // API DASHBOARD – ajustado a tablas reales
      if (url.pathname === "/api/dashboard") {
        let income_today = 0;
        let active_reservations = 0;
        let available_boats = 0;
        let total_customers = 0;

        try {
          const income = await env.DB.prepare("SELECT IFNULL(SUM(total),0) as total FROM invoices WHERE DATE(created_at)=DATE('now')").first();
          income_today = income?.total ?? 0;
        } catch {}

        try {
          const active = await env.DB.prepare("SELECT COUNT(*) as total FROM reservations WHERE status='active'").first();
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
          const parts = url.pathname.split("/");
          const id = parts[parts.length-1];
          const body = await request.json();
          await env.DB.prepare("UPDATE customers SET full_name=?, document_id=?, phone=?, email=? WHERE id=?")
            .bind(body.full_name, body.document_id, body.phone, body.email, id).run();
          return json({ok:true});
        }
        if (request.method === "DELETE") {
          const parts = url.pathname.split("/");
          const id = parts[parts.length-1];
          await env.DB.prepare("DELETE FROM customers WHERE id=?").bind(id).run();
          return json({ok:true});
        }
      }

      // API BOTES (sin cambios)
      if (url.pathname.startsWith("/api/boats")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare("SELECT id, name, type, capacity, status FROM boats").all();
          return json(rows.results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare("INSERT INTO boats (name, type, capacity, status) VALUES (?,?,?,?)")
            .bind(body.name, body.type, body.capacity, body.status).run();
          return json({ok:true});
        }
        if (request.method === "PUT") {
          const parts = url.pathname.split("/");
          const id = parts[parts.length-1];
          const body = await request.json();
          await env.DB.prepare("UPDATE boats SET name=?, type=?, capacity=?, status=? WHERE id=?")
            .bind(body.name, body.type, body.capacity, body.status, id).run();
          return json({ok:true});
        }
        if (request.method === "DELETE") {
          const parts = url.pathname.split("/");
          const id = parts[parts.length-1];
          await env.DB.prepare("DELETE FROM boats WHERE id=?").bind(id).run();
          return json({ok:true});
        }
      }

      // API RESERVAS – ajustado a tu tabla
      if (url.pathname.startsWith("/api/reservations")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare(`
            SELECT r.id, r.boat_id, r.customer_id, r.start_time, r.end_time, r.duration_hours, r.total_amount, r.status,
                   c.full_name AS customer_name,
                   b.name AS boat_name
            FROM reservations r
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN boats b ON r.boat_id = b.id
          `).all();
          return json(rows.results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(`
            INSERT INTO reservations (
              boat_id, customer_id, start_time, end_time, duration_hours, total_amount, status
            ) VALUES (?,?,?,?,?,?,?)
          `).bind(
            body.boat_id,
            body.customer_id,
            body.start_time,
            body.end_time,
            body.duration_hours,
            body.total_amount || 0,
            body.status || 'pendiente'
          ).run();
          return json({ok:true});
        }
        if (request.method === "PUT") {
          const parts = url.pathname.split("/");
          const id = parts[parts.length-1];
          const body = await request.json();
          await env.DB.prepare(`
            UPDATE reservations SET
              boat_id = ?,
              customer_id = ?,
              start_time = ?,
              end_time = ?,
              duration_hours = ?,
              total_amount = ?,
              status = ?
            WHERE id = ?
          `).bind(
            body.boat_id,
            body.customer_id,
            body.start_time,
            body.end_time,
            body.duration_hours,
            body.total_amount,
            body.status || 'active',
            id
          ).run();
          return json({ok:true});
        }
        if (request.method === "DELETE") {
          const parts = url.pathname.split("/");
          const id = parts[parts.length-1];
          await env.DB.prepare("DELETE FROM reservations WHERE id=?").bind(id).run();
          return json({ok:true});
        }
      }

      // API FACTURAS – con nombre del cliente
      if (url.pathname.startsWith("/api/invoices")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare(`
            SELECT i.id, i.reservation_id, i.subtotal, i.itbis, i.total, i.payment_method,
                   c.full_name AS customer_name
            FROM invoices i
            LEFT JOIN reservations r ON i.reservation_id = r.id
            LEFT JOIN customers c ON r.customer_id = c.id
          `).all();
          return json(rows.results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare("INSERT INTO invoices (reservation_id, subtotal, itbis, total, payment_method) VALUES (?,?,?,?,?)")
            .bind(body.reservation_id || null, body.subtotal || 0, body.itbis || 0, body.total || 0, body.payment_method).run();
          return json({ok:true});
        }
        if (request.method === "PUT") {
          const parts = url.pathname.split("/");
          const id = parts[parts.length-1];
          const body = await request.json();
          await env.DB.prepare("UPDATE invoices SET reservation_id=?, subtotal=?, itbis=?, total=?, payment_method=? WHERE id=?")
            .bind(body.reservation_id, body.subtotal, body.itbis, body.total, body.payment_method, id).run();
          return json({ok:true});
        }
        if (request.method === "DELETE") {
          const parts = url.pathname.split("/");
          const id = parts[parts.length-1];
          await env.DB.prepare("DELETE FROM invoices WHERE id=?").bind(id).run();
          return json({ok:true});
        }
      }

      return json({error:"Not Found"},404);
    } catch(err){
      return json({error:err.message},500);
    }
  }
}
