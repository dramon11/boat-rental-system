export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });

    try {
      // =============================================
      // FRONTEND (HTML + JS con logs y errores visibles)
      // =============================================
      if (url.pathname === "/" && request.method === "GET") {
        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>BoatERP - Diagnóstico</title>
  <style>
    body { font-family: sans-serif; background: #f0f4f8; margin: 0; padding: 20px; }
    .sidebar { width: 220px; background: #1a2537; color: white; position: fixed; height: 100%; padding: 20px; }
    .menu-item { padding: 12px; margin: 8px 0; background: #2c3e50; border-radius: 6px; cursor: pointer; }
    .menu-item:hover { background: #34495e; }
    .menu-item.active { background: #3498db; }
    .content { margin-left: 240px; padding: 20px; }
    .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .error { color: #c0392b; font-weight: bold; }
    .toast { position: fixed; bottom: 20px; right: 20px; padding: 12px 20px; color: white; border-radius: 6px; opacity: 0; transition: opacity 0.4s; }
    .toast.show { opacity: 1; }
    .toast.success { background: #27ae60; }
    .toast.error { background: #e74c3c; }
  </style>
</head>
<body>
  <div class="sidebar">
    <h2>⚓ BoatERP</h2>
    <div class="menu-item active" onclick="showSection('dashboard')">Dashboard</div>
    <div class="menu-item" onclick="showSection('clientes')">Clientes</div>
    <div class="menu-item" onclick="showSection('botes')">Botes</div>
  </div>

  <div class="content" id="main">

    <!-- Dashboard placeholder -->
    <div id="dashboard" style="display:none;">
      <h2>Dashboard (simplificado)</h2>
      <div class="card">
        <p>Ingresos hoy: <span id="income">?</span></p>
        <p>Alquileres activos: <span id="active">?</span></p>
        <p>Botes disponibles: <span id="boats">?</span></p>
        <p>Total clientes: <span id="customers">?</span></p>
      </div>
    </div>

    <!-- Clientes -->
    <div id="clientes" style="display:none;">
      <h2>Clientes</h2>
      <div class="card">
        <div id="customerTable">Cargando clientes...</div>
      </div>
    </div>

    <!-- Botes -->
    <div id="botes" style="display:none;">
      <h2>Botes</h2>
      <div class="card">
        <div id="boatTable">Cargando botes...</div>
      </div>
    </div>

  </div>

  <div id="toast" class="toast"></div>

  <script>
    function showToast(msg, type = 'success') {
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.className = 'toast show ' + type;
      setTimeout(() => t.className = 'toast', 4000);
    }

    function showSection(section) {
      document.querySelectorAll('#main > div').forEach(div => div.style.display = 'none');
      document.getElementById(section).style.display = 'block';

      document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
      event.target.classList.add('active');

      if (section === 'dashboard') loadDashboard();
      if (section === 'clientes') loadClientes();
      if (section === 'botes') loadBotes();
    }

    async function loadDashboard() {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error(\`Status \${res.status}\`);
        const data = await res.json();
        document.getElementById('income').textContent = '$' + (data.income_today ?? '?');
        document.getElementById('active').textContent = data.active_rentals ?? '?';
        document.getElementById('boats').textContent = data.available_boats ?? '?';
        document.getElementById('customers').textContent = data.total_customers ?? '?';
      } catch (err) {
        showToast('Error dashboard: ' + err.message, 'error');
      }
    }

    async function loadClientes() {
      const el = document.getElementById('customerTable');
      el.innerHTML = 'Cargando clientes...';
      try {
        const res = await fetch('/api/customers');
        if (!res.ok) throw new Error(\`Status \${res.status} - \${await res.text()}\`);
        const data = await res.json();
        if (!data || data.length === 0) {
          el.innerHTML = '<p>No hay clientes registrados.</p>';
          return;
        }
        let html = '<table border="1" style="border-collapse:collapse;width:100%;"><tr><th>ID</th><th>Nombre</th><th>Documento</th></tr>';
        data.forEach(c => {
          html += \`<tr><td>\${c.id}</td><td>\${c.full_name || ''}</td><td>\${c.document_id || ''}</td></tr>\`;
        });
        html += '</table>';
        el.innerHTML = html;
      } catch (err) {
        el.innerHTML = '<p class="error">Error: ' + err.message + '</p>';
        showToast('Error clientes: ' + err.message, 'error');
      }
    }

    async function loadBotes() {
      const el = document.getElementById('boatTable');
      el.innerHTML = 'Cargando botes...';
      try {
        const res = await fetch('/api/boats');
        if (!res.ok) throw new Error(\`Status \${res.status} - \${await res.text()}\`);
        const data = await res.json();
        if (!data || data.length === 0) {
          el.innerHTML = '<p>No hay botes registrados.</p>';
          return;
        }
        let html = '<table border="1" style="border-collapse:collapse;width:100%;"><tr><th>ID</th><th>Nombre</th><th>Tipo</th><th>Estado</th></tr>';
        data.forEach(b => {
          html += \`<tr><td>\${b.id}</td><td>\${b.name || ''}</td><td>\${b.type || ''}</td><td>\${b.status || ''}</td></tr>\`;
        });
        html += '</table>';
        el.innerHTML = html;
      } catch (err) {
        el.innerHTML = '<p class="error">Error: ' + err.message + '</p>';
        showToast('Error botes: ' + err.message, 'error');
      }
    }

    // Inicio
    showSection('dashboard');
  </script>
</body>
</html>
        `;
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      }

      // =============================================
      // API DASHBOARD - consultas seguras
      // =============================================
      if (url.pathname === "/api/dashboard") {
        let income_today = 0, active_rentals = 0, available_boats = 0, total_customers = 0;

        try {
          const r = await env.DB.prepare("SELECT IFNULL(SUM(total_amount), 0) as total FROM rentals WHERE DATE(created_at) = DATE('now')").first();
          income_today = r?.total ?? 0;
        } catch (e) { console.log("Error ingresos:", e.message); }

        try {
          const r = await env.DB.prepare("SELECT COUNT(*) as total FROM rentals WHERE status = 'active'").first();
          active_rentals = r?.total ?? 0;
        } catch (e) { console.log("Error activos:", e.message); }

        try {
          const r = await env.DB.prepare("SELECT COUNT(*) as total FROM boats WHERE status = 'available'").first();
          available_boats = r?.total ?? 0;
        } catch (e) { console.log("Error boats:", e.message); }

        try {
          const r = await env.DB.prepare("SELECT COUNT(*) as total FROM customers").first();
          total_customers = r?.total ?? 0;
        } catch (e) { console.log("Error customers:", e.message); }

        return json({ income_today, active_rentals, available_boats, total_customers });
      }

      // =============================================
      // API CLIENTES - simplificado
      // =============================================
      if (url.pathname.startsWith("/api/customers")) {
        if (request.method === "GET") {
          try {
            const { results } = await env.DB.prepare("SELECT id, full_name, document_id, phone, email FROM customers").all();
            return json(results || []);
          } catch (e) {
            return json({ error: "DB error clientes: " + e.message }, 500);
          }
        }
        // POST, PUT, DELETE se mantienen como antes (agrega si los necesitas)
        return json({ error: "Método no implementado" }, 405);
      }

      // =============================================
      // API BOTES - simplificado
      // =============================================
      if (url.pathname.startsWith("/api/boats")) {
        if (request.method === "GET") {
          try {
            const { results } = await env.DB.prepare("SELECT id, name, type, capacity, status FROM boats").all();
            return json(results || []);
          } catch (e) {
            return json({ error: "DB error botes: " + e.message }, 500);
          }
        }
        // POST, PUT, DELETE se mantienen como antes
        return json({ error: "Método no implementado" }, 405);
      }

      return json({ error: "Not found" }, 404);
    } catch (err) {
      return json({ error: "Error general: " + err.message }, 500);
    }
  }
}
