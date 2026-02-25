// worker.js  ──  Formato ES Modules (requerido para D1)

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // ────────────────────────────────────────────────
    //                PÁGINA PRINCIPAL (HTML)
    // ────────────────────────────────────────────────
    if (pathname === "/" || pathname === "/index" || pathname === "/index.html") {
      return new Response(getHTML(), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // ────────────────────────────────────────────────
    //                     API /clientes
    // ────────────────────────────────────────────────
    if (pathname === "/api/customers" || pathname.startsWith("/api/customers/")) {
      const pathParts = pathname.split("/");
      const id = pathParts.length > 3 && !isNaN(pathParts[3]) ? pathParts[3] : null;

      // GET ── Lista todos los clientes
      if (request.method === "GET") {
        try {
          let query = "SELECT * FROM customers";
          let params = [];

          if (id) {
            query += " WHERE id = ?";
            params.push(id);
          } else {
            query += " ORDER BY id DESC";
          }

          const { results } = await env.DB.prepare(query)
            .bind(...params)
            .all();

          return Response.json(results || (id ? null : []));
        } catch (err) {
          console.error("Error GET customers:", err);
          return Response.json({ error: "Error al obtener clientes" }, { status: 500 });
        }
      }

      // POST ── Crear cliente nuevo
      if (request.method === "POST" && !id) {
        try {
          const body = await request.json();
          const { name, document_id, phone } = body;

          if (!name || !document_id) {
            return Response.json(
              { error: "Los campos 'name' y 'document_id' son obligatorios" },
              { status: 400 }
            );
          }

          const result = await env.DB.prepare(
            "INSERT INTO customers (name, document_id, phone) VALUES (?, ?, ?)"
          )
            .bind(name.trim(), document_id.trim(), phone?.trim() || null)
            .run();

          return Response.json(
            { success: true, id: result.meta.last_row_id },
            { status: 201 }
          );
        } catch (err) {
          console.error("Error POST customer:", err);
          return Response.json({ error: "Error al crear cliente" }, { status: 500 });
        }
      }

      // PUT ── Actualizar cliente existente
      if (request.method === "PUT" && id) {
        try {
          const body = await request.json();
          const { name, document_id, phone } = body;

          if (!name && !document_id && !phone) {
            return Response.json({ error: "Nada que actualizar" }, { status: 400 });
          }

          let query = "UPDATE customers SET ";
          const values = [];
          const params = [];

          if (name !== undefined) {
            values.push("name = ?");
            params.push(name.trim());
          }
          if (document_id !== undefined) {
            values.push("document_id = ?");
            params.push(document_id.trim());
          }
          if (phone !== undefined) {
            values.push("phone = ?");
            params.push(phone?.trim() || null);
          }

          query += values.join(", ") + " WHERE id = ?";
          params.push(id);

          const { meta } = await env.DB.prepare(query).bind(...params).run();

          if (meta.changes === 0) {
            return Response.json({ error: "Cliente no encontrado" }, { status: 404 });
          }

          return Response.json({ success: true });
        } catch (err) {
          console.error("Error PUT customer:", err);
          return Response.json({ error: "Error al actualizar" }, { status: 500 });
        }
      }

      // DELETE ── Eliminar cliente
      if (request.method === "DELETE" && id) {
        try {
          const { meta } = await env.DB.prepare("DELETE FROM customers WHERE id = ?")
            .bind(id)
            .run();

          if (meta.changes === 0) {
            return Response.json({ error: "Cliente no encontrado" }, { status: 404 });
          }

          return Response.json({ success: true });
        } catch (err) {
          console.error("Error DELETE customer:", err);
          return Response.json({ error: "Error al eliminar" }, { status: 500 });
        }
      }
    }

    // 404 para todo lo demás
    return new Response("Not Found", { status: 404 });
  },
};

// ────────────────────────────────────────────────
//               HTML embebido (frontend)
// ────────────────────────────────────────────────
function getHTML() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ERP Alquiler de Botes</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body{font-family:system-ui,sans-serif;margin:0;background:#f8f9fa;color:#212529;}
    .container{max-width:1400px;margin:0 auto;padding:1.5rem;}
    .nav-buttons{display:flex;gap:1rem;margin-bottom:1.5rem;}
    .btn{padding:0.5rem 1rem;border:none;border-radius:0.375rem;cursor:pointer;font-weight:500;}
    .btn-primary{background:#0d6efd;color:white;}
    .btn-success{background:#198754;color:white;}
    .btn-danger{background:#dc3545;color:white;}
    .btn-outline{border:1px solid #6c757d;color:#6c757d;background:transparent;}
    .card{background:white;border-radius:0.5rem;box-shadow:0 0.125rem 0.25rem rgba(0,0,0,0.075);padding:1.25rem;margin-bottom:1rem;}
    .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;}
    table{width:100%;border-collapse:collapse;background:white;border-radius:0.5rem;overflow:hidden;}
    th,td{padding:0.75rem;text-align:left;}
    th{background:#e9ecef;font-weight:600;}
    tr:nth-child(even){background:#f8f9fa;}
    .modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);justify-content:center;align-items:center;z-index:1000;}
    .modal-content{background:white;padding:1.5rem;border-radius:0.5rem;width:100%;max-width:450px;}
    .modal-content input{width:100%;padding:0.5rem;margin:0.5rem 0;box-sizing:border-box;border:1px solid #ced4da;border-radius:0.375rem;}
    .modal-buttons{display:flex;gap:1rem;margin-top:1.25rem;}
  </style>
</head>
<body>

<div class="container">
  <div class="nav-buttons">
    <button class="btn btn-primary" onclick="showDashboard()">Dashboard</button>
    <button class="btn btn-primary" onclick="loadCustomers()">Clientes</button>
  </div>

  <div id="dashboard" style="display:block;">
    <div class="cards">
      <div class="card"><h5>Ingresos Hoy</h5><h3 id="income">$0</h3></div>
      <div class="card"><h5>Alquileres Activos</h5><h3 id="active">0</h3></div>
      <div class="card"><h5>Botes Disponibles</h5><h3 id="boats">0</h3></div>
      <div class="card"><h5>Total Clientes</h5><h3 id="customers">0</h3></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:1.5rem;margin-top:1.5rem;">
      <div class="card"><h5>Resumen Ingresos</h5><canvas id="barChart"></canvas></div>
      <div class="card"><h5>Tendencia Alquileres</h5><canvas id="lineChart"></canvas></div>
      <div class="card" style="grid-column:1/-1;"><h5>Distribución Estado Botes</h5><canvas id="pieChart"></canvas></div>
    </div>
  </div>

  <div id="customersModule" style="display:none;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
      <h2>Clientes</h2>
      <div style="display:flex;gap:0.75rem;">
        <input id="searchInput" placeholder="Buscar..." style="padding:0.5rem;border:1px solid #ced4da;border-radius:0.375rem;">
        <button class="btn btn-success" onclick="openCustomerModal()">+ Nuevo Cliente</button>
      </div>
    </div>
    <div id="customerTable" class="card">Cargando clientes...</div>
  </div>
</div>

<!-- Modal -->
<div id="customerModal" class="modal">
  <div class="modal-content">
    <h4 id="modalTitle">Nuevo Cliente</h4>
    <input id="customerName" placeholder="Nombre completo" required>
    <input id="customerDoc" placeholder="Cédula / RNC / Pasaporte" required>
    <input id="customerPhone" placeholder="Teléfono">
    <div class="modal-buttons">
      <button class="btn btn-success" onclick="saveCustomer()">Guardar</button>
      <button class="btn btn-outline" onclick="closeCustomerModal()">Cancelar</button>
    </div>
  </div>
</div>

<script>
let editingId = null;

function showDashboard() {
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('customersModule').style.display = 'none';
}

async function loadCustomers() {
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('customersModule').style.display = 'block';
  await fetchCustomers();
}

async function fetchCustomers() {
  try {
    const res = await fetch('/api/customers');
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    renderCustomerTable(data);
  } catch (e) {
    document.getElementById('customerTable').innerHTML = '<p style="color:#dc3545">Error al cargar clientes</p>';
  }
}

function renderCustomerTable(customers) {
  const el = document.getElementById('customerTable');
  if (!customers?.length) {
    el.innerHTML = '<p style="text-align:center;padding:2rem;color:#6c757d;">No hay clientes registrados</p>';
    return;
  }

  let html = '<table><thead><tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th style="width:130px">Acciones</th></tr></thead><tbody>';
  for (const c of customers) {
    html += \`<tr>
      <td>\${(c.name||'').replace(/</g,'&lt;')}</td>
      <td>\${(c.document_id||'').replace(/</g,'&lt;')}</td>
      <td>\${c.phone || '—'}</td>
      <td>
        <button class="btn btn-primary" style="font-size:0.85rem;padding:0.35rem 0.65rem;" onclick="editCustomer(\${c.id})">Editar</button>
        <button class="btn btn-danger"  style="font-size:0.85rem;padding:0.35rem 0.65rem;" onclick="deleteCustomer(\${c.id})">Eliminar</button>
      </td>
    </tr>\`;
  }
  html += '</tbody></table>';
  el.innerHTML = html;
}

function openCustomerModal(edit = false) {
  document.getElementById('customerModal').style.display = 'flex';
  document.getElementById('modalTitle').textContent = edit ? 'Editar Cliente' : 'Nuevo Cliente';
  if (!edit) {
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
    const list = await res.json();
    const c = list.find(x => x.id === id);
    if (!c) return alert('Cliente no encontrado');

    document.getElementById('customerName').value  = c.name    || '';
    document.getElementById('customerDoc').value   = c.document_id || '';
    document.getElementById('customerPhone').value = c.phone   || '';
    editingId = id;
    openCustomerModal(true);
  } catch {
    alert('No se pudo cargar el cliente');
  }
}

async function saveCustomer() {
  const name  = document.getElementById('customerName').value.trim();
  const doc   = document.getElementById('customerDoc').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();

  if (!name || !doc) {
    alert('Nombre y documento son obligatorios');
    return;
  }

  const payload = { name, document_id: doc, phone: phone || null };

  try {
    const url = editingId ? \`/api/customers/\${editingId}\` : '/api/customers';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(await res.text());
    closeCustomerModal();
    await fetchCustomers();
  } catch (err) {
    alert('Error al guardar: ' + err.message);
  }
}

async function deleteCustomer(id) {
  if (!confirm('¿Eliminar este cliente permanentemente?')) return;

  try {
    const res = await fetch(\`/api/customers/\${id}\`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    await fetchCustomers();
  } catch {
    alert('No se pudo eliminar el cliente');
  }
}

// Gráficos de ejemplo
function initCharts() {
  new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: { labels: ['Ene','Feb','Mar','Abr'], datasets: [{label:'Ingresos',data:[12000,18500,14000,23000],backgroundColor:'#198754'}] },
    options: { responsive: true, plugins: { legend: {display:false} } }
  });

  new Chart(document.getElementById('lineChart'), {
    type: 'line',
    data: { labels: ['Ene','Feb','Mar','Abr'], datasets: [{label:'Alquileres',data:[7,13,10,19],borderColor:'#0d6efd',tension:0.3}] },
    options: { responsive: true }
  });

  new Chart(document.getElementById('pieChart'), {
    type: 'pie',
    data: { labels: ['Disponibles','Alquilados','Mantenimiento'], datasets: [{data:[14,6,3],backgroundColor:['#198754','#dc3545','#ffc107']}] },
    options: { responsive: true }
  });
}

window.addEventListener('load', () => {
  initCharts();
  // loadCustomers();  // descomenta si quieres iniciar en la lista de clientes
});
</script>
</body>
</html>`;
}
