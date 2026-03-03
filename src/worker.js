export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });

    try {
      if (url.pathname === "/" && request.method === "GET") {
        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Boat Rental ERP</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * { box-sizing: border-box; }
    body { margin:0; font-family:'Inter',sans-serif; background:#f1f5f9; }
    .sidebar { width:240px; height:100vh; background:#0f172a; color:#fff; position:fixed; padding:25px 20px; }
    .sidebar h2 { margin:0 0 40px 0; font-weight:700; }
    .menu-item { padding:12px 14px; border-radius:8px; margin-bottom:10px; cursor:pointer; transition:.2s; display:flex; align-items:center; gap:12px; }
    .menu-item:hover { background:#1e293b; }
    .menu-item.active { background:#2563eb; }
    .header { margin-left:240px; height:65px; background:#1e3a8a; display:flex; align-items:center; justify-content:space-between; padding:0 30px; color:white; font-weight:600; }
    .content { margin-left:240px; padding:30px; }
    .cards { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
    .card { background:white; padding:20px; border-radius:14px; box-shadow:0 6px 20px rgba(0,0,0,0.05); }
    .card h4 { margin:0; font-weight:600; color:#64748b; }
    .card h2 { margin:10px 0 0 0; }
    .data-table { width:100%; border-collapse:collapse; }
    .data-table th, .data-table td { padding:10px; border-bottom:1px solid #ccc; text-align:left; }
    .btn { padding:6px 12px; border:none; border-radius:4px; cursor:pointer; }
    .btn-danger { background:#ef4444; color:white; }
    .btn-success { background:#22c55e; color:white; }
    .input-search { padding:6px 12px; border:1px solid #ccc; border-radius:4px; }
    .modal-overlay { display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center; }
    .modal-overlay.active { display:flex; }
    .modal { background:white; padding:20px; border-radius:10px; width:520px; max-width:95vw; max-height:90vh; overflow-y:auto; }
    .toast { position:fixed; bottom:20px; right:20px; color:white; padding:12px 18px; border-radius:6px; opacity:0; transition:opacity .4s; z-index:1000; }
    .toast.show { opacity:1; }
    .toast.error { background:#ef4444; }
    .toast.success { background:#22c55e; }
  </style>
</head>
<body>

  <div class="sidebar">
    <h2>⚓ BoatERP</h2>
    <div class="menu-item active" onclick="showDashboard()">📊 Dashboard</div>
    <div class="menu-item" onclick="loadCustomers()">👥 Clientes</div>
    <div class="menu-item" onclick="loadBoats()">⛵ Botes</div>
    <div class="menu-item" onclick="loadReservations()">📅 Reservas</div>
    <div class="menu-item" onclick="loadInvoices()">💳 Facturación</div>
  </div>

  <div class="header">
    <div>Panel Administrativo</div>
    <div>Admin</div>
  </div>

  <div class="content" id="mainContent"></div>

  <!-- Modal Cliente -->
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

  <!-- Modal Bote -->
  <div id="boatModal" class="modal-overlay">
    <div class="modal">
      <h3 id="boatModalTitle">Nuevo Bote</h3>
      <input id="boatName" placeholder="Nombre del bote" style="width:100%;margin-bottom:8px"/>
      <input id="boatType" placeholder="Tipo" style="width:100%;margin-bottom:8px"/>
      <input id="boatCapacity" type="number" placeholder="Capacidad" style="width:100%;margin-bottom:8px"/>
      <select id="boatStatus" style="width:100%;margin-bottom:12px;">
        <option value="available">Disponible</option>
        <option value="rented">Alquilado</option>
        <option value="maintenance">Mantenimiento</option>
      </select>

      <h4>Precios por período (RD$)</h4>
      <input id="priceHour" type="number" step="0.01" placeholder="Precio por hora" style="width:100%;margin-bottom:8px;"/>
      <input id="priceDay" type="number" step="0.01" placeholder="Precio por día" style="width:100%;margin-bottom:8px;"/>
      <input id="priceWeek" type="number" step="0.01" placeholder="Precio por semana" style="width:100%;margin-bottom:8px;"/>
      <input id="priceMonth" type="number" step="0.01" placeholder="Precio por mes" style="width:100%;margin-bottom:8px;"/>
      <input id="priceYear" type="number" step="0.01" placeholder="Precio por año" style="width:100%;margin-bottom:8px;"/>

      <div style="text-align:right;margin-top:16px;">
        <button class="btn-success" onclick="saveBoat()">Guardar</button>
        <button class="btn" onclick="closeBoatModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    let editingCustomerId = null;
    let editingBoatId = null;

    function showToast(msg, type = "success") {
      const toast = document.getElementById("toast");
      toast.textContent = msg;
      toast.className = "toast show " + type;
      setTimeout(() => toast.className = "toast", 4000);
    }

    // Dashboard básico para pruebas
    function showDashboard() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="showDashboard()"]').classList.add('active');
      
      document.getElementById("mainContent").innerHTML = \`
        <h2>Dashboard</h2>
        <p>Versión simplificada - si ves esto, el menú funciona.</p>
        <button onclick="loadBoats()">Ir a Botes</button>
      \`;
    }

    async function loadCustomers() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadCustomers()"]').classList.add('active');
      
      document.getElementById("mainContent").innerHTML = \`
        <h2>Clientes</h2>
        <p>Cargando clientes... (prueba)</p>
      \`;
      showToast("Sección Clientes cargada (prueba)");
    }

    async function loadBoats() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadBoats()"]').classList.add('active');
      
      document.getElementById("mainContent").innerHTML = \`
        <h2>Botes</h2>
        <div style="margin:20px 0;">
          <button class="btn-success" onclick="openBoatModal()">+ Nuevo Bote</button>
        </div>
        <div id="boatTable">Cargando botes...</div>
      \`;

      try {
        const res = await fetch("/api/boats");
        if (!res.ok) throw new Error("Error " + res.status);
        const data = await res.json();
        renderBoatTable(data);
      } catch (err) {
        document.getElementById("boatTable").innerHTML = "<p style='color:red'>Error: " + err.message + "</p>";
        showToast("No se pudieron cargar los botes", "error");
      }
    }

    function renderBoatTable(data) {
      const container = document.getElementById("boatTable");
      if (!data || data.length === 0) {
        container.innerHTML = "<p>No hay botes registrados.</p>";
        return;
      }

      let html = '<table class="data-table"><thead><tr><th>Nombre</th><th>Tipo</th><th>Capacidad</th><th>Estado</th><th>Precio/hora</th><th>Precio/día</th><th>Acciones</th></tr></thead><tbody>';
      data.forEach(b => {
        html += \`<tr>
          <td>\${b.name || '-'}</td>
          <td>\${b.type || '-'}</td>
          <td>\${b.capacity || '-'}</td>
          <td>\${b.status || 'available'}</td>
          <td>RD$ \${(b.price_per_hour || 0).toFixed(2)}</td>
          <td>RD$ \${(b.price_per_day || 0).toFixed(2)}</td>
          <td>
            <button class="btn-success" onclick="openBoatModal(\${b.id})">Editar</button>
            <button class="btn-danger" onclick="deleteBoat(\${b.id})">Eliminar</button>
          </td>
        </tr>\`;
      });
      html += '</tbody></table>';
      container.innerHTML = html;
    }

    function openBoatModal(id = null) {
      editingBoatId = id;
      document.getElementById("boatModalTitle").textContent = id ? "Editar Bote" : "Nuevo Bote";
      // Limpiar campos...
      document.getElementById("boatName").value = "";
      document.getElementById("boatType").value = "";
      document.getElementById("boatCapacity").value = "";
      document.getElementById("boatStatus").value = "available";
      document.getElementById("priceHour").value = "0.00";
      document.getElementById("priceDay").value = "0.00";
      document.getElementById("priceWeek").value = "0.00";
      document.getElementById("priceMonth").value = "0.00";
      document.getElementById("priceYear").value = "0.00";

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
        status: document.getElementById("boatStatus").value,
        price_per_hour: parseFloat(document.getElementById("priceHour").value) || 0,
        price_per_day: parseFloat(document.getElementById("priceDay").value) || 0,
        price_per_week: parseFloat(document.getElementById("priceWeek").value) || 0,
        price_per_month: parseFloat(document.getElementById("priceMonth").value) || 0,
        price_per_year: parseFloat(document.getElementById("priceYear").value) || 0
      };

      const method = editingBoatId ? "PUT" : "POST";
      const endpoint = editingBoatId ? "/api/boats/" + editingBoatId : "/api/boats";

      try {
        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(await res.text());
        showToast(editingBoatId ? "Bote actualizado" : "Bote creado");
        closeBoatModal();
        loadBoats();
      } catch (err) {
        showToast("Error al guardar: " + err.message, "error");
      }
    }

    async function deleteBoat(id) {
      if (!confirm("¿Eliminar bote?")) return;
      try {
        const res = await fetch("/api/boats/" + id, { method: "DELETE" });
        if (!res.ok) throw new Error();
        showToast("Bote eliminado");
        loadBoats();
      } catch (err) {
        showToast("Error al eliminar", "error");
      }
    }

    // Funciones placeholder para las otras secciones
    async function loadReservations() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadReservations()"]').classList.add('active');
      document.getElementById("mainContent").innerHTML = "<h2>Reservas</h2><p>Sección en desarrollo</p>";
    }

    async function loadInvoices() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadInvoices()"]').classList.add('active');
      document.getElementById("mainContent").innerHTML = "<h2>Facturación</h2><p>Sección en desarrollo</p>";
    }

    // Inicio
    showDashboard();
  </script>
</body>
</html>`;

        return new Response(html, {
          headers: { "Content-Type": "text/html;charset=UTF-8" }
        });
      }

      // API endpoints mínimos para que no fallen las llamadas
      if (url.pathname === "/api/boats" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM boats ORDER BY name").all();
        return json(results || []);
      }

      if (url.pathname.startsWith("/api/boats/") && request.method === "GET") {
        const id = url.pathname.split("/").pop();
        const boat = await env.DB.prepare("SELECT * FROM boats WHERE id = ?").bind(id).first();
        return json(boat || {});
      }

      if (url.pathname === "/api/boats" && request.method === "POST") {
        const body = await request.json();
        await env.DB.prepare(
          "INSERT INTO boats (name, type, capacity, status, price_per_hour, price_per_day, price_per_week, price_per_month, price_per_year) VALUES (?,?,?,?,?,?,?,?,?)"
        ).bind(
          body.name, body.type, body.capacity, body.status,
          body.price_per_hour, body.price_per_day, body.price_per_week,
          body.price_per_month, body.price_per_year
        ).run();
        return json({ success: true });
      }

      if (url.pathname.startsWith("/api/boats/") && request.method === "PUT") {
        const id = url.pathname.split("/").pop();
        const body = await request.json();
        await env.DB.prepare(
          "UPDATE boats SET name=?, type=?, capacity=?, status=?, price_per_hour=?, price_per_day=?, price_per_week=?, price_per_month=?, price_per_year=? WHERE id=?"
        ).bind(
          body.name, body.type, body.capacity, body.status,
          body.price_per_hour, body.price_per_day, body.price_per_week,
          body.price_per_month, body.price_per_year, id
        ).run();
        return json({ success: true });
      }

      if (url.pathname.startsWith("/api/boats/") && request.method === "DELETE") {
        const id = url.pathname.split("/").pop();
        await env.DB.prepare("DELETE FROM boats WHERE id = ?").bind(id).run();
        return json({ success: true });
      }

      return json({ error: "Not found" }, 404);
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  }
};
