<script>
  let editingCustomerId = null;
  let editingBoatId = null;
  let editingReservationId = null;
  let editingInvoiceId = null;
  let charts = {};

  // Dashboard (ya funciona, lo dejamos casi igual)
  const dashboardHTML = \`
    <div id="dashboard">
      <div class="cards">
        <div class="card"><h4>Ingresos Hoy</h4><h2 id="income">$0</h2></div>
        <div class="card"><h4>Reservas Activas</h4><h2 id="active">0</h2></div>
        <div class="card"><h4>Botes Disponibles</h4><h2 id="boats">0</h2></div>
        <div class="card"><h4>Total Clientes</h4><h2 id="customers">0</h2></div>
      </div>
      <div class="charts">
        <div class="chart-box"><h4>Resumen General (Barras)</h4><div class="chart-container"><canvas id="barChart"></canvas></div></div>
        <div class="chart-box"><h4>Tendencia (Línea)</h4><div class="chart-container"><canvas id="lineChart"></canvas></div></div>
        <div class="chart-box full-width"><h4>Distribución (Pie)</h4><div class="chart-container"><canvas id="pieChart"></canvas></div></div>
      </div>
    </div>
  \`;

  async function loadDashboard() {
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    document.querySelector('.menu-item[onclick="loadDashboard()"]').classList.add('active');
    document.getElementById("mainContent").innerHTML = dashboardHTML;

    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error(\`Status \${res.status}\`);
      const data = await res.json();

      document.getElementById("income").innerText = "$" + (data.income_today ?? 0).toFixed(2);
      document.getElementById("active").innerText = data.active_rentals ?? 0;
      document.getElementById("boats").innerText = data.available_boats ?? 0;
      document.getElementById("customers").innerText = data.total_customers ?? 0;

      const values = [data.income_today ?? 0, data.active_rentals ?? 0, data.available_boats ?? 0, data.total_customers ?? 0];
      const labels = ["Ingresos Hoy", "Reservas Activas", "Botes Disponibles", "Clientes"];
      const opts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

      charts.bar = new Chart(document.getElementById("barChart"), { type: 'bar', data: { labels, datasets: [{ data: values, backgroundColor: ['#3b82f6','#10b981','#f59e0b','#8b5cf6'] }] }, options: opts });
      charts.line = new Chart(document.getElementById("lineChart"), { type: 'line', data: { labels, datasets: [{ data: values, tension: 0.4, borderColor: '#3b82f6' }] }, options: opts });
      charts.pie = new Chart(document.getElementById("pieChart"), { type: 'pie', data: { labels, datasets: [{ data: values, backgroundColor: ['#3b82f6','#10b981','#f59e0b','#8b5cf6'] }] }, options: { ...opts, plugins: { legend: { position: 'right' } } } });
    } catch (err) {
      console.error("Dashboard error:", err);
      showToast("Error cargando dashboard", "error");
    }
  }

  function showToast(msg, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.className = \`toast \${type} show\`;
    setTimeout(() => toast.className = "toast", 3500);
  }

  // ────────────────────────────────────────────────
  // Clientes (completando las funciones que faltaban)
  // ────────────────────────────────────────────────
  async function loadCustomers() {
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    document.querySelector('.menu-item[onclick="loadCustomers()"]').classList.add('active');
    const container = document.getElementById('mainContent');
    container.innerHTML = \`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <h2>Clientes</h2>
        <div>
          <input id="searchInput" class="input-search" placeholder="Buscar por nombre o documento..." />
          <button class="btn-success" onclick="openCustomerModal()">+ Nuevo Cliente</button>
        </div>
      </div>
      <div class="card"><div id="customerTable">Cargando clientes...</div></div>
    \`;
    await fetchCustomers();
  }

  async function fetchCustomers() {
    try {
      const res = await fetch('/api/customers');
      if (!res.ok) throw new Error();
      const data = await res.json();
      renderCustomerTable(data);
      document.getElementById("searchInput").addEventListener("input", e => {
        const val = e.target.value.toLowerCase();
        const filtered = data.filter(c =>
          (c.full_name || '').toLowerCase().includes(val) ||
          (c.document_id || '').toLowerCase().includes(val)
        );
        renderCustomerTable(filtered);
      });
    } catch {
      document.getElementById("customerTable").innerHTML = "<p>Error cargando clientes.</p>";
    }
  }

  function renderCustomerTable(data) {
    const el = document.getElementById("customerTable");
    if (!data || data.length === 0) { el.innerHTML = "<p>No hay clientes.</p>"; return; }
    let html = '<table class="data-table"><thead><tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead><tbody>';
    data.forEach(c => {
      html += \`<tr data-id="\${c.id}">
        <td>\${c.full_name || ''}</td>
        <td>\${c.document_id || ''}</td>
        <td>\${c.phone || '-'}</td>
        <td>\${c.email || '-'}</td>
        <td>
          <button class="btn btn-success" onclick="editCustomer(this)">Editar</button>
          <button class="btn btn-danger" onclick="deleteCustomer(\${c.id})">Eliminar</button>
        </td>
      </tr>\`;
    });
    html += '</tbody></table>';
    el.innerHTML = html;
  }

  function openCustomerModal() {
    editingCustomerId = null;
    document.getElementById("modalTitle").textContent = "Nuevo Cliente";
    document.getElementById("name").value = "";
    document.getElementById("doc").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("email").value = "";
    document.getElementById("customerModal").classList.add("active");
  }

  function closeCustomerModal() {
    document.getElementById("customerModal").classList.remove("active");
  }

  async function saveCustomer() {
    const body = {
      full_name: document.getElementById("name").value.trim(),
      document_id: document.getElementById("doc").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      email: document.getElementById("email").value.trim()
    };
    if (!body.full_name) return showToast("Nombre es obligatorio", "error");

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error();
      showToast("Cliente creado", "success");
      closeCustomerModal();
      loadCustomers();
    } catch (err) {
      showToast("Error al guardar cliente", "error");
    }
  }

  // ────────────────────────────────────────────────
  // Reservas (ahora sí carga la sección)
  // ────────────────────────────────────────────────
  async function loadReservations() {
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    document.querySelector('.menu-item[onclick="loadReservations()"]').classList.add('active');
    document.getElementById('mainContent').innerHTML = \`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <h2>Reservas</h2>
        <button class="btn-success" onclick="openReservationModal()">+ Nueva Reserva</button>
      </div>
      <div class="card"><div id="reservationTable">Cargando reservas...</div></div>
    \`;
    await fetchReservations();
  }

  async function fetchReservations() {
    try {
      const res = await fetch('/api/reservations');
      if (!res.ok) throw new Error();
      const data = await res.json();
      renderReservationsTable(data);
    } catch (err) {
      document.getElementById("reservationTable").innerHTML = "<p>Error cargando reservas.</p>";
    }
  }

  function renderReservationsTable(data) {
    const el = document.getElementById("reservationTable");
    if (!data || data.length === 0) {
      el.innerHTML = "<p>No hay reservas registradas.</p>";
      return;
    }
    let html = '<table class="data-table"><thead><tr><th>ID</th><th>Cliente</th><th>Bote</th><th>Inicio</th><th>Fin</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
    data.forEach(r => {
      html += \`<tr>
        <td>\${r.id}</td>
        <td>\${r.customer_name || '-'}</td>
        <td>\${r.boat_name || '-'}</td>
        <td>\${new Date(r.start_time).toLocaleString()}</td>
        <td>\${new Date(r.end_time).toLocaleString()}</td>
        <td>\${r.status}</td>
        <td><button class="btn btn-success">Editar</button></td>
      </tr>\`;
    });
    html += '</tbody></table>';
    el.innerHTML = html;
  }

  async function openReservationModal() {
    document.getElementById("reservationModalTitle").textContent = "Nueva Reserva";

    // Cargar clientes
    try {
      const res = await fetch('/api/customers');
      const customers = await res.json();
      let options = '<option value="">Seleccionar Cliente</option>';
      customers.forEach(c => {
        options += \`<option value="\${c.id}">\${c.full_name}</option>\`;
      });
      document.getElementById("customerId").innerHTML = options;
    } catch {}

    // Cargar botes
    try {
      const res = await fetch('/api/boats');
      const boats = await res.json();
      let options = '<option value="">Seleccionar Bote</option>';
      boats.forEach(b => {
        options += \`<option value="\${b.id}">\${b.name} (\${b.price_per_hour || 0}/h)</option>\`;
      });
      document.getElementById("inventoryId").innerHTML = options;
    } catch {}

    document.getElementById("reservationModal").classList.add("active");
  }

  function closeReservationModal() {
    document.getElementById("reservationModal").classList.remove("active");
  }

  async function saveReservation() {
    const body = {
      customer_id: document.getElementById("customerId").value,
      inventory_id: document.getElementById("inventoryId").value,
      start_time: document.getElementById("startTime").value,
      end_time: document.getElementById("endTime").value
    };

    if (!body.customer_id || !body.inventory_id || !body.start_time || !body.end_time) {
      showToast("Complete todos los campos", "error");
      return;
    }

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(await res.text());
      showToast("Reserva creada", "success");
      closeReservationModal();
      loadReservations();
    } catch (err) {
      showToast("Error al guardar reserva", "error");
    }
  }

  // ────────────────────────────────────────────────
  // Facturación (ahora sí carga la sección)
  // ────────────────────────────────────────────────
  async function loadInvoices() {
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    document.querySelector('.menu-item[onclick="loadInvoices()"]').classList.add('active');
    document.getElementById('mainContent').innerHTML = \`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <h2>Facturación</h2>
        <button class="btn-success" onclick="openInvoiceModal()">+ Nueva Factura</button>
      </div>
      <div class="card"><div id="invoiceTable">Cargando facturas...</div></div>
    \`;
    await fetchInvoices();
  }

  async function fetchInvoices() {
    try {
      const res = await fetch('/api/invoices');
      if (!res.ok) throw new Error();
      const data = await res.json();
      renderInvoicesTable(data);
    } catch {
      document.getElementById("invoiceTable").innerHTML = "<p>Error cargando facturas.</p>";
    }
  }

  function renderInvoicesTable(data) {
    const el = document.getElementById("invoiceTable");
    if (!data || data.length === 0) {
      el.innerHTML = "<p>No hay facturas registradas.</p>";
      return;
    }
    let html = '<table class="data-table"><thead><tr><th>ID</th><th>Reserva</th><th>Subtotal</th><th>ITBIS</th><th>Total</th><th>Método</th><th>Acciones</th></tr></thead><tbody>';
    data.forEach(i => {
      html += \`<tr>
        <td>\${i.id}</td>
        <td>\${i.reservation_id || '-'}</td>
        <td>RD$ \${Number(i.subtotal || 0).toFixed(2)}</td>
        <td>RD$ \${Number(i.itbis || 0).toFixed(2)}</td>
        <td>RD$ \${Number(i.total || 0).toFixed(2)}</td>
        <td>\${i.payment_method || '-'}</td>
        <td><button class="btn btn-success">Editar</button></td>
      </tr>\`;
    });
    html += '</tbody></table>';
    el.innerHTML = html;
  }

  function openInvoiceModal() {
    document.getElementById("invoiceModalTitle").textContent = "Nueva Factura";
    document.getElementById("subtotal").value = "";
    document.getElementById("itbis").value = "";
    document.getElementById("total").value = "";
    document.getElementById("invoiceModal").classList.add("active");
  }

  function closeInvoiceModal() {
    document.getElementById("invoiceModal").classList.remove("active");
  }

  async function saveInvoice() {
    const body = {
      reservation_id: document.getElementById("reservationId").value || null,
      subtotal: parseFloat(document.getElementById("subtotal").value) || 0,
      itbis: parseFloat(document.getElementById("itbis").value) || 0,
      total: parseFloat(document.getElementById("total").value) || 0,
      payment_method: document.getElementById("paymentMethod").value
    };

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error();
      showToast("Factura creada", "success");
      closeInvoiceModal();
      loadInvoices();
    } catch {
      showToast("Error al guardar factura", "error");
    }
  }

  // Inicio
  loadDashboard();
</script>
