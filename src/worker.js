addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // Servir página principal
  if (url.pathname === "/" || url.pathname === "/index" || url.pathname === "/index.html") {
    return new Response(getHTML(), {
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }

  // API de clientes
  if (url.pathname === "/api/customers" || url.pathname.startsWith("/api/customers/")) {
    // ────────────────────────────────────────────
    // GET    /api/customers          → lista todos
    // GET    /api/customers/123      → obtiene uno (opcional)
    // POST   /api/customers          → crea
    // PUT    /api/customers/123      → actualiza
    // DELETE /api/customers/123      → elimina
    // ────────────────────────────────────────────

    if (request.method === "GET") {
      // Aquí conectarías tu base de datos real (D1, KV, DO, PostgreSQL via TCP, etc)
      // Por ahora devolvemos array vacío o datos de prueba
      const fakeData = [
        // { id: 1, name: "Juan Pérez", document_id: "40212345678", phone: "809-555-1234" },
      ];
      return Response.json(fakeData);
    }

    if (request.method === "POST") {
      try {
        const data = await request.json();
        // Aquí INSERT en tu base de datos
        // Ejemplo: await env.DB.prepare("INSERT INTO customers ...").bind(...).run();
        console.log("Creando cliente:", data);
        return Response.json({ success: true, message: "Cliente creado" }, { status: 201 });
      } catch (err) {
        return Response.json({ error: "Error al crear cliente" }, { status: 400 });
      }
    }

    if (request.method === "PUT" || request.method === "DELETE") {
      const id = url.pathname.split("/").pop();
      if (!id || isNaN(id)) {
        return Response.json({ error: "ID inválido" }, { status: 400 });
      }

      if (request.method === "PUT") {
        try {
          const data = await request.json();
          // Aquí UPDATE en base de datos WHERE id = ?
          console.log("Actualizando cliente", id, data);
          return Response.json({ success: true, message: "Cliente actualizado" });
        } catch (err) {
          return Response.json({ error: "Error al actualizar" }, { status: 400 });
        }
      }

      if (request.method === "DELETE") {
        // Aquí DELETE FROM customers WHERE id = ?
        console.log("Eliminando cliente", id);
        return Response.json({ success: true, message: "Cliente eliminado" });
      }
    }
  }

  return new Response("Not Found", { status: 404 });
}

// ────────────────────────────────────────
//                 FRONTEND HTML
// ────────────────────────────────────────
function getHTML() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ERP Alquiler de Botes</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body{font-family:system-ui,sans-serif;margin:0;background:#f5f5f5;color:#333;}
    .container{max-width:1400px;margin:0 auto;padding:16px;}
    .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:24px;}
    .card{background:white;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center;}
    .card h4{margin:0 0 8px;color:#555;font-weight:500;}
    .card h2{margin:0;font-size:2.1rem;}
    h2{margin:0 0 16px;}
    .actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:16px;}
    .btn{padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-weight:500;}
    .btn-primary{background:#0d6efd;color:white;}
    .btn-success{background:#198754;color:white;}
    .btn-danger{background:#dc3545;color:white;}
    .btn-outline{background:transparent;border:1px solid #ccc;}
    input{padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:1rem;}
    table{width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
    th,td{padding:12px;text-align:left;}
    th{background:#f1f3f5;font-weight:600;color:#444;}
    tr:nth-child(even){background:#fafafa;}
    .modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);justify-content:center;align-items:center;z-index:1000;}
    .modal-content{background:white;padding:24px;border-radius:12px;width:100%;max-width:420px;}
    .modal-content input{width:100%;margin:8px 0;padding:10px;box-sizing:border-box;}
    .modal-buttons{display:flex;gap:12px;margin-top:20px;}
  </style>
</head>
<body>

<div class="container">
  <div class="actions">
    <button class="btn btn-primary" onclick="showDashboard()">Dashboard</button>
    <button class="btn btn-primary" onclick="loadCustomers()">Clientes</button>
  </div>

  <!-- Dashboard -->
  <div id="dashboard" style="display:block;">
    <div class="cards">
      <div class="card"><h4>Ingresos Hoy</h4><h2 id="income">$0</h2></div>
      <div class="card"><h4>Alquileres Activos</h4><h2 id="active">0</h2></div>
      <div class="card"><h4>Botes Disponibles</h4><h2 id="boats">0</h2></div>
      <div class="card"><h4>Total Clientes</h4><h2 id="customers">0</h2></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(380px,1fr));gap:16px;">
      <div style="background:white;padding:16px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <h4>Resumen General (Barras)</h4>
        <canvas id="barChart"></canvas>
      </div>
      <div style="background:white;padding:16px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <h4>Tendencia (Línea)</h4>
        <canvas id="lineChart"></canvas>
      </div>
      <div style="background:white;padding:16px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);grid-column:1/-1;">
        <h4>Distribución (Pie)</h4>
        <canvas id="pieChart"></canvas>
      </div>
    </div>
  </div>

  <!-- Módulo Clientes -->
  <div id="customersModule" style="display:none;">
    <div class="actions" style="justify-content:space-between;">
      <h2>Clientes</h2>
      <div style="display:flex;gap:12px;align-items:center;">
        <input id="searchInput" placeholder="Buscar cliente..." style="min-width:220px;">
        <button class="btn btn-success" onclick="openCustomerModal()">+ Nuevo Cliente</button>
      </div>
    </div>
    <div id="customerTable">Cargando clientes...</div>
  </div>
</div>

<!-- Modal -->
<div id="customerModal" class="modal">
  <div class="modal-content">
    <h3 id="modalTitle">Nuevo Cliente</h3>
    <input id="customerName"    placeholder="Nombre completo" required>
    <input id="customerDoc"     placeholder="Cédula / RNC / Pasaporte" required>
    <input id="customerPhone"   placeholder="Teléfono (WhatsApp preferido)">
    <div class="modal-buttons">
      <button class="btn btn-success" onclick="saveCustomer()">Guardar</button>
      <button class="btn btn-outline" onclick="closeCustomerModal()">Cancelar</button>
    </div>
  </div>
</div>

<script>
// ──────────────── Variables globales ────────────────
let editingId = null;

// ──────────────── Navegación ────────────────
function showDashboard() {
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('customersModule').style.display = 'none';
}

async function loadCustomers() {
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('customersModule').style.display = 'block';
  await fetchCustomers();
}

// ──────────────── CRUD Clientes ────────────────
async function fetchCustomers() {
  try {
    const res = await fetch('/api/customers');
    if (!res.ok) throw new Error('Error de red');
    const data = await res.json();
    renderCustomerTable(data);
  } catch (err) {
    document.getElementById('customerTable').innerHTML = '<p style="color:red">No se pudieron cargar los clientes</p>';
  }
}

function renderCustomerTable(customers) {
  const container = document.getElementById('customerTable');
  if (customers.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#777;padding:40px;">No hay clientes registrados aún</p>';
    return;
  }

  let html = '<table><thead><tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th style="width:140px">Acciones</th></tr></thead><tbody>';
  for (const c of customers) {
    html += \`<tr>
      <td>\${c.name || ''}</td>
      <td>\${c.document_id || ''}</td>
      <td>\${c.phone || '—'}</td>
      <td>
        <button class="btn btn-primary" style="font-size:0.85rem;padding:4px 10px;" onclick="editCustomer(\${c.id})">Editar</button>
        <button class="btn btn-danger"  style="font-size:0.85rem;padding:4px 10px;" onclick="deleteCustomer(\${c.id})">Eliminar</button>
      </td>
    </tr>\`;
  }
  html += '</tbody></table>';
  container.innerHTML = html;
}

function openCustomerModal(isEdit = false) {
  document.getElementById('customerModal').style.display = 'flex';
  document.getElementById('modalTitle').textContent = isEdit ? 'Editar Cliente' : 'Nuevo Cliente';
  if (!isEdit) {
    document.getElementById('customerName').value = '';
    document.getElementById('customerDoc').value = '';
    document.getElementById('customerPhone').value = '';
    editingId = null;
  }
}

function closeCustomerModal() {
  document.getElementById('customerModal').style.display = 'none';
}

async function editCustomer(id) {
  try {
    const res = await fetch('/api/customers');
    const customers = await res.json();
    const customer = customers.find(c => c.id === id);
    if (!customer) return alert('Cliente no encontrado');

    document.getElementById('customerName').value  = customer.name    || '';
    document.getElementById('customerDoc').value   = customer.document_id || '';
    document.getElementById('customerPhone').value = customer.phone   || '';
    editingId = id;
    openCustomerModal(true);
  } catch (err) {
    alert('No se pudo cargar la información del cliente');
  }
}

async function saveCustomer() {
  const name   = document.getElementById('customerName').value.trim();
  const doc    = document.getElementById('customerDoc').value.trim();
  const phone  = document.getElementById('customerPhone').value.trim();

  if (!name || !doc) {
    alert('Nombre y documento son obligatorios');
    return;
  }

  const payload = { name, document_id: doc, phone };

  try {
    let res;
    if (editingId) {
      // UPDATE
      res = await fetch(\`/api/customers/\${editingId}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      // CREATE
      res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (!res.ok) throw new Error('Error en el servidor');
    closeCustomerModal();
    await fetchCustomers(); // refrescar tabla
  } catch (err) {
    alert('No se pudo guardar el cliente');
  }
}

async function deleteCustomer(id) {
  if (!confirm('¿Realmente deseas eliminar este cliente?')) return;

  try {
    const res = await fetch(\`/api/customers/\${id}\`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar');
    await fetchCustomers();
  } catch (err) {
    alert('No se pudo eliminar el cliente');
  }
}

// ──────────────── Gráficos de ejemplo ────────────────
function initCharts() {
  new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: ['Ene','Feb','Mar','Abr','May','Jun'],
      datasets: [{ label: 'Ingresos', data: [12000,19500,14000,22000,18000,25000], backgroundColor: '#198754' }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  new Chart(document.getElementById('lineChart'), {
    type: 'line',
    data: {
      labels: ['Ene','Feb','Mar','Abr','May','Jun'],
      datasets: [{ label: 'Alquileres', data: [8,14,11,18,15,22], borderColor: '#0d6efd', tension: 0.3 }]
    },
    options: { responsive: true }
  });

  new Chart(document.getElementById('pieChart'), {
    type: 'pie',
    data: {
      labels: ['Disponibles', 'Alquilados', 'Mantenimiento'],
      datasets: [{ data: [12,5,2], backgroundColor: ['#198754','#dc3545','#ffc107'] }]
    },
    options: { responsive: true }
  });
}

// Inicio
window.addEventListener('load', () => {
  initCharts();
  // Opcional: loadCustomers(); si quieres que inicie en clientes
});
</script>
</body>
</html>`;
}
