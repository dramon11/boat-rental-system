export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Solo respondemos a la ruta raíz con HTML
    if (url.pathname === "/" && request.method === "GET") {
      const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BoatERP - Sistema de Alquiler de Embarcaciones</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { 
      font-family:'Inter',sans-serif; 
      background:#f8fafc; 
      color:#1e293b; 
      line-height:1.5;
    }
    .sidebar {
      width:240px;
      height:100vh;
      background:#0f172a;
      color:#e2e8f0;
      position:fixed;
      padding:24px 16px;
      overflow-y:auto;
    }
    .sidebar h2 {
      margin-bottom:32px;
      font-size:1.5rem;
    }
    .menu-item {
      padding:12px 16px;
      border-radius:8px;
      margin-bottom:6px;
      cursor:pointer;
      transition:all .2s;
      display:flex;
      align-items:center;
      gap:12px;
    }
    .menu-item:hover { background:#1e293b; }
    .menu-item.active { background:#2563eb; color:white; }
    .header {
      margin-left:240px;
      height:68px;
      background:#1e40af;
      color:white;
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:0 32px;
      font-weight:600;
    }
    .content {
      margin-left:240px;
      padding:32px;
    }
    .card {
      background:white;
      padding:24px;
      border-radius:12px;
      box-shadow:0 4px 12px rgba(0,0,0,0.06);
      margin-bottom:24px;
    }
    .btn {
      padding:8px 16px;
      border:none;
      border-radius:6px;
      cursor:pointer;
      font-weight:500;
    }
    .btn-success { background:#22c55e; color:white; }
    .btn-danger { background:#ef4444; color:white; }
    .modal-overlay {
      display:none;
      position:fixed;
      inset:0;
      background:rgba(0,0,0,0.6);
      justify-content:center;
      align-items:center;
      z-index:1000;
    }
    .modal-overlay.active { display:flex; }
    .modal-content {
      background:white;
      border-radius:12px;
      width:520px;
      max-width:92vw;
      max-height:90vh;
      overflow-y:auto;
      padding:24px;
      box-shadow:0 10px 30px rgba(0,0,0,0.2);
    }
    .toast {
      position:fixed;
      bottom:24px;
      right:24px;
      padding:14px 24px;
      border-radius:8px;
      color:white;
      opacity:0;
      transform:translateY(20px);
      transition:all .4s;
      z-index:2000;
    }
    .toast.show {
      opacity:1;
      transform:translateY(0);
    }
    .toast.success { background:#22c55e; }
    .toast.error { background:#ef4444; }
    table {
      width:100%;
      border-collapse:collapse;
    }
    th, td {
      padding:12px 16px;
      text-align:left;
      border-bottom:1px solid #e5e7eb;
    }
    th { background:#f1f5f9; font-weight:600; }
  </style>
</head>
<body>

<div class="sidebar">
  <h2>⚓ BoatERP</h2>
  <div class="menu-item active" onclick="showSection('dashboard')">Dashboard</div>
  <div class="menu-item" onclick="showSection('customers')">Clientes</div>
  <div class="menu-item" onclick="showSection('boats')">Botes</div>
  <div class="menu-item" onclick="showSection('reservations')">Reservas</div>
  <div class="menu-item" onclick="showSection('invoices')">Facturación</div>
</div>

<div class="header">
  <div>Panel de Gestión de Alquiler de Embarcaciones</div>
  <div>Administrador</div>
</div>

<div class="content" id="mainContent">
  <h2>Cargando...</h2>
</div>

<!-- Modal reutilizable -->
<div id="modalOverlay" class="modal-overlay">
  <div class="modal-content">
    <h3 id="modalTitle">Título del modal</h3>
    <div id="modalBody">Contenido aquí...</div>
    <div style="text-align:right; margin-top:24px;">
      <button class="btn" onclick="closeModal()">Cancelar</button>
      <button class="btn-success" id="modalSave">Guardar</button>
    </div>
  </div>
</div>

<div id="toast"></div>

<script>
  function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';
    setTimeout(() => {
      toast.className = 'toast';
    }, 4000);
  }

  function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
  }

  function showSection(section) {
    // Cambiar clase active en menú
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
      if (item.textContent.includes(section.charAt(0).toUpperCase() + section.slice(1))) {
        item.classList.add('active');
      }
    });

    const content = document.getElementById('mainContent');

    if (section === 'dashboard') {
      content.innerHTML = \`
        <h2>Dashboard</h2>
        <div class="card">
          <h3>Bienvenido al sistema</h3>
          <p>Resumen general del negocio.</p>
          <button class="btn-success" onclick="showToast('¡Dashboard cargado correctamente!', 'success')">
            Probar notificación
          </button>
        </div>
      \`;
    } 
    else if (section === 'customers') {
      content.innerHTML = \`
        <h2>Clientes</h2>
        <div class="card">
          <p>Gestión de clientes registrados.</p>
          <button class="btn-success" onclick="showModal('Nuevo Cliente')">
            + Nuevo Cliente
          </button>
        </div>
        <div class="card">Lista de clientes aparecerá aquí...</div>
      \`;
    } 
    else if (section === 'boats') {
      content.innerHTML = \`
        <h2>Botes / Embarcaciones</h2>
        <div class="card">
          <p>Registro y estado de las embarcaciones.</p>
          <button class="btn-success" onclick="showModal('Nuevo Bote')">
            + Nuevo Bote
          </button>
        </div>
      \`;
    } 
    else if (section === 'reservations') {
      content.innerHTML = \`
        <h2>Reservas</h2>
        <div class="card">
          <p>Control de reservas activas y pasadas.</p>
          <button class="btn-success" onclick="showModal('Nueva Reserva')">
            + Nueva Reserva
          </button>
        </div>
        <div class="card">Aquí aparecerán las reservas...</div>
      \`;
    } 
    else if (section === 'invoices') {
      content.innerHTML = \`
        <h2>Facturación</h2>
        <div class="card">
          <p>Registro y control de cobros.</p>
          <button class="btn-success" onclick="showModal('Nueva Factura')">
            + Nueva Factura
          </button>
        </div>
      \`;
    }
  }

  function showModal(title) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = \`
      <p>Formulario para crear/editar <strong>\${title}</strong></p>
      <p>(Aquí irá el formulario correspondiente)</p>
    \`;
    document.getElementById('modalOverlay').classList.add('active');
  }

  // Cargar dashboard al inicio
  document.addEventListener('DOMContentLoaded', () => {
    showSection('dashboard');
  });
</script>
</body>
</html>
      `;
      return new Response(html, {
        headers: { "Content-Type": "text/html;charset=UTF-8" }
      });
    }

    // Cualquier otra ruta → 404
    return new Response("Ruta no encontrada", { status: 404 });
  }
};
