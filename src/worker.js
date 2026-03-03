export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });

    try {
      // ────────────────────────────────────────────────
      //                   HTML + JS Frontend
      // ────────────────────────────────────────────────
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
    .modal{background:white;padding:20px;border-radius:10px;width:480px;max-width:92vw;}
    .toast{position:fixed;bottom:20px;right:20px;color:white;padding:12px 18px;border-radius:6px;opacity:0;transition:opacity .4s;z-index:1000;}
    .toast.show{opacity:1;}
    .toast.error{background:#ef4444;}
    .toast.success{background:#22c55e;}
    .price-group { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-top: 12px; }
    .price-group label { font-size: 0.9em; color: #64748b; margin-bottom: 4px; display: block; }
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

  <!-- MODAL BOTES – actualizado con precios -->
  <div id="boatModal" class="modal-overlay">
    <div class="modal">
      <h3 id="boatModalTitle">Nuevo Bote</h3>
      <input id="boatName"    placeholder="Nombre del bote" style="width:100%;margin-bottom:8px"/>
      <input id="boatType"    placeholder="Tipo (Lancha, Yate, Velero...)" style="width:100%;margin-bottom:8px"/>
      <input id="boatCapacity" placeholder="Capacidad (personas)" type="number" style="width:100%;margin-bottom:8px"/>
      <input id="boatStatus"  placeholder="Estado (available / rented / maintenance)" style="width:100%;margin-bottom:12px"/>

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

      <div style="text-align:right;margin-top:20px;">
        <button class="btn-success" onclick="saveBoat()">Guardar</button>
        <button class="btn" onclick="closeBoatModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <!-- Los demás modales (reservas, facturas) permanecen iguales -->

  <div id="toast" class="toast"></div>

  <script>
    let editingCustomerId = null;
    let editingBoatId = null;
    let editingReservationId = null;
    let editingInvoiceId = null;
    let charts = {};

    // ... (dashboardHTML, loadDashboard, showDashboard, clientes completo sin cambios) ...

    // BOTES ────────────────────────────────────────────────
    async function loadBoats() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadBoats()"]').classList.add('active');
      document.getElementById('mainContent').innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h2>Botes</h2>
          <div>
            <input id="boatSearchInput" class="input-search" placeholder="Buscar por nombre, tipo..." />
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
          const val = e.target.value.toLowerCase();
          const filtered = data.filter(b =>
            (b.name  || '').toLowerCase().includes(val) ||
            (b.type  || '').toLowerCase().includes(val)
          );
          renderBoatTable(filtered);
        });
      } catch {
        document.getElementById("boatTable").innerHTML = "<p>Error cargando botes.</p>";
      }
    }

    function renderBoatTable(data) {
      const el = document.getElementById("boatTable");
      if (!data || data.length === 0) {
        el.innerHTML = "<p>No hay botes registrados.</p>";
        return;
      }
      let html = '<table class="data-table"><thead><tr>' +
        '<th>Nombre</th><th>Tipo</th><th>Capacidad</th>' +
        '<th>Precio/h</th><th>Precio/día</th><th>Precio/sem</th>' +
        '<th>Precio/mes</th><th>Precio/año</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';

      data.forEach(b => {
        html += \`<tr data-id="\${b.id}">
          <td>\${b.name || ''}</td>
          <td>\${b.type || '-'}</td>
          <td>\${b.capacity || '-'}</td>
          <td>RD$ \${Number(b.price_per_hour  || 0).toFixed(2)}</td>
          <td>RD$ \${Number(b.price_per_day   || 0).toFixed(2)}</td>
          <td>RD$ \${Number(b.price_per_week  || 0).toFixed(2)}</td>
          <td>RD$ \${Number(b.price_per_month || 0).toFixed(2)}</td>
          <td>RD$ \${Number(b.price_per_year  || 0).toFixed(2)}</td>
          <td>\${b.status || 'available'}</td>
          <td>
            <button class="btn btn-success" onclick="editBoat(this)">Editar</button>
            <button class="btn btn-danger"   onclick="deleteBoat(\${b.id})">Eliminar</button>
          </td>
        </tr>\`;
      });
      html += '</tbody></table>';
      el.innerHTML = html;
    }

    function openBoatModal() {
      editingBoatId = null;
      document.getElementById("boatModalTitle").textContent = "Nuevo Bote";
      document.getElementById("boatName").value    = "";
      document.getElementById("boatType").value    = "";
      document.getElementById("boatCapacity").value = "";
      document.getElementById("boatStatus").value  = "available";
      document.getElementById("priceHour").value   = "";
      document.getElementById("priceDay").value    = "";
      document.getElementById("priceWeek").value   = "";
      document.getElementById("priceMonth").value  = "";
      document.getElementById("priceYear").value   = "";
      document.getElementById("boatModal").classList.add("active");
    }

    function editBoat(btn) {
      const row = btn.closest('tr');
      editingBoatId = parseInt(row.dataset.id);
      document.getElementById("boatModalTitle").textContent = "Editar Bote";

      document.getElementById("boatName").value    = row.cells[0].textContent.trim();
      document.getElementById("boatType").value    = row.cells[1].textContent.trim();
      document.getElementById("boatCapacity").value = row.cells[2].textContent.trim() === '-' ? '' : row.cells[2].textContent.trim();
      document.getElementById("boatStatus").value  = row.cells[8].textContent.trim();

      // Precios (quitamos "RD$" y parseamos)
      document.getElementById("priceHour").value   = parseFloat(row.cells[3].textContent.replace(/[^0-9.]/g,'')) || '';
      document.getElementById("priceDay").value    = parseFloat(row.cells[4].textContent.replace(/[^0-9.]/g,'')) || '';
      document.getElementById("priceWeek").value   = parseFloat(row.cells[5].textContent.replace(/[^0-9.]/g,'')) || '';
      document.getElementById("priceMonth").value  = parseFloat(row.cells[6].textContent.replace(/[^0-9.]/g,'')) || '';
      document.getElementById("priceYear").value   = parseFloat(row.cells[7].textContent.replace(/[^0-9.]/g,'')) || '';

      document.getElementById("boatModal").classList.add("active");
    }

    function closeBoatModal() {
      document.getElementById("boatModal").classList.remove("active");
    }

    async function saveBoat() {
      const body = {
        name:           document.getElementById("boatName").value.trim(),
        type:           document.getElementById("boatType").value.trim(),
        capacity:       parseInt(document.getElementById("boatCapacity").value) || 0,
        status:         document.getElementById("boatStatus").value.trim() || "available",
        price_per_hour:  parseFloat(document.getElementById("priceHour").value)  || 0,
        price_per_day:   parseFloat(document.getElementById("priceDay").value)   || 0,
        price_per_week:  parseFloat(document.getElementById("priceWeek").value)  || 0,
        price_per_month: parseFloat(document.getElementById("priceMonth").value) || 0,
        price_per_year:  parseFloat(document.getElementById("priceYear").value)  || 0,
      };

      const isEdit = editingBoatId !== null;
      const url = isEdit ? '/api/boats/' + editingBoatId : '/api/boats';
      const method = isEdit ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, {
          method,
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
      if (!confirm("¿Seguro eliminar este bote?")) return;
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

    // ... resto del código (reservas, facturas, toast, loadDashboard, clientes, etc.) sin cambios ...

    // Inicio
    loadDashboard();
  </script>
</body>
</html>
        `;
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      }

      // ────────────────────────────────────────────────
      //                     API - Dashboard
      // ────────────────────────────────────────────────
      if (url.pathname === "/api/dashboard") {
        // ... (sin cambios por ahora – puedes agregar métricas de precios más adelante si lo deseas)
        let income_today = 0, active_rentals = 0, available_boats = 0, total_customers = 0;
        try { /* consultas actuales ... */ } catch {}
        return json({ income_today, active_rentals, available_boats, total_customers });
      }

      // ────────────────────────────────────────────────
      //                     API - Botes (actualizado)
      // ────────────────────────────────────────────────
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
            ) VALUES (?,?,?,?,?,?,?,?,?)
          `).bind(
            body.name,
            body.type,
            body.capacity,
            body.status,
            body.price_per_hour,
            body.price_per_day,
            body.price_per_week,
            body.price_per_month,
            body.price_per_year
          ).run();
          return json({ok:true});
        }

        if (request.method === "PUT") {
          const parts = url.pathname.split("/");
          const id = parts[parts.length-1];
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
          return json({ok:true});
        }

        if (request.method === "DELETE") {
          const parts = url.pathname.split("/");
          const id = parts[parts.length-1];
          await env.DB.prepare("DELETE FROM boats WHERE id=?").bind(id).run();
          return json({ok:true});
        }
      }

      // ... resto de endpoints (customers, reservations, invoices) sin cambios ...

      return json({error:"Not Found"}, 404);
    } catch (err) {
      return json({error: err.message}, 500);
    }
  }
};
