export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

    try {

      // ==================== FRONTEND ====================
      if(url.pathname === "/" && request.method === "GET") {
        const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Boat Rental ERP</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
*{box-sizing:border-box} body{margin:0;font-family:'Inter',sans-serif;background:#f1f5f9;}
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
.data-table th,.data-table td{padding:10px;border-bottom:1px solid #ccc;text-align:left;}
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

<div class="content" id="mainContent"></div>

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
let editingCustomerId = null;

// ==================== DASHBOARD ====================
async function showDashboard() {
  const res = await fetch('/api/dashboard');
  const data = await res.json();

  const html = \`
  <div id="dashboard">
    <div class="cards">
      <div class="card"><h4>Ingresos Hoy</h4><h2>\$${data.income_today}</h2></div>
      <div class="card"><h4>Alquileres Activos</h4><h2>${data.active_rentals}</h2></div>
      <div class="card"><h4>Botes Disponibles</h4><h2>${data.available_boats}</h2></div>
      <div class="card"><h4>Total Clientes</h4><h2>${data.total_customers}</h2></div>
    </div>
    <div class="charts">
      <div class="chart-box"><h4>Resumen General (Barras)</h4><canvas id="barChart"></canvas></div>
      <div class="chart-box"><h4>Tendencia (Línea)</h4><canvas id="lineChart"></canvas></div>
      <div class="chart-box full-width"><h4>Distribución (Pie)</h4><canvas id="pieChart"></canvas></div>
    </div>
  </div>
  \`;
  document.getElementById('mainContent').innerHTML = html;

  const values = [data.income_today,data.active_rentals,data.available_boats,data.total_customers];
  new Chart(document.getElementById("barChart"),{type:"bar",data:{labels:["Ingresos","Activos","Disponibles","Clientes"],datasets:[{data:values}]}});
  new Chart(document.getElementById("lineChart"),{type:"line",data:{labels:["Ingresos","Activos","Disponibles","Clientes"],datasets:[{data:values,tension:0.4}]}});
  new Chart(document.getElementById("pieChart"),{type:"pie",data:{labels:["Ingresos","Activos","Disponibles","Clientes"],datasets:[{data:values}]}});

}

// ==================== CLIENTES ====================
async function loadCustomers() {
  const container = document.getElementById('mainContent');
  container.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">'+
    '<h2>Clientes</h2>'+
    '<div><input id="searchInput" class="input-search" placeholder="Buscar..."/><button class="btn-success" onclick="openCustomerModal()">+ Nuevo Cliente</button></div>'+
    '</div><div class="card"><div id="customerTable">Cargando...</div></div>';
  await fetchCustomers();
}

async function fetchCustomers(){
  const res = await fetch('/api/customers');
  const data = await res.json();
  renderCustomerTable(data);

  document.getElementById('searchInput').addEventListener('input', e=>{
    const val = e.target.value.toLowerCase();
    renderCustomerTable(data.filter(c=>c.full_name.toLowerCase().includes(val) || c.document_id.toLowerCase().includes(val)));
  });
}

function renderCustomerTable(data){
  const tableEl = document.getElementById('customerTable');
  if(!data.length){tableEl.innerHTML='<p>No hay clientes</p>'; return;}
  let html = '<table class="data-table"><thead><tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead><tbody>';
  data.forEach(c=>{
    html += '<tr>';
    html += '<td>'+c.full_name+'</td>';
    html += '<td>'+c.document_id+'</td>';
    html += '<td>'+(c.phone||'-')+'</td>';
    html += '<td>'+(c.email||'-')+'</td>';
    html += '<td>'+
      "<button class='btn btn-success' onclick=\"editCustomer("+c.id+",'"+encodeURIComponent(c.full_name)+"','"+encodeURIComponent(c.document_id)+"','"+encodeURIComponent(c.phone||'')+"','"+encodeURIComponent(c.email||'')+"')\">Editar</button> "+
      "<button class='btn btn-danger' onclick='deleteCustomer("+c.id+")'>Eliminar</button>"+
    '</td>';
    html += '</tr>';
  });
  html += '</tbody></table>';
  tableEl.innerHTML = html;
}

function openCustomerModal(){
  editingCustomerId=null;
  document.getElementById('modalTitle').innerText='Nuevo Cliente';
  document.getElementById('name').value='';
  document.getElementById('doc').value='';
  document.getElementById('phone').value='';
  document.getElementById('email').value='';
  document.getElementById('customerModal').classList.add('active');
}

function editCustomer(id,name,doc,phone,email){
  editingCustomerId=id;
  document.getElementById('modalTitle').innerText='Editar Cliente';
  document.getElementById('name').value=decodeURIComponent(name);
  document.getElementById('doc').value=decodeURIComponent(doc);
  document.getElementById('phone').value=decodeURIComponent(phone);
  document.getElementById('email').value=decodeURIComponent(email);
  document.getElementById('customerModal').classList.add('active');
}

function closeCustomerModal(){document.getElementById('customerModal').classList.remove('active');}

async function saveCustomer(){
  const body={
    full_name: document.getElementById('name').value,
    document_id: document.getElementById('doc').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value
  };
  let res;
  if(editingCustomerId){
    res = await fetch('/api/customers/'+editingCustomerId,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  }else{
    res = await fetch('/api/customers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  }
  if(res.ok){showToast('Cliente guardado correctamente','success');closeCustomerModal();fetchCustomers();}
  else showToast('Error al guardar cliente','error');
}

async function deleteCustomer(id){
  if(!confirm('¿Desea eliminar este cliente?')) return;
  await fetch('/api/customers/'+id,{method:'DELETE'});
  showToast('Cliente eliminado','success');
  fetchCustomers();
}

function showToast(msg,type){
  const toast=document.getElementById('toast');
  toast.innerText=msg;
  toast.className='toast show '+type;
  setTimeout(()=>{toast.className='toast';},3000);
}

// CARGA INICIAL
showDashboard();
</script>
</body>
</html>`;
        return new Response(html,{headers:{"Content-Type":"text/html"}});
      }

      // ==================== API DASHBOARD ====================
      if(url.pathname==="/api/dashboard"){
        const income = await env.DB.prepare("SELECT IFNULL(SUM(total_amount),0) AS total FROM rentals WHERE DATE(created_at)=DATE('now')").first();
        const active = await env.DB.prepare("SELECT COUNT(*) AS total FROM rentals WHERE status='active'").first();
        const boats = await env.DB.prepare("SELECT COUNT(*) AS total FROM boats WHERE status='available'").first();
        const customers = await env.DB.prepare("SELECT COUNT(*) AS total FROM customers").first();
        return json({income_today:income.total, active_rentals:active.total, available_boats:boats.total, total_customers:customers.total});
      }

      // ==================== API CLIENTES ====================
      if(url.pathname.startsWith("/api/customers")){
        if(request.method==="GET"){
          const rows = await env.DB.prepare("SELECT id, full_name, document_id, phone, email FROM customers").all();
          return json(rows.results||[]);
        }
        if(request.method==="POST"){
          const body = await request.json();
          await env.DB.prepare("INSERT INTO customers(full_name,document_id,phone,email) VALUES(?,?,?,?)")
            .bind(body.full_name,body.document_id,body.phone,body.email).run();
          return json({ok:true});
        }
        if(request.method==="PUT"){
          const parts = url.pathname.split("/");
          const id = parts[parts.length-1];
          const body = await request.json();
          await env.DB.prepare("UPDATE customers SET full_name=?, document_id=?, phone=?, email=? WHERE id=?")
            .bind(body.full_name,body.document_id,body.phone,body.email,id).run();
          return json({ok:true});
        }
        if(request.method==="DELETE"){
          const parts = url.pathname.split("/");
          const id = parts[parts.length-1];
          await env.DB.prepare("DELETE FROM customers WHERE id=?").bind(id).run();
          return json({ok:true});
        }
      }

      return json({error:"Not Found"},404);

    }catch(err){
      return json({error:err.message},500);
    }
  }
}

