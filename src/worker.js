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
    .modal{background:white;padding:20px;border-radius:10px;width:400px;}
    .toast{position:fixed;bottom:20px;right:20px;color:white;padding:12px 18px;border-radius:6px;opacity:0;transition:opacity .4s;z-index:1000;}
    .toast.show{opacity:1;}
    .toast.error{background:#ef4444;}
    .toast.success{background:#22c55e;}
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

  <!-- MODAL BOTES (sin cambios) -->
  <div id="boatModal" class="modal-overlay">
    <div class="modal">
      <h3 id="boatModalTitle">Nuevo Bote</h3>
      <input id="boatName" placeholder="Nombre del bote" style="width:100%;margin-bottom:8px"/>
      <input id="boatType" placeholder="Tipo (Lancha, Yate, Velero...)" style="width:100%;margin-bottom:8px"/>
      <input id="boatCapacity" placeholder="Capacidad (personas)" type="number" style="width:100%;margin-bottom:8px"/>
      <input id="boatStatus" placeholder="Estado (available/rented/maintenance)" style="width:100%;margin-bottom:8px"/>
      <div style="text-align:right;margin-top:10px;">
        <button class="btn-success" onclick="saveBoat()">Guardar</button>
        <button class="btn" onclick="closeBoatModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <!-- MODAL RESERVAS – corregido y mejorado -->
  <div id="reservationModal" class="modal-overlay">
    <div class="modal" style="width:500px">
      <h3 id="reservationModalTitle">Nueva Reserva</h3>
      <div style="margin-bottom:12px;">
        <label>Cliente</label>
        <select id="customerId" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;"></select>
      </div>
      <div style="margin-bottom:12px;">
        <label>Bote / Item</label>
        <select id="inventoryId" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;"></select>
      </div>
      <div style="margin-bottom:12px;">
        <label>Inicio</label>
        <input id="startTime" type="datetime-local" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;"/>
      </div>
      <div style="margin-bottom:12px;">
        <label>Fin</label>
        <input id="endTime" type="datetime-local" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;"/>
      </div>
      <div style="margin-bottom:12px;">
        <label>Duración (horas)</label>
        <input id="duration" type="number" step="0.5" min="0.5" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;"/>
      </div>
      <div style="text-align:right;margin-top:16px;">
        <button class="btn" onclick="closeReservationModal()">Cancelar</button>
        <button class="btn-success" onclick="saveReservation()">Guardar</button>
      </div>
    </div>
  </div>

  <!-- MODAL FACTURAS – corregido -->
  <div id="invoiceModal" class="modal-overlay">
    <div class="modal" style="width:500px">
      <h3 id="invoiceModalTitle">Nueva Factura</h3>
      <div style="margin-bottom:12px;">
        <label>Reserva (opcional)</label>
        <select id="reservationId" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;">
          <option value="">Sin reserva asociada</option>
        </select>
      </div>
      <div style="margin-bottom:12px;">
        <label>Subtotal</label>
        <input id="subtotal" type="number" step="0.01" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;"/>
      </div>
      <div style="margin-bottom:12px;">
        <label>ITBIS 18%</label>
        <input id="itbis" type="number" step="0.01" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;"/>
      </div>
      <div style="margin-bottom:12px;">
        <label>Total</label>
        <input id="total" type="number" step="0.01" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;"/>
      </div>
      <div style="margin-bottom:12px;">
        <label>Método de pago</label>
        <select id="paymentMethod" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;">
          <option value="cash">Efectivo</option>
          <option value="card">Tarjeta</option>
          <option value="transfer">Transferencia</option>
        </select>
      </div>
      <div style="text-align:right;margin-top:16px;">
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
          <div class="card"><h4>Alquileres Activos</h4><h2 id="active">0</h2></div>
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
        const labels = ["Ingresos Hoy", "Alquileres Activos", "Botes Disponibles", "Clientes"];
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
    // ... (todo el código de clientes que ya tenías permanece igual)

    // Botes (sin cambios en esta corrección, pero ya estaba ajustado antes)
    // ... (todo el código de botes permanece igual)

    // Reservas - CORREGIDO
    async function loadReservations() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadReservations()"]').classList.add('active');
      document.getElementById('mainContent').innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h2>Reservas</h2>
          <div>
            <input id="reservationSearchInput" class="input-search" placeholder="Buscar por cliente o item..." />
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
        if (!res.ok) throw new Error('Reservas HTTP ' + res.status);
        const data = await res.json();
        renderReservationsTable(data);
        document.getElementById("reservationSearchInput").addEventListener("input", e => {
          const val = e.target.value.toLowerCase();
          const filtered = data.filter(r =>
            (r.customer_name || '').toLowerCase().includes(val) ||
            (r.item_name || '').toLowerCase().includes(val)
          );
          renderReservationsTable(filtered);
        });
      } catch (err) {
        console.error("Error reservas:", err);
        document.getElementById("reservationTable").innerHTML = "<p>Error cargando reservas: " + err.message + "</p>";
      }
    }

    function renderReservationsTable(data) {
      const el = document.getElementById("reservationTable");
      if (!data || data.length === 0) { el.innerHTML = "<p>No hay reservas.</p>"; return; }
      let html = '<table class="data-table"><thead><tr><th>Cliente</th><th>Item</th><th>Inicio</th><th>Fin</th><th>Status</th><th>Acciones</th></tr></thead><tbody>';
      data.forEach(r => {
        html += \`<tr data-id="\${r.id}">
          <td>\${r.customer_name || r.customer_id || '-'}</td>
          <td>\${r.item_name || r.inventory_id || '-'}</td>
          <td>\${r.start_time || '-'}</td>
          <td>\${r.end_time || '-'}</td>
          <td>\${r.status || '-'}</td>
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
        const customers = await res.json();
        customerSelect.innerHTML = '<option value="">Seleccione cliente</option>';
        customers.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.id;
          opt.textContent = c.full_name + (c.document_id ? ' (' + c.document_id + ')' : '');
          customerSelect.appendChild(opt);
        });
      } catch {
        customerSelect.innerHTML = '<option value="">Error al cargar clientes</option>';
      }

      // Cargar items/botes (usando /api/boats como fuente)
      const itemSelect = document.getElementById("inventoryId");
      itemSelect.innerHTML = '<option value="">Cargando items...</option>';
      try {
        const res = await fetch('/api/boats');
        const boats = await res.json();
        itemSelect.innerHTML = '<option value="">Seleccione bote/item</option>';
        boats.forEach(b => {
          const opt = document.createElement('option');
          opt.value = b.id;
          opt.textContent = b.name + ' - ' + (b.type || 'Sin tipo');
          itemSelect.appendChild(opt);
        });
      } catch {
        itemSelect.innerHTML = '<option value="">Error al cargar items</option>';
      }

      document.getElementById("startTime").value = "";
      document.getElementById("endTime").value = "";
      document.getElementById("duration").value = "";
      document.getElementById("reservationModal").classList.add("active");
    }

    function closeReservationModal() {
      document.getElementById("reservationModal").classList.remove("active");
    }

    async function saveReservation() {
      const customerId = document.getElementById("customerId").value;
      const inventoryId = document.getElementById("inventoryId").value;
      const startTime = document.getElementById("startTime").value;
      const endTime = document.getElementById("endTime").value;
      const duration = parseInt(document.getElementById("duration").value) || 1;

      if (!customerId || !inventoryId || !startTime || !endTime) {
        showToast("Complete todos los campos obligatorios", "error");
        return;
      }

      const body = {
        customer_id: customerId,
        inventory_id: inventoryId,
        start_time: startTime,
        end_time: endTime,
        duration: duration
      };

      const isEdit = editingReservationId !== null;
      try {
        const res = await fetch(isEdit ? '/api/reservations/' + editingReservationId : '/api/reservations', {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || 'HTTP ' + res.status);
        }
        showToast(isEdit ? "Reserva actualizada" : "Reserva creada", "success");
        closeReservationModal();
        await loadReservations();
        await loadDashboard();
      } catch (err) {
        console.error("Error al guardar reserva:", err);
        showToast("Error: " + err.message, "error");
      }
    }

    function editReservation(btn) {
      const row = btn.closest('tr');
      editingReservationId = parseInt(row.getAttribute('data-id'));
      document.getElementById("reservationModalTitle").textContent = "Editar Reserva";

      // Aquí puedes cargar los valores actuales en los campos (opcional por ahora)
      // Por simplicidad, solo abrimos el modal
      openReservationModal();
      showToast("Edición de reserva no implementada completamente aún", "info");
    }

    async function deleteReservation(id) {
      if (!confirm("¿Seguro eliminar esta reserva?")) return;
      try {
        const res = await fetch('/api/reservations/' + id, { method: 'DELETE' });
        if (!res.ok) throw new Error("HTTP " + res.status);
        showToast("Reserva eliminada", "success");
        await loadReservations();
        await loadDashboard();
      } catch (err) {
        console.error("Error eliminar reserva:", err);
        showToast("Error al eliminar reserva", "error");
      }
    }

    // Facturación - CORREGIDO
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
        if (!res.ok) throw new Error("Facturas HTTP " + res.status);
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
        console.error("Error facturas:", err);
        document.getElementById("invoiceTable").innerHTML = "<p>Error cargando facturas: " + err.message + "</p>";
      }
    }

    function renderInvoicesTable(data) {
      const el = document.getElementById("invoiceTable");
      if (!data || data.length === 0) { el.innerHTML = "<p>No hay facturas.</p>"; return; }
      let html = '<table class="data-table"><thead><tr><th>ID</th><th>Cliente</th><th>Reserva</th><th>Total</th><th>Status</th><th>Acciones</th></tr></thead><tbody>';
      data.forEach(i => {
        html += \`<tr data-id="\${i.id}">
          <td>\${i.id}</td>
          <td>\${i.customer_name || '-'}</td>
          <td>\${i.reservation_id || '-'}</td>
          <td>RD$ \${i.total || '0'}</td>
          <td>\${i.status || '-'}</td>
          <td>
            <button class="btn btn-success" onclick="editInvoice(this)">Editar</button>
            <button class="btn btn-danger" onclick="deleteInvoice(\${i.id})">Eliminar</button>
          </td>
        </tr>\`;
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    }

    function openInvoiceModal() {
      editingInvoiceId = null;
      document.getElementById("invoiceModalTitle").textContent = "Nueva Factura";
      document.getElementById("reservationId").value = "";
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
      const isEdit = editingInvoiceId !== null;
      try {
        const res = await fetch(isEdit ? '/api/invoices/' + editingInvoiceId : '/api/invoices', {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        showToast(isEdit ? "Factura actualizada" : "Factura creada", "success");
        closeInvoiceModal();
        await loadInvoices();
        await loadDashboard();
      } catch (err) {
        console.error("Error saveInvoice:", err);
        showToast("Error al guardar factura: " + err.message, "error");
      }
    }

    function editInvoice(btn) {
      const row = btn.closest('tr');
      editingInvoiceId = parseInt(row.getAttribute('data-id'));
      document.getElementById("invoiceModalTitle").textContent = "Editar Factura";
      // Aquí podrías cargar los valores actuales (opcional por ahora)
      openInvoiceModal();
      showToast("Edición de factura no implementada completamente", "info");
    }

    async function deleteInvoice(id) {
      if (!confirm("¿Seguro eliminar factura?")) return;
      try {
        const res = await fetch('/api/invoices/' + id, { method: 'DELETE' });
        if (!res.ok) throw new Error("HTTP " + res.status);
        showToast("Factura eliminada", "success");
        await loadInvoices();
        await loadDashboard();
      } catch (err) {
        console.error("Error deleteInvoice:", err);
        showToast("Error al eliminar factura", "error");
      }
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

      // API DASHBOARD (sin cambios)
      if (url.pathname === "/api/dashboard") {
        let income_today = 0;
        let active_rentals = 0;
        let available_boats = 0;
        let total_customers = 0;
        try {
          const income = await env.DB.prepare("SELECT IFNULL(SUM(total_amount),0) as total FROM rentals WHERE DATE(created_at)=DATE('now')").first();
          income_today = income?.total ?? 0;
        } catch {}
        try {
          const active = await env.DB.prepare("SELECT COUNT(*) as total FROM rentals WHERE status='active'").first();
          active_rentals = active?.total ?? 0;
        } catch {}
        try {
          const boats = await env.DB.prepare("SELECT COUNT(*) as total FROM boats WHERE TRIM(LOWER(status)) = 'available'").first();
          available_boats = boats?.total ?? 0;
        } catch {}
        try {
          const customers = await env.DB.prepare("SELECT COUNT(*) as total FROM customers").first();
          total_customers = customers?.total ?? 0;
        } catch {}
        return json({ income_today, active_rentals, available_boats, total_customers });
      }

      // API CLIENTES (sin cambios)
      // ... (tu código original de clientes)

      // API BOTES (sin cambios)
      // ... (tu código original de botes)

      // API RESERVAS (sin cambios en backend)
      if (url.pathname.startsWith("/api/reservations")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare("SELECT id, customer_id, inventory_id, start_time, end_time, status FROM reservations").all();
          return json(rows.results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare("INSERT INTO reservations (customer_id, inventory_id, start_time, end_time, status) VALUES (?,?,?,?, 'pendiente')")
            .bind(body.customer_id, body.inventory_id, body.start_time, body.end_time).run();
          return json({ok:true});
        }
        // PUT y DELETE sin cambios
      }

      // API FACTURAS (sin cambios en backend)
      if (url.pathname.startsWith("/api/invoices")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare("SELECT id, reservation_id, subtotal, itbis, total, payment_method FROM invoices").all();
          return json(rows.results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare("INSERT INTO invoices (reservation_id, subtotal, itbis, total, payment_method) VALUES (?,?,?,?,?)")
            .bind(body.reservation_id, body.subtotal, body.itbis, body.total, body.payment_method).run();
          return json({ok:true});
        }
        // PUT y DELETE sin cambios
      }

      return json({error:"Not Found"},404);
    } catch(err){
      return json({error:err.message},500);
    }
  }
}
