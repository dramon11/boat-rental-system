addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

let customers = [
  { id: 1, name: "Juan Pérez", document_id: "001-1234567-8", phone: "809-111-2222" },
  { id: 2, name: "María López", document_id: "001-2345678-9", phone: "809-333-4444" },
];

async function handleRequest(request) {
  const url = new URL(request.url);

  if (url.pathname === "/" || url.pathname === "/index") {
    return new Response(getHTML(), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
  }

  if (url.pathname.startsWith("/api/customers")) {
    if (request.method === "GET") {
      return new Response(JSON.stringify(customers), { headers: { "Content-Type": "application/json" } });
    }
    if (request.method === "POST") {
      const data = await request.json();
      const newId = customers.length ? customers[customers.length - 1].id + 1 : 1;
      customers.push({ id: newId, ...data });
      return new Response(JSON.stringify({ success: true }));
    }
  }

  return new Response("Not found", { status: 404 });
}

function getHTML() {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>ERP de Alquiler de Botes</title>
<style>
body{font-family:sans-serif;margin:0;padding:0;background:#f4f4f4;}
.cards{display:flex;gap:10px;margin:10px;}
.card{background:#fff;padding:20px;flex:1;border-radius:8px;box-shadow:0 0 5px #ccc;}
.charts{display:flex;gap:10px;margin:10px;flex-wrap:wrap;}
.chart-box{background:#fff;padding:10px;border-radius:8px;flex:1;min-width:300px;}
.full-width{flex:1 1 100%;}
.btn-success{padding:5px 10px;background:#28a745;color:#fff;border:none;border-radius:5px;cursor:pointer;}
.input-search{padding:5px;border-radius:5px;border:1px solid #ccc;margin-right:5px;}
table{width:100%;border-collapse:collapse;}
th,td{padding:8px;text-align:left;border-bottom:1px solid #ccc;}
th{background:#eee;}
button.edit-btn{margin-right:5px;background:#007bff;color:#fff;padding:3px 8px;border:none;border-radius:4px;cursor:pointer;}
button.delete-btn{background:#dc3545;color:#fff;padding:3px 8px;border:none;border-radius:4px;cursor:pointer;}
</style>
</head>
<body>

<div id="mainContent">

  <!-- DASHBOARD -->
  <div id="dashboardModule">
    <div class="cards">
      <div class="card"><h4>Ingresos Hoy</h4><h2 id="income">$0</h2></div>
      <div class="card"><h4>Alquileres Activos</h4><h2 id="active">0</h2></div>
      <div class="card"><h4>Botes Disponibles</h4><h2 id="boats">0</h2></div>
      <div class="card"><h4>Total Clientes</h4><h2 id="customers">0</h2></div>
    </div>
    <div class="charts">
      <div class="chart-box"><h4>Resumen General (Barras)</h4><canvas id="barChart"></canvas></div>
      <div class="chart-box"><h4>Tendencia (Línea)</h4><canvas id="lineChart"></canvas></div>
      <div class="chart-box full-width"><h4>Distribución (Pie)</h4><canvas id="pieChart"></canvas></div>
    </div>
  </div>

  <!-- CLIENTES -->
  <div id="customersModule" style="display:none;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <h2>Clientes</h2>
      <div>
        <input id="searchInput" class="input-search" placeholder="Buscar..." />
        <button class="btn-success" onclick="openCustomerModal()">+ Nuevo Cliente</button>
      </div>
    </div>
    <div class="card">
      <div id="customerTable">Cargando clientes...</div>
    </div>
  </div>

</div>

<!-- MODAL SIMPLIFICADO -->
<div id="customerModal" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
background:#fff;padding:20px;border-radius:10px;box-shadow:0 0 10px #000;">
  <h3 id="modalTitle">Nuevo Cliente</h3>
  <input id="customerName" placeholder="Nombre" /><br/><br/>
  <input id="customerDoc" placeholder="Documento" /><br/><br/>
  <input id="customerPhone" placeholder="Teléfono" /><br/><br/>
  <button onclick="saveCustomer()">Guardar</button>
  <button onclick="closeCustomerModal()">Cerrar</button>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
function showDashboard(){
  document.getElementById('dashboardModule').style.display = 'block';
  document.getElementById('customersModule').style.display = 'none';
}
function loadCustomers(){
  document.getElementById('dashboardModule').style.display = 'none';
  document.getElementById('customersModule').style.display = 'block';
  fetchCustomers();
}

async function fetchCustomers(){
  const res = await fetch('/api/customers');
  const data = await res.json();
  renderCustomerTable(data);
}

function renderCustomerTable(customers){
  const table = document.getElementById('customerTable');
  let html = '<table><thead><tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Acciones</th></tr></thead><tbody>';
  customers.forEach(c => {
    html += `<tr>
      <td>${c.name}</td>
      <td>${c.document_id}</td>
      <td>${c.phone}</td>
      <td>
        <button class="edit-btn" onclick="editCustomer(${c.id})">Editar</button>
        <button class="delete-btn" onclick="deleteCustomer(${c.id})">Eliminar</button>
      </td>
    </tr>`;
  });
  html += '</tbody></table>';
  table.innerHTML = html;
}

// MODAL
let editingId = null;
function openCustomerModal(){
  document.getElementById('customerModal').style.display='block';
  document.getElementById('modalTitle').innerText='Nuevo Cliente';
  document.getElementById('customerName').value='';
  document.getElementById('customerDoc').value='';
  document.getElementById('customerPhone').value='';
  editingId = null;
}
function closeCustomerModal(){
  document.getElementById('customerModal').style.display='none';
}
function editCustomer(id){
  fetch('/api/customers').then(r=>r.json()).then(data=>{
    const c = data.find(x=>x.id===id);
    if(c){
      document.getElementById('customerName').value=c.name;
      document.getElementById('customerDoc').value=c.document_id;
      document.getElementById('customerPhone').value=c.phone;
      document.getElementById('modalTitle').innerText='Editar Cliente';
      editingId=id;
      document.getElementById('customerModal').style.display='block';
    }
  });
}
async function saveCustomer(){
  const name=document.getElementById('customerName').value;
  const doc=document.getElementById('customerDoc').value;
  const phone=document.getElementById('customerPhone').value;
  if(editingId){
    const res=await fetch('/api/customers');
    const data = await res.json();
    const idx=data.findIndex(c=>c.id===editingId);
    if(idx>=0){
      data[idx].name=name;
      data[idx].document_id=doc;
      data[idx].phone=phone;
      renderCustomerTable(data);
    }
  }else{
    await fetch('/api/customers',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name,document_id:doc,phone})
    });
    fetchCustomers();
  }
  closeCustomerModal();
}
function deleteCustomer(id){
  if(confirm('¿Eliminar este cliente?')){
    customers = customers.filter(c=>c.id!==id);
    renderCustomerTable(customers);
  }
}

// GRÁFICOS (simulación)
const barChart=new Chart(document.getElementById('barChart').getContext('2d'),{
  type:'bar',
  data:{
    labels:['Ene','Feb','Mar','Abr','May'],
    datasets:[{label:'Ingresos',data:[1200,1900,3000,5000,2300],backgroundColor:'#007bff'}]
  }
});
const lineChart=new Chart(document.getElementById('lineChart').getContext('2d'),{
  type:'line',
  data:{
    labels:['Ene','Feb','Mar','Abr','May'],
    datasets:[{label:'Alquileres',data:[5,9,7,14,10],borderColor:'#28a745',fill:false}]
  }
});
const pieChart=new Chart(document.getElementById('pieChart').getContext('2d'),{
  type:'pie',
  data:{
    labels:['Botes A','Botes B','Botes C'],
    datasets:[{data:[12,19,7],backgroundColor:['#007bff','#28a745','#dc3545'] }]
  }
});
</script>

</body>
</html>
`;
}
