export default {
  async fetch(request, env) {

    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });

    try {
      const url = new URL(request.url);

      // =============================
      // FRONTEND ERP
      // =============================
      if (url.pathname === "/" && request.method === "GET") {

        const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Boat Rental ERP</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:'Inter',sans-serif;}
body{background:#f1f5f9;}
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
.module-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;}
.input-search{padding:10px;width:300px;border-radius:8px;border:1px solid #ccc;}
.btn-primary{padding:10px 15px;background:#2563eb;color:white;border:none;border-radius:8px;cursor:pointer;}
.btn-success{background:#16a34a;color:white;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;}
.btn-secondary{padding:8px 12px;border-radius:8px;cursor:pointer;}
.btn-danger-sm{background:#dc2626;color:white;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;}
.data-table{width:100%;border-collapse:collapse;background:white;border-radius:12px;overflow:hidden;}
.data-table th, .data-table td{padding:10px;text-align:left;border-top:1px solid #eee;}
.modal-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.4);align-items:center;justify-content:center;}
.modal-overlay.active{display:flex;}
.modal{background:white;padding:30px;border-radius:12px;width:400px;max-width:90%;}
.toast{position:fixed;bottom:20px;right:20px;background:#16a34a;color:white;padding:12px 20px;border-radius:8px;display:none;}
.toast.show.success{display:block;background:#16a34a;}
.toast.show.error{display:block;background:#dc2626;}
</style>
</head>
<body>
<div class="sidebar">
<h2>⚓ BoatERP</h2>
<div class="menu-item active" onclick="showDashboard()">Dashboard</div>
<div class="menu-item" onclick="loadModule('customers')">Clientes</div>
<div class="menu-item" onclick="loadModule('boats')">Botes</div>
<div class="menu-item" onclick="loadModule('rentals')">Alquileres</div>
</div>
<div class="header"><div>Panel Administrativo</div><div>Admin</div></div>
<div class="content" id="mainContent"></div>
<div id="toast" class="toast"></div>

<script>
function showToast(msg,type){
  const t=document.getElementById("toast");
  t.innerText=msg;
  t.className="toast show "+type;
  setTimeout(()=>{t.className="toast";},3000);
}
async function fetchJSON(path,opt){const r=await fetch(path,opt);return r.json();}

// --- DASHBOARD ---
async function showDashboard(){
  const c=document.getElementById("mainContent");
  c.innerHTML='<div class="cards">'+
      '<div class="card"><h4>Ingresos Hoy</h4><h2 id="income">$0</h2></div>'+
      '<div class="card"><h4>Alquileres Activos</h4><h2 id="active">0</h2></div>'+
      '<div class="card"><h4>Botes Disponibles</h4><h2 id="boats">0</h2></div>'+
      '<div class="card"><h4>Total Clientes</h4><h2 id="customers">0</h2></div></div>'+
      '<div class="charts">'+
      '<div class="chart-box"><h4>Resumen General (Barras)</h4><canvas id="barChart"></canvas></div>'+
      '<div class="chart-box"><h4>Tendencia (Línea)</h4><canvas id="lineChart"></canvas></div>'+
      '<div class="chart-box full-width"><h4>Distribución (Pie)</h4><canvas id="pieChart"></canvas></div></div>';
  
  const data=await fetchJSON("/api/dashboard");
  document.getElementById("income").innerText="$"+data.income_today;
  document.getElementById("active").innerText=data.active_rentals;
  document.getElementById("boats").innerText=data.available_boats;
  document.getElementById("customers").innerText=data.total_customers;

  const values=[data.income_today,data.active_rentals,data.available_boats,data.total_customers];
  new Chart(document.getElementById("barChart"),{type:"bar",data:{labels:["Ingresos","Activos","Disponibles","Clientes"],datasets:[{data:values,label:"Dashboard"}]}});
  new Chart(document.getElementById("lineChart"),{type:"line",data:{labels:["Ingresos","Activos","Disponibles","Clientes"],datasets:[{data:values,tension:0.4,label:"Dashboard"}]}});
  new Chart(document.getElementById("pieChart"),{type:"pie",data:{labels:["Ingresos","Activos","Disponibles","Clientes"],datasets:[{data:values}]}});

}

// --- CRUD MODULES ---
async function loadModule(type){
  const c=document.getElementById("mainContent");
  c.innerHTML='<div class="module-header"><div><h2>'+type+'</h2></div><div class="actions">'+
      '<input id="searchInput" class="input-search" placeholder="Buscar..."/>'+
      '<button class="btn-primary" onclick="openModal(\''+type+'\')">+ Nuevo</button></div></div>'+
      '<div class="card"><div id="loader">Cargando...</div><div id="table"></div></div>'+
      '<div id="'+type+'Modal" class="modal-overlay">'+
      '<div class="modal"><h3>Nuevo '+type+'</h3>'+
      '<input id="'+type+'_name" placeholder="Nombre"/>'+
      '<input id="'+type+'_extra" placeholder="Documento / Extra"/>'+
      '<div style="margin-top:10px">'+
      '<button class="btn-success" onclick="saveItem(\''+type+'\')">Guardar</button>'+
      '<button class="btn-secondary" onclick="closeModal(\''+type+'\')">Cancelar</button></div></div></div>';
  await fetchItems(type);
}

async function fetchItems(type){
  document.getElementById("loader").style.display="block";
  let data=await fetchJSON("/api/"+type);
  document.getElementById("loader").style.display="none";
  renderTable(type,data);
  const input=document.getElementById("searchInput");
  input.addEventListener("input",function(e){
    const val=e.target.value.toLowerCase();
    renderTable(type,data.filter(i=>(i.full_name||i.name||'').toLowerCase().includes(val)));
  });
}

function renderTable(type,data){
  if(data.length===0){document.getElementById("table").innerHTML="<p>No hay datos</p>"; return;}
  let html="<table class='data-table'><thead><tr><th>Nombre</th><th>Extra</th><th>Acciones</th></tr></thead><tbody>";
  data.forEach(i=>{
    html+='<tr><td>'+(i.full_name||i.name)+'</td><td>'+(i.document_id||i.extra||'-')+'</td>'+
          '<td><button class="btn-danger-sm" onclick="deleteItem(\''+type+'\','+i.id+')">Eliminar</button></td></tr>';
  });
  html+='</tbody></table>';
  document.getElementById("table").innerHTML=html;
}

function openModal(type){document.getElementById(type+"Modal").classList.add("active");}
function closeModal(type){document.getElementById(type+"Modal").classList.remove("active");}

async function saveItem(type){
  const body={full_name:document.getElementById(type+"_name").value,document_id:document.getElementById(type+"_extra").value};
  const res=await fetch("/api/"+type,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(res.ok){showToast(type+" creado correctamente","success");closeModal(type);fetchItems(type);}
  else{showToast("Error al crear "+type,"error");}
}

async function deleteItem(type,id){
  if(!confirm("Eliminar?"))return;
  await fetch("/api/"+type+"/"+id,{method:"DELETE"});
  showToast(type+" eliminado","success");
  fetchItems(type);
}

showDashboard();
</script>
</body>
</html>
`;
        return new Response(html,{headers:{"Content-Type":"text/html"}});
      }

      // =============================
      // API DASHBOARD
      // =============================
      if(url.pathname=="/api/dashboard"){
        const income=await env.DB.prepare("SELECT IFNULL(SUM(total_amount),0) as total FROM rentals WHERE DATE(created_at)=DATE('now')").first();
        const active=await env.DB.prepare("SELECT COUNT(*) as total FROM rentals WHERE status='active'").first();
        const boats=await env.DB.prepare("SELECT COUNT(*) as total FROM boats WHERE status='available'").first();
        const customers=await env.DB.prepare("SELECT COUNT(*) as total FROM customers").first();
        return json({income_today:income.total,active_rentals:active.total,available_boats:boats.total,total_customers:customers.total});
      }

      // CRUD APIs
      const entities=["customers","boats","rentals"];
      for(let i=0;i<entities.length;i++){
        const e=entities[i];
        if(url.pathname=="/api/"+e){
          if(request.method==="GET"){const all=await env.DB.prepare("SELECT * FROM "+e+" ORDER BY id DESC").all();return json(all.results||[]);}
          if(request.method==="POST"){const body=await request.json();await env.DB.prepare("INSERT INTO "+e+" (full_name,document_id) VALUES (?,?)").bind(body.full_name,body.document_id).run();return json({success:true});}
        }
        if(url.pathname.startsWith("/api/"+e+"/") && request.method==="DELETE"){const id=url.pathname.split("/").pop();await env.DB.prepare("DELETE FROM "+e+" WHERE id=?").bind(id).run();return json({success:true});}
      }

      return json({error:"Not Found"},404);

    }catch(err){
      return json({error:err.message},500);
    }

  }
};
