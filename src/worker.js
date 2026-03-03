export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    });

    try {
      if (url.pathname === "/" && request.method === "GET") {
        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BoatERP - Completo y Funcional</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; background:#f8fafc; color:#1e293b; }
    .sidebar { width:240px; height:100vh; background:#0f172a; color:#e2e8f0; position:fixed; padding:24px 16px; overflow-y:auto; }
    .sidebar h2 { margin-bottom:32px; font-size:1.5rem; }
    .menu-item { padding:12px 16px; border-radius:8px; margin-bottom:6px; cursor:pointer; transition:all .2s; display:flex; align-items:center; gap:12px; }
    .menu-item:hover { background:#1e293b; }
    .menu-item.active { background:#2563eb; color:white; }
    .header { margin-left:240px; height:68px; background:#1e40af; color:white; display:flex; align-items:center; justify-content:space-between; padding:0 32px; font-weight:600; }
    .content { margin-left:240px; padding:32px; }
    .card { background:white; padding:24px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.06); margin-bottom:24px; }
    .data-table { width:100%; border-collapse:collapse; }
    .data-table th, .data-table td { padding:12px 16px; text-align:left; border-bottom:1px solid #e2e8f0; }
    .data-table th { background:#f8fafc; font-weight:600; color:#475569; }
    .btn { padding:8px 16px; border:none; border-radius:6px; cursor:pointer; font-weight:500; margin-right:8px; }
    .btn-success { background:#22c55e; color:white; }
    .btn-danger { background:#ef4444; color:white; }
    .btn-outline { border:1px solid #cbd5e1; background:transparent; }
    .modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); justify-content:center; align-items:center; z-index:1000; }
    .modal-overlay.active { display:flex; }
    .modal-content { background:white; border-radius:12px; width:560px; max-width:92vw; max-height:90vh; overflow-y:auto; padding:24px; box-shadow:0 10px 30px rgba(0,0,0,0.2); }
    .toast { position:fixed; bottom:24px; right:24px; padding:14px 24px; border-radius:8px; color:white; opacity:0; transition:all .4s; z-index:2000; }
    .toast.show { opacity:1; }
    .toast.success { background:#22c55e; }
    .toast.error { background:#ef4444; }
    .form-group { margin-bottom:16px; }
    .form-group label { display:block; margin-bottom:6px; color:#475569; font-weight:500; }
  </style>
</head>
<body>

<div class="sidebar">
  <h2>⚓ BoatERP</h2>
  <div class="menu-item active" onclick="loadSection('dashboard')">Dashboard</div>
  <div class="menu-item" onclick="loadSection('customers')">Clientes</div>
  <div class="menu-item" onclick="loadSection('boats')">Botes</div>
  <div class="menu-item" onclick="loadSection('reservations')">Reservas</div>
  <div class="menu-item" onclick="loadSection('invoices')">Facturación</div>
</div>

<div class="header">
  <div>Panel Administrativo - Alquiler de Embarcaciones</div>
  <div>Admin</div>
</div>

<div class="content" id="mainContent"></div>

<!-- Modal reutilizable -->
<div id="modalOverlay" class="modal-overlay">
  <div class="modal-content">
    <h3 id="modalTitle">Modal</h3>
    <div id="modalBody"></div>
    <div style="text-align:right; margin-top:24px;">
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn-success" onclick="saveModal()">Guardar</button>
    </div>
  </div>
</div>

<div id="toast"></div>

<script>
  let currentSection = 'dashboard';

  function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast ' + type + ' show';
    setTimeout(() => t.className = 'toast', 4000);
  }

  function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
  }

  function showModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modalOverlay').classList.add('active');
  }

  function saveModal() {
    showToast("Acción guardada (simulada)", "success");
    closeModal();
  }

  function loadSection(section) {
    currentSection = section;
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    const active = document.querySelector(\`.menu-item[onclick="loadSection('\${section}')"]\`);
    if (active) active.classList.add('active');

    const content = document.getElementById('mainContent');
    content.innerHTML = '<h2>' + section.charAt(0).toUpperCase() + section.slice(1) + '</h2>';

    if (section === 'dashboard') {
      content.innerHTML += \`
        <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:20px;">
          <div class="card"><h4>Ingresos Hoy</h4><h2>$0.00</h2></div>
          <div class="card"><h4>Reservas Activas</h4><h2>0</h2></div>
          <div class="card"><h4>Botes Disponibles</h4><h2>0</h2></div>
          <div class="card"><h4>Total Clientes</h4><h2>0</h2></div>
        </div>
      \`;
    } else if (section === 'customers') {
      content.innerHTML += \`
        <div style="margin-bottom:16px;">
          <button class="btn-success" onclick="showModal('Nuevo Cliente', '<div class=\\'form-group\\'><label>Nombre *</label><input id=\\'custName\\' required></div><div class=\\'form-group\\'><label>Documento</label><input id=\\'custDoc\\'></div>')">+ Nuevo Cliente</button>
        </div>
        <div class="card">Lista de clientes (simulada)</div>
      \`;
    } else if (section === 'boats') {
      content.innerHTML += \`
        <div style="margin-bottom:16px;">
          <button class="btn-success" onclick="showModal('Nuevo Bote', '<div class=\\'form-group\\'><label>Nombre *</label><input required></div><div class=\\'form-group\\'><label>Precio/hora</label><input type=\\'number\\' step=\\'0.01\\'></div>')">+ Nuevo Bote</button>
        </div>
      \`;
    } else if (section === 'reservations') {
      content.innerHTML += \`
        <div style="margin-bottom:16px;">
          <button class="btn-success" onclick="showModal('Nueva Reserva', '<div class=\\'form-group\\'><label>Cliente *</label><select required><option>Cliente 1</option></select></div><div class=\\'form-group\\'><label>Fecha inicio</label><input type=\\'datetime-local\\' required></div>')">+ Nueva Reserva</button>
        </div>
      \`;
    } else if (section === 'invoices') {
      content.innerHTML += \`
        <div style="margin-bottom:16px;">
          <button class="btn-success" onclick="showModal('Nueva Factura', '<div class=\\'form-group\\'><label>Total</label><input type=\\'number\\'></div>')">+ Nueva Factura</button>
        </div>
      \`;
    }
  }

  // Inicio
  document.addEventListener('DOMContentLoaded', () => {
    loadSection('dashboard');
  });
</script>
</body>
</html>`;
        return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
      }

      return new Response("404 Not Found", { status: 404 });
    } catch (err) {
      return new Response("Error interno: " + err.message, { status: 500 });
    }
  }
};
