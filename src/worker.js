export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
      });

    try {

      /* ==============================
         SERVIR FRONTEND ERP EN "/"
      ===============================*/
      if (url.pathname === "/" && request.method === "GET") {
        return new Response(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Boat Rental ERP</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
body {
  margin:0;
  font-family: 'Inter', sans-serif;
  background:#f4f6f9;
}
.sidebar {
  width:220px;
  height:100vh;
  background:#0f172a;
  color:white;
  position:fixed;
  padding:20px;
}
.sidebar h2 {
  margin-bottom:30px;
}
.sidebar button {
  width:100%;
  margin-bottom:10px;
  padding:10px;
  border:none;
  border-radius:8px;
  background:#1e293b;
  color:white;
  cursor:pointer;
}
.header {
  margin-left:220px;
  height:60px;
  background:#1e3a8a;
  color:white;
  display:flex;
  align-items:center;
  padding-left:20px;
  font-weight:600;
}
.content {
  margin-left:220px;
  padding:30px;
}
.cards {
  display:grid;
  grid-template-columns: repeat(4,1fr);
  gap:20px;
}
.card {
  background:white;
  padding:20px;
  border-radius:12px;
  box-shadow:0 4px 12px rgba(0,0,0,0.05);
}
canvas {
  margin-top:40px;
}
</style>
</head>
<body>

<div class="sidebar">
  <h2>Boat ERP</h2>
  <button>Dashboard</button>
  <button>Clientes</button>
  <button>Botes</button>
  <button>Alquileres</button>
  <button>Pagos</button>
</div>

<div class="header">
  Sistema Administrativo de Alquiler
</div>

<div class="content">
  <div class="cards">
    <div class="card">
      <h4>Ingresos Hoy</h4>
      <h2 id="income">$0</h2>
    </div>
    <div class="card">
      <h4>Alquileres Activos</h4>
      <h2 id="active">0</h2>
    </div>
    <div class="card">
      <h4>Botes Disponibles</h4>
      <h2 id="boats">0</h2>
    </div>
    <div class="card">
      <h4>Total Clientes</h4>
      <h2 id="customers">0</h2>
    </div>
  </div>

  <canvas id="chart"></canvas>
</div>

<script>
async function loadDashboard(){
  const res = await fetch("/api/dashboard");
  const data = await res.json();

  document.getElementById("income").innerText = "$" + data.income_today;
  document.getElementById("active").innerText = data.active_rentals;
  document.getElementById("boats").innerText = data.available_boats;
  document.getElementById("customers").innerText = data.total_customers;

  new Chart(document.getElementById('chart'), {
    type: 'bar',
    data: {
      labels: ['Ingresos','Activos','Disponibles','Clientes'],
      datasets: [{
        data: [
          data.income_today,
          data.active_rentals,
          data.available_boats,
          data.total_customers
        ]
      }]
    }
  });
}

loadDashboard();
</script>

</body>
</html>
        `, {
          headers: { "Content-Type": "text/html" },
        });
      }

      /* ==============================
         API EXISTENTE
      ===============================*/

      if (url.pathname === "/api/dashboard") {
        const income = await env.DB.prepare(
          "SELECT IFNULL(SUM(total_amount),0) as total FROM rentals WHERE DATE(created_at)=DATE('now')"
        ).first();

        const active = await env.DB.prepare(
          "SELECT COUNT(*) as total FROM rentals WHERE status='active'"
        ).first();

        const boats = await env.DB.prepare(
          "SELECT COUNT(*) as total FROM boats WHERE status='available'"
        ).first();

        const customers = await env.DB.prepare(
          "SELECT COUNT(*) as total FROM customers"
        ).first();

        return json({
          income_today: income.total,
          active_rentals: active.total,
          available_boats: boats.total,
          total_customers: customers.total
        });
      }

      return json({ error: "Not Found" }, 404);

    } catch (err) {
      return json({ error: err.message }, 500);
    }
  },
};
