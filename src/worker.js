export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });
    try {
      /* ============================= FRONTEND ERP ============================== */
      if (url.pathname === "/" && request.method === "GET") {
        const html = `<!DOCTYPE html>
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
    .menu-item{padding:12px 14px;border-radius:8px;margin-bottom:10px;cursor:pointer;transition:.2s;}
    .menu-item:hover{background:#1e293b;}
    .menu-item.active{background:#2563eb;}
    .header{margin-left:240px;height:65px;background:#1e3a8a;display:flex;align-items:center;justify-content:space-between;padding:0 30px;color:white;font-weight:600;}
    .content{margin-left:240px;padding:30px;}
    .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
    .card{background:white;padding:20px;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,0.05);}
    .card h4{margin:0;font-weight:600;color:#64748b;}
    .card h2{margin:10px 0 0 0;}
    .charts{margin-top:40px;display:grid;grid-template-columns:repeat(2,1fr);gap:30px;}
    .chart-box{background:white;padding:25px;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,0.05);}
    .full-width{grid-column:span 2;}
    .data-table{width:100%;border-collapse:collapse;}
    .data-table th, .data-table td{padding:10px;border-bottom:1px solid #ccc;text-align:left;}
    .btn{padding:6px 12px;border:none;border-radius:4px;cursor:pointer;}
    .btn-danger{background:#ef4444;color:white;}
    .btn-success{background:#22c55e;color:white;}
    .input-search{padding:6px 12px;border:1px solid #ccc;border-radius:4px;}
    .modal-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);justify-content:center;align-items:center;}
    .modal-overlay.active{display:flex;}
    .modal{background:white;padding:20px;border-radius:10px;width:400px;}
    .toast{position:fixed;bottom:20px;right:20px;background:#333;color:white;padding:10px 15px;border-radius:5px;opacity:0;transition:opacity .3s;}
    .toast.show{opacity:1;}
  </style>
</head>
<body>
  <div class="sidebar">
    <h2>⚓ BoatERP</h2>
    <div class="menu-item active" onclick="showDashboard()">Dashboard</div>
    <div class="menu-item" onclick="loadCustomers()">Clientes</div>
  </div>
  <div class="header">
    <div>Panel Administrativo</div>
    <div>Admin</div>
  </div>
  <div class="content" id="mainContent">
    <!-- DASHBOARD -->
    <div id="dashboard">
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
      <div class="charts">
        <div class="chart-box">
          <h4>Resumen General (Barras)</h4>
          <canvas id="barChart"></canvas>
        </div>
        <div class="chart-box">
          <h4>Tendencia (Línea)</h4>
          <canvas id="lineChart"></canvas>
        </div>
        <div class="chart-box full-width">
          <h4>Distribución (Pie)</h4>
          <canvas id="pieChart"></canvas>
        </div>
      </div>
    </div>
  </div>
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
  <div id="toast" class="toast"></div>
  <script>
    let editingId = null;
    let customersData = [];

    async function loadDashboard(){
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      document.getElementById("mainContent").innerHTML = document.getElementById('dashboard').outerHTML;
      document.getElementById("income").innerText = "$" + data.income_today;
      document.getElementById("active").innerText = data.active_rentals;
      document.getElementById("boats").innerText = data.available_boats;
      document.getElementById("customers").innerText = data.total_customers;
      const values = [data.income_today,data.active_rentals,data.available_boats,data.total_customers];
      new Chart(document.getElementById("barChart"),{type:"bar",data:{labels:["Ingresos","Activos","Disponibles","Clientes"],datasets:[{data:values}]}});
      new Chart(document.getElementById("lineChart"),{type:"line",data:{labels:["Ingresos","Activos","Disponibles","Clientes"],datasets:[{data:values,tension:0.4}]}});
      new Chart(document.getElementById("pieChart"),{type:"pie",data:{labels:["Ingresos","Activos","Disponibles","Clientes"],datasets:[{data:values}]}});
    }
    function showDashboard(){loadDashboard();}

    /* ========================= CLIENTES ========================= */
    async function loadCustomers(){
      const container = document.getElementById('mainContent');
      container.innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h2>Clientes</h2>
          <div>
            <input id="searchInput" class="input-search" placeholder="Buscar por nombre o documento..." />
            <button class="btn-success" onclick="openCustomerModal()">+ Nuevo Cliente</button>
          </div>
        </div>
        <div class="card">
          <div id="customerTable">Cargando clientes...</div>
        </div>
      \`;
      await fetchCustomers();
    }
    async function fetchCustomers(){
      const res = await fetch('/api/customers');
      const data = await res.json();
      customersData = data;
      renderCustomerTable(data);
      document.getElementById("searchInput").addEventListener("input", e=>{
        const val = e.target.value.toLowerCase();
        const filtered = data.filter(c=>c.full_name.toLowerCase().includes(val) || c.document_id.toLowerCase().includes(val));
        renderCustomerTable(filtered);
      });
    }
    function renderCustomerTable(data){
      const tableEl = document.getElementById("customerTable");
      if(!data || data.length===0){tableEl.innerHTML="<p>No hay clientes.</p>"; return;}
      let html = '<table class="data-table"><thead><tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead><tbody>';
      for(let i=0;i<data.length;i++){
        const c = data[i];
        html += '<tr>';
        html += '<td>'+c.full_name+'</td>';
        html += '<td>'+c.document_id+'</td>';
        html += '<td>'+(c.phone||'-')+'</td>';
        html += '<td>'+(c.email||'-')+'</td>';
        html += '<td><button class="btn" style="background:#3b82f6;color:white;margin-right:5px;" onclick="editCustomer('+c.id+')">Editar</button><button class="btn btn-danger" onclick="deleteCustomer('+c.id+')">Eliminar</button></td>';
        html += '</tr>';
      }
      html += '</tbody></table>';
      tableEl.innerHTML = html;
    }
    function openCustomerModal(customer = null){
      editingId = customer ? customer.id : null;
      document.getElementById("modalTitle").innerText = customer ? "Editar Cliente" : "Nuevo Cliente";
      document.getElementById("name").value = customer ? customer.full_name : "";
      document.getElementById("doc").value = customer ? customer.document_id : "";
      document.getElementById("phone").value = customer ? (customer.phone || "") : "";
      document.getElementById("email").value = customer ? (customer.email || "") : "";
      document.getElementById("customerModal").classL
