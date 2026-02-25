if (url.pathname === "/" && request.method === "GET") {
  return new Response(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Boat Rental ERP</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      body{margin:0;font-family:Inter;background:#f4f6f9;display:flex}
      .sidebar{
        width:240px;
        background:#0b3d91;
        color:#fff;
        height:100vh;
        padding:20px;
        box-sizing:border-box;
      }
      .sidebar h2{margin-top:0}
      .menu-item{
        padding:10px;
        border-radius:8px;
        cursor:pointer;
        margin-bottom:5px;
      }
      .menu-item:hover{background:rgba(255,255,255,.1)}
      .main{
        flex:1;
        padding:30px;
      }
      .header{
        font-size:22px;
        font-weight:600;
        margin-bottom:20px;
      }
      .cards{
        display:flex;
        gap:20px;
        margin-bottom:30px;
      }
      .card{
        background:#fff;
        padding:20px;
        border-radius:12px;
        box-shadow:0 4px 12px rgba(0,0,0,.08);
        flex:1;
      }
      .card h3{margin:0 0 10px 0;color:#0b3d91}
      .value{font-size:24px;font-weight:600}
      canvas{background:#fff;padding:20px;border-radius:12px;
      box-shadow:0 4px 12px rgba(0,0,0,.08);}
      table{
        width:100%;
        background:#fff;
        border-radius:12px;
        box-shadow:0 4px 12px rgba(0,0,0,.08);
        border-collapse:collapse;
      }
      th,td{padding:12px;border-bottom:1px solid #eee;text-align:left}
      th{background:#f0f3f9}
    </style>
  </head>

  <body>

    <div class="sidebar">
      <h2>BoatRent ERP</h2>
      <div class="menu-item" onclick="loadDashboard()">Dashboard</div>
      <div class="menu-item" onclick="loadCustomers()">Clientes</div>
      <div class="menu-item" onclick="loadBoats()">Botes</div>
      <div class="menu-item" onclick="loadRentals()">Alquileres</div>
    </div>

    <div class="main">
      <div class="header" id="sectionTitle">Dashboard</div>
      <div id="content"></div>
    </div>

    <script>

    async function loadDashboard(){
      document.getElementById("sectionTitle").innerText="Dashboard";

      const res = await fetch('/api/dashboard');
      const data = await res.json();

      document.getElementById("content").innerHTML = \`
        <div class="cards">
          <div class="card"><h3>Ingresos Hoy</h3><div class="value">$ \${data.income_today}</div></div>
          <div class="card"><h3>Activos</h3><div class="value">\${data.active_rentals}</div></div>
          <div class="card"><h3>Disponibles</h3><div class="value">\${data.available_boats}</div></div>
          <div class="card"><h3>Clientes</h3><div class="value">\${data.total_customers}</div></div>
        </div>
        <canvas id="chart" height="100"></canvas>
      \`;

      const ctx = document.getElementById('chart');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Ingresos', 'Activos', 'Disponibles', 'Clientes'],
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

    async function loadCustomers(){
      document.getElementById("sectionTitle").innerText="Clientes";
      const res = await fetch('/api/customers');
      const data = await res.json();

      let rows="";
      data.forEach(c=>{
        rows+=\`<tr>
          <td>\${c.full_name}</td>
          <td>\${c.document_id}</td>
          <td>\${c.phone || ""}</td>
          <td>\${c.email || ""}</td>
        </tr>\`;
      });

      document.getElementById("content").innerHTML = \`
        <table>
          <tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Email</th></tr>
          \${rows}
        </table>
      \`;
    }

    async function loadBoats(){
      document.getElementById("sectionTitle").innerText="Botes";
      const res = await fetch('/api/boats');
      const data = await res.json();

      let rows="";
      data.forEach(b=>{
        rows+=\`<tr>
          <td>\${b.name}</td>
          <td>\${b.type}</td>
          <td>\${b.capacity}</td>
          <td>$\${b.price_per_hour}</td>
          <td>\${b.status}</td>
        </tr>\`;
      });

      document.getElementById("content").innerHTML = \`
        <table>
          <tr><th>Nombre</th><th>Tipo</th><th>Capacidad</th><th>Precio/Hora</th><th>Estado</th></tr>
          \${rows}
        </table>
      \`;
    }

    async function loadRentals(){
      document.getElementById("sectionTitle").innerText="Alquileres";
      document.getElementById("content").innerHTML="<p>Módulo de alquileres listo para expansión.</p>";
    }

    loadDashboard();

    </script>

  </body>
  </html>
  `, { headers: { "Content-Type": "text/html" } });
}
