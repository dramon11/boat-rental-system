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
    .modal{background:white;padding:20px;border-radius:10px;width:520px;max-width:95vw;}
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
      <input id="boatCapacity" placeholder="Capacidad (personas)" type="number" style="width:100%;margin-bottom:12px"/>
      <select id="boatStatus" style="width:100%;margin-bottom:16px;padding:8px;">
        <option value="available">Disponible</option>
        <option value="rented">Alquilado</option>
        <option value="maintenance">En mantenimiento</option>
        <option value="inactive">Inactivo</option>
      </select>

      <div style="background:#f8fafc; padding:12px; border-radius:8px; margin-bottom:16px;">
        <h4 style="margin:0 0 12px 0; color:#334155;">Precios de alquiler (RD$)</h4>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <label style="font-size:0.9rem; color:#64748b; display:block; margin-bottom:4px;">Por hora</label>
            <input id="priceHour" type="number" step="0.01" min="0" placeholder="0.00" style="width:100%; padding:6px;"/>
          </div>
          <div>
            <label style="font-size:0.9rem; color:#64748b; display:block; margin-bottom:4px;">Por día</label>
            <input id="priceDay" type="number" step="0.01" min="0" placeholder="0.00" style="width:100%; padding:6px;"/>
          </div>
          <div>
            <label style="font-size:0.9rem; color:#64748b; display:block; margin-bottom:4px;">Por semana</label>
            <input id="priceWeek" type="number" step="0.01" min="0" placeholder="0.00" style="width:100%; padding:6px;"/>
          </div>
          <div>
            <label style="font-size:0.9rem; color:#64748b; display:block; margin-bottom:4px;">Por mes</label>
            <input id="priceMonth" type="number" step="0.01" min="0" placeholder="0.00" style="width:100%; padding:6px;"/>
          </div>
          <div style="grid-column: span 2;">
            <label style="font-size:0.9rem; color:#64748b; display:block; margin-bottom:4px;">Por año</label>
            <input id="priceYear" type="number" step="0.01" min="0" placeholder="0.00" style="width:100%; padding:6px;"/>
          </div>
        </div>
      </div>

      <div style="text-align:right; margin-top:20px;">
        <button class="btn" onclick="closeBoatModal()">Cancelar</button>
        <button class="btn-success" onclick="saveBoat()">Guardar</button>
      </div>
    </div>
  </div>

  <!-- MODAL RESERVAS (sin cambios por ahora) -->
  <div id="reservationModal" class="modal-overlay">
    <div class="modal" style="width:500px">
      <h3 id="reservationModalTitle">Nueva Reserva</h3>
      <select id="customerId" style="width:100%;margin-bottom:8px">
        <option value="">Seleccionar Cliente</option>
      </select>
      <select id="inventoryId" style="width:100%;margin-bottom:8px">
        <option value="">Seleccionar Item</option>
      </select>
      <input id="startTime" type="datetime-local" placeholder="Inicio" style="width:100%;margin-bottom:8px"/>
      <input id="endTime" type="datetime-local" placeholder="Fin" style="width:100%;margin-bottom:8px"/>
      <input id="duration" placeholder="Duración (horas)" type="number" style="width:100%;margin-bottom:8px"/>
      <div style="text-align:right;margin-top:10px;">
        <button class="btn-success" onclick="saveReservation()">Guardar</button>
        <button class="btn" onclick="closeReservationModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <!-- MODAL FACTURAS (sin cambios) -->
  <div id="invoiceModal" class="modal-overlay">
    <div class="modal" style="width:500px">
      <h3 id="invoiceModalTitle">Nueva Factura</h3>
      <select id="reservationId" style="width:100%;margin-bottom:8px">
        <option value="">Seleccionar Reserva (opcional)</option>
      </select>
      <input id="subtotal" type="number" placeholder="Subtotal" style="width:100%;margin-bottom:8px"/>
      <input id="itbis" type="number" placeholder="ITBIS 18%" style="width:100%;margin-bottom:8px"/>
      <input id="total" type="number" placeholder="Total" style="width:100%;margin-bottom:8px"/>
      <select id="paymentMethod" style="width:100%;margin-bottom:8px">
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

    // ------------------- CLIENTES -------------------
    async function loadCustomers() {
      // ... (mismo código que tenías originalmente, sin cambios) ...
    }

    // ... (funciones saveCustomer, deleteCustomer, etc. sin cambios) ...

    // ------------------- BOTES -------------------
    async function loadBoats() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadBoats()"]').classList.add('active');
      const container = document.getElementById('mainContent');
      container.innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h2>Botes</h2>
          <div>
            <input id="boatSearchInput" class="input-search" placeholder="Buscar por nombre o tipo..." style="margin-right:8px;"/>
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

        document.getElementById("boatSearchInput")?.addEventListener("input", e => {
          const val = e.target.value.toLowerCase().trim();
          const filtered = data.filter(b => 
            (b.name||'').toLowerCase().includes(val) || 
            (b.type||'').toLowerCase().includes(val)
          );
          renderBoatTable(filtered);
        });
      } catch {
        document.getElementById("boatTable").innerHTML = "<p style='color:#ef4444'>Error al cargar botes</p>";
      }
    }

    function renderBoatTable(data) {
      const el = document.getElementById("boatTable");
      if (!data?.length) {
        el.innerHTML = "<p>No hay botes registrados.</p>";
        return;
      }
      
      let html = \`
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Capacidad</th>
              <th>Estado</th>
              <th>Precio/hora</th>
              <th>Precio/día</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
      \`;
      
      data.forEach(b => {
        html += \`
          <tr data-id="\${b.id}">
            <td>\${b.name || ''}</td>
            <td>\${b.type || '-'}</td>
            <td>\${b.capacity || '-'}</td>
            <td><span style="text-transform:capitalize">\${b.status || 'available'}</span></td>
            <td>RD$ \${Number(b.price_per_hour||0).toFixed(2)}</td>
            <td>RD$ \${Number(b.price_per_day||0).toFixed(2)}</td>
            <td>
              <button class="btn btn-success" onclick="editBoat(\${b.id})">Editar</button>
              <button class="btn btn-danger" onclick="deleteBoat(\${b.id})">Eliminar</button>
            </td>
          </tr>
        \`;
      });
      
      html += '</tbody></table>';
      el.innerHTML = html;
    }

    function openBoatModal(id = null) {
      editingBoatId = id;
      document.getElementById("boatModalTitle").textContent = id ? "Editar Bote" : "Nuevo Bote";
      
      // Valores por defecto
      document.getElementById("boatName").value = "";
      document.getElementById("boatType").value = "";
      document.getElementById("boatCapacity").value = "";
      document.getElementById("boatStatus").value = "available";
      
      document.getElementById("priceHour").value = "0.00";
      document.getElementById("priceDay").value = "0.00";
      document.getElementById("priceWeek").value = "0.00";
      document.getElementById("priceMonth").value = "0.00";
      document.getElementById("priceYear").value = "0.00";

      if (id) {
        fetch(\`/api/boats/\${id}\`)
          .then(r => r.json())
          .then(b => {
            document.getElementById("boatName").value     = b.name     || "";
            document.getElementById("boatType").value     = b.type     || "";
            document.getElementById("boatCapacity").value = b.capacity || "";
            document.getElementById("boatStatus").value   = b.status   || "available";
            
            document.getElementById("priceHour").value  = Number(b.price_per_hour  || 0).toFixed(2);
            document.getElementById("priceDay").value   = Number(b.price_per_day   || 0).toFixed(2);
            document.getElementById("priceWeek").value  = Number(b.price_per_week  || 0).toFixed(2);
            document.getElementById("priceMonth").value = Number(b.price_per_month || 0).toFixed(2);
            document.getElementById("priceYear").value  = Number(b.price_per_year  || 0).toFixed(2);
          })
          .catch(() => showToast("No se pudo cargar el bote", "error"));
      }

      document.getElementById("boatModal").classList.add("active");
    }

    function closeBoatModal() {
      document.getElementById("boatModal").classList.remove("active");
    }

    async function saveBoat() {
      const body = {
        name:           document.getElementById("boatName").value.trim(),
        type:           document.getElementById("boatType").value.trim(),
        capacity:       parseInt(document.getElementById("boatCapacity").value) || null,
        status:         document.getElementById("boatStatus").value,
        price_per_hour:  parseFloat(document.getElementById("priceHour").value)  || 0,
        price_per_day:   parseFloat(document.getElementById("priceDay").value)   || 0,
        price_per_week:  parseFloat(document.getElementById("priceWeek").value)  || 0,
        price_per_month: parseFloat(document.getElementById("priceMonth").value) || 0,
        price_per_year:  parseFloat(document.getElementById("priceYear").value)  || 0,
      };

      const url = editingBoatId ? \`/api/boats/\${editingBoatId}\` : '/api/boats';
      const method = editingBoatId ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Error desconocido");
        }
        
        showToast(editingBoatId ? "Bote actualizado" : "Bote creado", "success");
        closeBoatModal();
        await fetchBoats();
      } catch (err) {
        showToast("Error al guardar bote: " + err.message, "error");
        console.error(err);
      }
    }

    async function deleteBoat(id) {
      if (!confirm("¿Seguro que deseas eliminar este bote?")) return;
      try {
        const res = await fetch('/api/boats/' + id, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        showToast("Bote eliminado", "success");
        await fetchBoats();
      } catch {
        showToast("Error al eliminar bote", "error");
      }
    }

    function editBoat(id) {
      openBoatModal(id);
    }

    // ------------------- RESERVAS y FACTURAS -------------------
    // (mantengo la implementación básica que tenías, sin cambios por ahora)

    async function loadReservations() {
      // ... igual que antes ...
    }

    async function loadInvoices() {
      // ... igual que antes ...
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

      // API DASHBOARD
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
        // ... mismo código que tenías ...
      }

      // API BOTES - ACTUALIZADO
      if (url.pathname.startsWith("/api/boats")) {
        if (request.method === "GET") {
          if (url.pathname === "/api/boats") {
            const { results } = await env.DB.prepare(`
              SELECT id, name, type, capacity, status,
                     price_per_hour, price_per_day, price_per_week, price_per_month, price_per_year
              FROM boats
              ORDER BY name
            `).all();
            return json(results || []);
          } else {
            // GET /api/boats/:id
            const id = url.pathname.split("/").pop();
            const boat = await env.DB.prepare(`
              SELECT * FROM boats WHERE id = ?
            `).bind(id).first();
            return json(boat || {error:"Not found"}, boat ? 200 : 404);
          }
        }

        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(`
            INSERT INTO boats (
              name, type, capacity, status,
              price_per_hour, price_per_day, price_per_week, price_per_month, price_per_year
            ) VALUES (?,?,?,?,?,?,?,?,?)
          `).bind(
            body.name,
            body.type,
            body.capacity,
            body.status || 'available',
            body.price_per_hour  || 0,
            body.price_per_day   || 0,
            body.price_per_week  || 0,
            body.price_per_month || 0,
            body.price_per_year  || 0
          ).run();
          return json({ success: true });
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
              price_per_hour  = ?,
              price_per_day   = ?,
              price_per_week  = ?,
              price_per_month = ?,
              price_per_year  = ?
            WHERE id = ?
          `).bind(
            body.name,
            body.type,
            body.capacity,
            body.status,
            body.price_per_hour,
            body.price_per_day,
            body.price_per_week,
            body.price_per_month,
            body.price_per_year,
            id
          ).run();
          return json({ success: true });
        }

        if (request.method === "DELETE") {
          const id = url.pathname.split("/").pop();
          await env.DB.prepare("DELETE FROM boats WHERE id=?").bind(id).run();
          return json({ok:true});
        }
      }

      // API RESERVAS y FACTURAS (sin cambios por ahora)
      if (url.pathname.startsWith("/api/reservations")) {
        // ... tu código original ...
      }

      if (url.pathname.startsWith("/api/invoices")) {
        // ... tu código original ...
      }

      return json({error:"Not Found"},404);
    } catch(err){
      return json({error:err.message},500);
    }
  }
}
