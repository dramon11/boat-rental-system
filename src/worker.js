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
    .data-table th, .data-table td{padding:10px;border-bottom:1px solid #e2e8f0;text-align:left;}
    .data-table th{background:#f8fafc;}
    .btn{padding:6px 12px;border:none;border-radius:4px;cursor:pointer;}
    .btn-danger{background:#ef4444;color:white;}
    .btn-success{background:#22c55e;color:white;}
    .input-search{padding:6px 12px;border:1px solid #ccc;border-radius:4px;}
    .modal-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);justify-content:center;align-items:center;}
    .modal-overlay.active{display:flex;}
    .modal{background:white;padding:24px;border-radius:10px;width:540px;max-width:92vw;max-height:90vh;overflow-y:auto;}
    .toast{position:fixed;bottom:20px;right:20px;color:white;padding:12px 18px;border-radius:6px;opacity:0;transition:opacity .4s;z-index:1000;}
    .toast.show{opacity:1;}
    .toast.error{background:#ef4444;}
    .toast.success{background:#22c55e;}
    .price-group{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:16px 0;}
    .price-group label{font-size:0.9em;color:#64748b;display:block;margin-bottom:4px;}
    .price-summary{margin:16px 0;padding:16px;background:#f0f9ff;border:1px solid #bfdbfe;border-radius:8px;}
  </style>
</head>
<body>
  <!-- Sidebar, header y modals de clientes y botes SIN CAMBIOS -->

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

  <!-- Modal clientes y botes permanecen IGUAL -->

  <!-- MODAL RESERVAS – mejorado -->
  <div id="reservationModal" class="modal-overlay">
    <div class="modal">
      <h3 id="reservationModalTitle">Nueva Reserva</h3>
      <select id="customerId" required style="width:100%;margin-bottom:12px">
        <option value="">Seleccionar Cliente</option>
      </select>
      <select id="boatId" required onchange="updatePricePreview()" style="width:100%;margin-bottom:12px">
        <option value="">Seleccionar Bote</option>
      </select>
      <input id="startTime" type="datetime-local" required style="width:100%;margin-bottom:8px"/>
      <input id="endTime" type="datetime-local" required onchange="updatePricePreview()" style="width:100%;margin-bottom:8px"/>
      <div id="priceSummary" class="price-summary" style="display:none;">
        <div><strong>Duración estimada:</strong> <span id="durationDisplay">-</span></div>
        <div><strong>Precio por hora:</strong> RD$ <span id="pricePerHour">0.00</span></div>
        <div style="font-size:1.3em;margin-top:12px;"><strong>Total:</strong> RD$ <span id="totalAmount">0.00</span></div>
      </div>
      <div style="text-align:right;margin-top:20px;">
        <button class="btn-success" onclick="saveReservation()">Guardar Reserva + Factura</button>
        <button class="btn" onclick="closeReservationModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <!-- MODAL FACTURAS – mejorado para mostrar más contexto -->
  <div id="invoiceModal" class="modal-overlay">
    <div class="modal">
      <h3 id="invoiceModalTitle">Factura</h3>
      <div style="margin-bottom:12px;"><strong>Reserva asociada:</strong> <span id="linkedReservation">-</span></div>
      <input id="subtotal" type="number" step="0.01" readonly style="width:100%;margin-bottom:8px"/>
      <input id="itbis" type="number" step="0.01" readonly style="width:100%;margin-bottom:8px"/>
      <input id="total" type="number" step="0.01" readonly style="width:100%;margin-bottom:12px;font-weight:bold;"/>
      <select id="paymentMethod" style="width:100%;margin-bottom:8px">
        <option value="cash">Efectivo</option>
        <option value="card">Tarjeta</option>
        <option value="transfer">Transferencia</option>
      </select>
      <select id="paymentStatus" style="width:100%;margin-bottom:12px">
        <option value="pending">Pendiente</option>
        <option value="paid">Pagada</option>
        <option value="cancelled">Anulada</option>
      </select>
      <div style="text-align:right;">
        <button class="btn-success" onclick="saveInvoice()">Guardar</button>
        <button class="btn" onclick="closeInvoiceModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    // Variables globales existentes
    let editingCustomerId = null;
    let editingBoatId = null;
    let editingReservationId = null;
    let editingInvoiceId = null;
    let charts = {};

    // ── Funciones existentes (dashboard, customers, boats) permanecen iguales ──
    // ... (copia aquí todas las funciones de loadDashboard, loadCustomers, fetchCustomers, renderCustomerTable, loadBoats, fetchBoats, renderBoatTable, openBoatModal, editBoat, saveBoat, deleteBoat, showToast, etc.)

    // ── Nueva función para actualizar preview de precio en modal reserva ──
    async function updatePricePreview() {
      const boatSelect = document.getElementById('boatId');
      const startEl = document.getElementById('startTime');
      const endEl = document.getElementById('endTime');
      const summary = document.getElementById('priceSummary');

      if (!boatSelect.value || !startEl.value || !endEl.value) {
        summary.style.display = 'none';
        return;
      }

      const start = new Date(startEl.value);
      const end = new Date(endEl.value);
      if (end <= start) {
        summary.innerHTML = '<div style="color:#ef4444;">La fecha final debe ser posterior al inicio</div>';
        summary.style.display = 'block';
        return;
      }

      const hours = (end - start) / (1000 * 60 * 60);
      const selectedOption = boatSelect.options[boatSelect.selectedIndex];
      const priceHour = parseFloat(selectedOption.dataset.priceHour || 0);

      const subtotal = hours * priceHour;
      const itbis = subtotal * 0.18;
      const total = subtotal + itbis;

      document.getElementById('durationDisplay').textContent = hours.toFixed(2) + ' horas';
      document.getElementById('pricePerHour').textContent = priceHour.toFixed(2);
      document.getElementById('totalAmount').textContent = total.toFixed(2);
      summary.style.display = 'block';

      // Guardamos datos temporales para saveReservation
      window.tempReservationData = {
        hours,
        subtotal,
        itbis,
        total,
        priceHour
      };
    }

    // ── Cargar selects en modal de reserva ──
    async function loadReservationSelects() {
      // Clientes
      const custRes = await fetch('/api/customers');
      const customers = await custRes.json();
      const custSelect = document.getElementById('customerId');
      custSelect.innerHTML = '<option value="">Seleccionar Cliente</option>';
      customers.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = \`\${c.full_name} — \${c.document_id || 'Sin doc'}\`;
        custSelect.appendChild(opt);
      });

      // Botes (solo disponibles)
      const boatRes = await fetch('/api/boats');
      const boats = await boatRes.json();
      const boatSelect = document.getElementById('boatId');
      boatSelect.innerHTML = '<option value="">Seleccionar Bote</option>';
      boats.forEach(b => {
        if (b.status !== 'available') return;
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = \`\${b.name} (\${b.type || '?'} – \${b.capacity || '?'} pers.)\`;
        opt.dataset.priceHour = b.price_per_hour || 0;
        boatSelect.appendChild(opt);
      });
    }

    async function loadReservations() {
      // ... (mantén tu HTML de loadReservations)
      // Después de insertar el HTML:
      const res = await fetch('/api/reservations');
      const data = await res.json();
      // Renderiza tabla con JOIN (customer_name, boat_name)
      let html = '<table class="data-table"><thead><tr><th>ID</th><th>Cliente</th><th>Bote</th><th>Inicio</th><th>Fin</th><th>Monto</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
      data.forEach(r => {
        html += \`<tr>
          <td>\${r.id}</td>
          <td>\${r.customer_name || '—'}</td>
          <td>\${r.boat_name || '—'}</td>
          <td>\${new Date(r.start_time).toLocaleString()}</td>
          <td>\${new Date(r.end_time).toLocaleString()}</td>
          <td>RD$ \${(r.calculated_amount || 0).toFixed(2)}</td>
          <td>\${r.status}</td>
          <td>
            <button class="btn btn-success" onclick="editReservation(\${r.id})">Editar</button>
          </td>
        </tr>\`;
      });
      document.getElementById('reservationTable').innerHTML = html || '<p>No hay reservas</p>';
    }

    async function saveReservation() {
      const customerId = document.getElementById('customerId').value;
      const boatId = document.getElementById('boatId').value;
      const start = document.getElementById('startTime').value;
      const end = document.getElementById('endTime').value;

      if (!customerId || !boatId || !start || !end) {
        showToast("Complete todos los campos obligatorios", "error");
        return;
      }

      if (!window.tempReservationData) {
        showToast("Calcule el precio primero", "error");
        return;
      }

      const { subtotal, itbis, total } = window.tempReservationData;

      const body = {
        customer_id: parseInt(customerId),
        boat_id: parseInt(boatId),
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString(),
        calculated_amount: total,
        status: 'confirmada'
      };

      try {
        const res = await fetch('/api/reservations', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error(await res.text());

        const result = await res.json();
        const reservationId = result.lastInsertRowid || (await fetch('/api/reservations')).json().then(d => d[d.length-1]?.id);

        // Crear factura automáticamente
        await fetch('/api/invoices', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            reservation_id: reservationId,
            subtotal,
            itbis,
            total,
            payment_method: 'cash',           // valor por defecto, luego se puede editar
            payment_status: 'pending'
          })
        });

        showToast("Reserva creada + Factura generada", "success");
        closeReservationModal();
        loadReservations();
        loadDashboard();
      } catch (err) {
        console.error(err);
        showToast("Error al guardar: " + err.message, "error");
      }
    }

    function closeReservationModal() {
      document.getElementById('reservationModal').classList.remove('active');
      window.tempReservationData = null;
    }

    // Inicio
    loadDashboard();
  </script>
</body>
</html>
        `;
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      }

      // ── API ──────────────────────────────────────────────────────────────

      // Dashboard (ajustado para usar facturas pagadas)
      if (url.pathname === "/api/dashboard") {
        let income_today = 0, active_rentals = 0, available_boats = 0, total_customers = 0;
        try {
          const row = await env.DB.prepare(
            "SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE payment_status = 'paid' AND DATE(created_at) = DATE('now')"
          ).first();
          income_today = row.total || 0;
        } catch {}
        try {
          const row = await env.DB.prepare("SELECT COUNT(*) as cnt FROM reservations WHERE status IN ('pendiente','confirmada')").first();
          active_rentals = row.cnt || 0;
        } catch {}
        try {
          const row = await env.DB.prepare("SELECT COUNT(*) as cnt FROM boats WHERE LOWER(status) = 'available'").first();
          available_boats = row.cnt || 0;
        } catch {}
        try {
          const row = await env.DB.prepare("SELECT COUNT(*) as cnt FROM customers").first();
          total_customers = row.cnt || 0;
        } catch {}
        return json({ income_today, active_rentals, available_boats, total_customers });
      }

      // Clientes y Botes → sin cambios (mantengo tu código original)

      // API RESERVAS – mejorada con JOIN
      if (url.pathname.startsWith("/api/reservations")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare(`
            SELECT 
              r.id, r.customer_id, r.boat_id, r.start_time, r.end_time, r.calculated_amount, r.status,
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
          const stmt = await env.DB.prepare(`
            INSERT INTO reservations (customer_id, boat_id, start_time, end_time, calculated_amount, status)
            VALUES (?, ?, ?, ?, ?, ?)
          `);
          const result = await stmt.bind(
            body.customer_id,
            body.boat_id,
            body.start_time,
            body.end_time,
            body.calculated_amount || 0,
            body.status || 'confirmada'
          ).run();
          return json({ ok: true, lastInsertRowid: result.lastRowId });
        }
        // PUT y DELETE mantienen tu lógica original
      }

      // API FACTURAS – mejorada con campos de estado
      if (url.pathname.startsWith("/api/invoices")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare(`
            SELECT 
              i.id, i.reservation_id, i.subtotal, i.itbis, i.total, i.payment_method, i.payment_status,
              r.start_time, r.calculated_amount,
              c.full_name AS customer_name,
              b.name AS boat_name
            FROM invoices i
            LEFT JOIN reservations r ON i.reservation_id = r.id
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN boats b ON r.boat_id = b.id
          `).all();
          return json(rows.results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(`
            INSERT INTO invoices (reservation_id, subtotal, itbis, total, payment_method, payment_status)
            VALUES (?, ?, ?, ?, ?, ?)
          `).bind(
            body.reservation_id || null,
            body.subtotal || 0,
            body.itbis || 0,
            body.total || 0,
            body.payment_method || 'cash',
            body.payment_status || 'pending'
          ).run();
          return json({ok:true});
        }
        // PUT y DELETE mantienen tu lógica
      }

      return json({error:"Not Found"}, 404);
    } catch (err) {
      return json({error: err.message}, 500);
    }
  }
};
