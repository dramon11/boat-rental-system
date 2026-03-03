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
    .data-table{width:100%;border-collapse:collapse;}
    .data-table th, .data-table td{padding:10px;border-bottom:1px solid #ccc;text-align:left;}
    .btn{padding:6px 12px;border:none;border-radius:4px;cursor:pointer;}
    .btn-danger{background:#ef4444;color:white;}
    .btn-success{background:#22c55e;color:white;}
    .input-search{padding:6px 12px;border:1px solid #ccc;border-radius:4px;}
    .modal-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);justify-content:center;align-items:center;}
    .modal-overlay.active{display:flex;}
    .modal{background:white;padding:24px;border-radius:12px;width:520px;max-width:92vw;}
    .form-group{margin-bottom:16px;}
    .form-group label{display:block;margin-bottom:6px;font-weight:500;color:#334155;}
    .form-group input, .form-group select{width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:6px;}
    .toast{position:fixed;bottom:20px;right:20px;color:white;padding:12px 18px;border-radius:6px;opacity:0;transition:opacity .4s;z-index:1000;}
    .toast.show{opacity:1;}
    .toast.error{background:#ef4444;}
    .toast.success{background:#22c55e;}
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

  <!-- MODAL RESERVAS – profesionalizado -->
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
        <input id="duration" type="number" step="0.5" min="0.5" readonly style="background:#f8fafc;">
      </div>
      <div class="form-group">
        <label>Total estimado</label>
        <input id="totalAmount" type="text" readonly style="background:#f8fafc;font-weight:bold;">
      </div>
      <div style="text-align:right;margin-top:20px;">
        <button class="btn" onclick="closeReservationModal()">Cancelar</button>
        <button class="btn-success" onclick="saveReservation()">Guardar Reserva</button>
      </div>
    </div>
  </div>

  <!-- MODAL FACTURAS – profesionalizado -->
  <div id="invoiceModal" class="modal-overlay">
    <div class="modal" style="width:520px">
      <h3 id="invoiceModalTitle">Nueva Factura</h3>
      <div class="form-group">
        <label>Reserva (opcional)</label>
        <select id="reservationId" onchange="loadReservationData()"></select>
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
        <button class="btn-success" onclick="saveInvoice()">Guardar Factura</button>
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

    // ... (todo el código de dashboard, clientes y botes que ya tenías permanece exactamente igual)

    // Reservas - Profesionalizado
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
      if (!data || data.length === 0) {
        el.innerHTML = "<p>No hay reservas registradas.</p>";
        return;
      }
      let html = '<table class="data-table"><thead><tr><th>Cliente</th><th>Bote</th><th>Inicio</th><th>Fin</th><th>Duración (h)</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
      data.forEach(r => {
        html += \`<tr data-id="\${r.id}">
          <td>\${r.customer_name || '-'}</td>
          <td>\${r.boat_name || '-'}</td>
          <td>\${r.start_time ? new Date(r.start_time).toLocaleString('es-DO') : '-'}</td>
          <td>\${r.end_time ? new Date(r.end_time).toLocaleString('es-DO') : '-'}</td>
          <td>\${r.duration_hours || '-'}</td>
          <td>RD$ \${Number(r.total_amount || 0).toFixed(2)}</td>
          <td>\${r.status || 'pendiente'}</td>
          <td>
            <button class="btn btn-success" onclick="editReservation(\${r.id})">Editar</button>
            <button class="btn btn-danger" onclick="deleteReservation(\${r.id})">Eliminar</button>
          </td>
        </tr>\`;
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    }

    async function openReservationModal(reservationId = null) {
      editingReservationId = reservationId;
      document.getElementById("reservationModalTitle").textContent = reservationId ? "Editar Reserva" : "Nueva Reserva";

      // Cargar clientes
      const customerSelect = document.getElementById("customerId");
      customerSelect.innerHTML = '<option value="">Cargando...</option>';
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
        customerSelect.innerHTML = '<option>Error al cargar clientes</option>';
      }

      // Cargar botes
      const boatSelect = document.getElementById("boatId");
      boatSelect.innerHTML = '<option value="">Cargando...</option>';
      try {
        const res = await fetch('/api/boats');
        const boats = await res.json();
        boatSelect.innerHTML = '<option value="">Seleccione bote</option>';
        boats.forEach(b => {
          const opt = document.createElement('option');
          opt.value = b.id;
          opt.dataset.price = b.price_per_hour || 0;
          opt.textContent = b.name + ' - ' + (b.type || 'Sin tipo') + ' ($' + Number(b.price_per_hour || 0).toFixed(2) + '/h)';
          boatSelect.appendChild(opt);
        });
      } catch {
        boatSelect.innerHTML = '<option>Error al cargar botes</option>';
      }

      if (reservationId) {
        // Cargar datos existentes (opcional - puedes expandirlo)
        showToast("Cargando datos de reserva...", "info");
      } else {
        document.getElementById("startTime").value = "";
        document.getElementById("endTime").value = "";
        document.getElementById("duration").value = "";
        document.getElementById("totalAmount").value = "";
      }

      document.getElementById("reservationModal").classList.add("active");
    }

    function calculateDurationAndTotal() {
      const start = document.getElementById("startTime").value;
      const end = document.getElementById("endTime").value;
      const boatSelect = document.getElementById("boatId");
      const selected = boatSelect.options[boatSelect.selectedIndex];
      const priceHour = parseFloat(selected?.dataset?.price || 0);

      if (start && end && priceHour > 0) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffMs = endDate - startDate;
        const hours = diffMs / (1000 * 60 * 60);
        const total = hours * priceHour;

        document.getElementById("duration").value = hours.toFixed(2);
        document.getElementById("totalAmount").value = "RD$ " + total.toFixed(2);
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
        status: editingReservationId ? 'active' : 'pendiente'
      };

      const isEdit = editingReservationId !== null;
      try {
        const res = await fetch(isEdit ? '/api/reservations/' + editingReservationId : '/api/reservations', {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(await res.text());
        showToast(isEdit ? "Reserva actualizada" : "Reserva creada", "success");
        closeReservationModal();
        await loadReservations();
        await loadDashboard();
      } catch (err) {
        console.error(err);
        showToast("Error: " + err.message, "error");
      }
    }

    function editReservation(id) {
      editingReservationId = id;
      document.getElementById("reservationModalTitle").textContent = "Editar Reserva";
      openReservationModal(id);
    }

    async function deleteReservation(id) {
      if (!confirm("¿Seguro eliminar esta reserva?")) return;
      try {
        const res = await fetch('/api/reservations/' + id, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        showToast("Reserva eliminada", "success");
        await loadReservations();
        await loadDashboard();
      } catch {
        showToast("Error al eliminar reserva", "error");
      }
    }

    // Facturación - Profesionalizado
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
            <button class="btn btn-success" onclick="editInvoice(\${i.id})">Editar</button>
            <button class="btn btn-danger" onclick="deleteInvoice(\${i.id})">Eliminar</button>
          </td>
        </tr>\`;
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    }

    async function openInvoiceModal(invoiceId = null) {
      editingInvoiceId = invoiceId;
      document.getElementById("invoiceModalTitle").textContent = invoiceId ? "Editar Factura" : "Nueva Factura";

      // Cargar reservas existentes
      const resSelect = document.getElementById("reservationId");
      resSelect.innerHTML = '<option value="">Cargando reservas...</option>';
      try {
        const res = await fetch('/api/reservations');
        const reservations = await res.json();
        resSelect.innerHTML = '<option value="">Factura manual (sin reserva)</option>';
        reservations.forEach(r => {
          const opt = document.createElement('option');
          opt.value = r.id;
          opt.textContent = 'Reserva #' + r.id + ' - ' + (r.customer_name || 'Cliente') + ' - ' + (r.boat_name || 'Bote');
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

    function loadReservationData() {
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

      const isEdit = editingInvoiceId !== null;
      try {
        const res = await fetch(isEdit ? '/api/invoices/' + editingInvoiceId : '/api/invoices', {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(await res.text());
        showToast(isEdit ? "Factura actualizada" : "Factura creada", "success");
        closeInvoiceModal();
        await loadInvoices();
        await loadDashboard();
      } catch (err) {
        console.error(err);
        showToast("Error al guardar factura: " + err.message, "error");
      }
    }

    function editInvoice(id) {
      editingInvoiceId = id;
      document.getElementById("invoiceModalTitle").textContent = "Editar Factura";
      openInvoiceModal(id);
    }

    async function deleteInvoice(id) {
      if (!confirm("¿Seguro eliminar factura?")) return;
      try {
        const res = await fetch('/api/invoices/' + id, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        showToast("Factura eliminada", "success");
        await loadInvoices();
        await loadDashboard();
      } catch {
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

      // API RESERVAS – ajustado a boat_id
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
            body.total_amount,
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

      // API FACTURAS – sin cambios mayores
      if (url.pathname.startsWith("/api/invoices")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare(`
            SELECT i.*, c.full_name AS customer_name
            FROM invoices i
            LEFT JOIN reservations r ON i.reservation_id = r.id
            LEFT JOIN customers c ON r.customer_id = c.id
          `).all();
          return json(rows.results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare("INSERT INTO invoices (reservation_id, subtotal, itbis, total, payment_method) VALUES (?,?,?,?,?)")
            .bind(body.reservation_id, body.subtotal, body.itbis, body.total, body.payment_method).run();
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
