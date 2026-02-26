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
    .chart-box{background:white;padding:20px;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,0.05);height:340px;}
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
      <input id="boatStatus" placeholder="Estado (available/rented/maintenance)" style="width:100%;margin-bottom:8px"/>
      <div style="text-align:right;margin-top:10px;">
        <button class="btn-success" onclick="saveBoat()">Guardar</button>
        <button class="btn" onclick="closeBoatModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    let editingCustomerId = null;
    let editingBoatId = null;
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
          <div class="chart-box">
            <h4>Resumen General (Barras)</h4>
            <div class="chart-container"><canvas id="barChart"></canvas></div>
          </div>
          <div class="chart-box">
            <h4>Tendencia (Línea)</h4>
            <div class="chart-container"><canvas id="lineChart"></canvas></div>
          </div>
          <div class="chart-box full-width">
            <h4>Distribución (Pie)</h4>
            <div class="chart-container"><canvas id="pieChart"></canvas></div>
          </div>
        </div>
      </div>
    \`;

    async function loadDashboard() {
      // Limpiar gráficos anteriores
      Object.values(charts).forEach(chart => chart?.destroy?.());
      charts = {};

      document.getElementById("mainContent").innerHTML = dashboardHTML;

      setTimeout(async () => {
        const incomeEl = document.getElementById("income");
        const activeEl = document.getElementById("active");
        const boatsEl = document.getElementById("boats");
        const customersEl = document.getElementById("customers");

        if (!incomeEl || !activeEl || !boatsEl || !customersEl) {
          showToast("Error: No se encontraron elementos del dashboard", "error");
          return;
        }

        try {
          const res = await fetch("/api/dashboard");
          if (!res.ok) throw new Error(await res.text());
          const data = await res.json();

          incomeEl.innerText = "$" + (data.income_today ?? 0);
          activeEl.innerText = data.active_rentals ?? 0;
          boatsEl.innerText = data.available_boats ?? 0;
          customersEl.innerText = data.total_customers ?? 0;

          const values = [
            data.income_today ?? 0,
            data.active_rentals ?? 0,
            data.available_boats ?? 0,
            data.total_customers ?? 0
          ];
          const labels = ["Ingresos Hoy", "Alquileres Activos", "Botes Disp.", "Clientes"];

          const opts = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
          };

          charts.bar = new Chart(document.getElementById("barChart"), {
            type: 'bar', data: { labels, datasets: [{ data: values, backgroundColor: ['#3b82f6','#10b981','#f59e0b','#8b5cf6'] }] }, options: opts
          });

          charts.line = new Chart(document.getElementById("lineChart"), {
            type: 'line', data: { labels, datasets: [{ data: values, tension: 0.4, borderColor: '#3b82f6' }] }, options: opts
          });

          charts.pie = new Chart(document.getElementById("pieChart"), {
            type: 'pie', data: { labels, datasets: [{ data: values, backgroundColor: ['#3b82f6','#10b981','#f59e0b','#8b5cf6'] }] },
            options: { ...opts, plugins: { legend: { position: 'right' } } }
          });
        } catch (err) {
          console.error(err);
          showToast("Error al cargar dashboard", "error");
          incomeEl.innerText = "$0";
          activeEl.innerText = "0";
          boatsEl.innerText = "0";
          customersEl.innerText = "0";
        }
      }, 50);
    }

    function showDashboard() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="showDashboard()"]').classList.add('active');
      loadDashboard();
    }

    // Resto de funciones (loadCustomers, fetchCustomers, etc.) se mantienen iguales al código anterior que te funcionaba parcialmente

    // ... (pega aquí las funciones de clientes y botes del código anterior si las tienes guardadas)

    // Inicio
    loadDashboard();
  </script>
</body>
</html>
        `;
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      }

      // API DASHBOARD con consultas independientes
      if (url.pathname === "/api/dashboard") {
        let income_today = 0;
        let active_rentals = 0;
        let available_boats = 0;
        let total_customers = 0;

        try { const r = await env.DB.prepare("SELECT IFNULL(SUM(total_amount),0) as total FROM rentals WHERE DATE(created_at)=DATE('now')").first(); income_today = r.total; } catch {}
        try { const r = await env.DB.prepare("SELECT COUNT(*) as total FROM rentals WHERE status='active'").first(); active_rentals = r.total; } catch {}
        try { const r = await env.DB.prepare("SELECT COUNT(*) as total FROM boats WHERE status='available'").first(); available_boats = r.total; } catch {}
        try { const r = await env.DB.prepare("SELECT COUNT(*) as total FROM customers").first(); total_customers = r.total; } catch {}

        return json({ income_today, active_rentals, available_boats, total_customers });
      }

      // API CLIENTES y BOTES (pega aquí las mismas rutas que tenías antes)

      return json({error:"Not Found"}, 404);
    } catch (err) {
      return json({error: err.message}, 500);
    }
  }
}
