export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });

    try {
      if (url.pathname === "/" && request.method === "GET") {
        const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Boat Rental ERP</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <!-- <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> --> <!-- Comentado para evitar fallos de carga -->
  <style>
    *{box-sizing:border-box}
    body{margin:0;font-family:'Inter',sans-serif;background:#f1f5f9;}
    .sidebar{width:240px;height:100vh;background:#0f172a;color:#fff;position:fixed;padding:25px 20px;}
    .sidebar h2{margin:0 0 40px 0;font-weight:700;}
    .menu-item{padding:12px 14px;border-radius:8px;margin-bottom:10px;cursor:pointer;transition:.2s;display:flex;align-items:center;gap:12px;}
    .menu-item:hover{background:#1e293b;}
    .menu-item.active{background:#2563eb;}
    .header{margin-left:240px;height:65px;background:#1e3a8a;display:flex;align-items:center;justify-content:space-between;padding:0 30px;color:white;font-weight:600;}
    .content{margin-left:240px;padding:30px;}
    .cards{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
    .card{background:white;padding:20px;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,0.05);}
    .card h4{margin:0;font-weight:600;color:#64748b;}
    .card h2{margin:10px 0 0 0;}
    .data-table{width:100%;border-collapse:collapse;}
    .data-table th, .data-table td{padding:10px;border-bottom:1px solid #ccc;text-align:left;}
    .btn{padding:6px 12px;border:none;border-radius:4px;cursor:pointer;}
    .btn-danger{background:#ef4444;color:white;}
    .btn-success{background:#22c55e;color:white;}
    .input-search{padding:6px 12px;border:1px solid #ccc;border-radius:4px;}
    .modal-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);justify-content:center;align-items:center;}
    .modal-overlay.active{display:flex;}
    .modal{background:white;padding:20px;border-radius:10px;width:520px;max-width:92vw;}
    .toast{position:fixed;bottom:20px;right:20px;color:white;padding:12px 18px;border-radius:6px;opacity:0;transition:opacity .4s;z-index:1000;}
    .toast.show{opacity:1;}
    .toast.error{background:#ef4444;}
    .toast.success{background:#22c55e;}
    .price-group{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:16px 0;}
    .price-group label{font-size:0.9em;color:#64748b;display:block;margin-bottom:4px;}
  </style>
</head>
<body>
  <div class="sidebar">
    <h2>⚓ BoatERP</h2>
    <div class="menu-item active" onclick="loadDashboard()"><span>📊</span> Dashboard</div>
    <div class="menu-item" onclick="loadCustomers()"><span>👥</span> Clientes</div>
    <div class="menu-item" onclick="loadBoats()"><span>⛵</span> Botes</div>
    <div class="menu-item" onclick="loadReservations()"><span>📅</span> Reservas</div>
    <div class="menu-item" onclick="loadInvoices()"><span>💳</span> Facturación</div>
  </div>
  <div class="header">
    <div>Panel Administrativo</div>
    <div>Admin</div>
  </div>
  <div class="content" id="mainContent"></div>

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

  <!-- MODAL BOTES -->
  <div id="boatModal" class="modal-overlay">
    <div class="modal">
      <h3 id="boatModalTitle">Nuevo Bote</h3>
      <input id="boatName" placeholder="Nombre del bote" style="width:100%;margin-bottom:8px"/>
      <input id="boatType" placeholder="Tipo (Lancha, Yate, Velero...)" style="width:100%;margin-bottom:8px"/>
      <input id="boatCapacity" placeholder="Capacidad (personas)" type="number" style="width:100%;margin-bottom:8px"/>
      <input id="boatStatus" placeholder="Estado (available/rented/maintenance)" style="width:100%;margin-bottom:12px"/>
      <div class="price-group">
        <div><label>Precio por hora</label><input id="priceHour" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
        <div><label>Precio por día</label><input id="priceDay" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
        <div><label>Precio por semana</label><input id="priceWeek" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
        <div><label>Precio por mes</label><input id="priceMonth" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
        <div><label>Precio por año</label><input id="priceYear" type="number" step="0.01" placeholder="0.00" style="width:100%"/></div>
      </div>
      <div style="text-align:right;margin-top:16px;">
        <button class="btn-success" onclick="saveBoat()">Guardar</button>
        <button class="btn" onclick="closeBoatModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <!-- MODAL RESERVAS -->
  <div id="reservationModal" class="modal-overlay">
    <div class="modal" style="width:520px">
      <h3 id="reservationModalTitle">Nueva Reserva</h3>
      <select id="customerId" style="width:100%;margin-bottom:12px">
        <option value="">Seleccionar Cliente</option>
      </select>
      <select id="inventoryId" style="width:100%;margin-bottom:12px">
        <option value="">Seleccionar Bote</option>
      </select>
      <input id="startTime" type="datetime-local" placeholder="Inicio" style="width:100%;margin-bottom:8px"/>
      <input id="endTime" type="datetime-local" placeholder="Fin" style="width:100%;margin-bottom:8px"/>
      <input id="duration" placeholder="Duración (horas)" type="number" step="0.5" style="width:100%;margin-bottom:12px"/>
      <div style="text-align:right;margin-top:10px;">
        <button class="btn-success" onclick="saveReservation()">Guardar</button>
        <button class="btn" onclick="closeReservationModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <!-- MODAL FACTURAS -->
  <div id="invoiceModal" class="modal-overlay">
    <div class="modal" style="width:520px">
      <h3 id="invoiceModalTitle">Nueva Factura</h3>
      <select id="reservationId" style="width:100%;margin-bottom:12px">
        <option value="">Seleccionar Reserva (opcional)</option>
      </select>
      <input id="subtotal" type="number" step="0.01" placeholder="Subtotal" style="width:100%;margin-bottom:8px"/>
      <input id="itbis" type="number" step="0.01" placeholder="ITBIS 18%" style="width:100%;margin-bottom:8px"/>
      <input id="total" type="number" step="0.01" placeholder="Total" style="width:100%;margin-bottom:8px"/>
      <select id="paymentMethod" style="width:100%;margin-bottom:12px">
        <option value="cash">Efectivo</option>
        <option value="card">Tarjeta</option>
        <option value="transfer">Transferencia</option>
      </select>
      <div style="text-align:right;margin-top:10px;">
        <button class="btn-success" onclick="saveInvoice()">Guardar</button>
        <button class="btn" onclick="closeInvoiceModal()">Cancelar</button>
      </div>
    </div>
  </div>

  <div id="toast" class="toast"></div>

  <script>
    let editingCustomerId = null;
    let editingBoatId = null;
    let editingReservationId = null;
    let editingInvoiceId = null;

    // Dashboard básico (sin Chart.js para evitar errores de carga)
    const dashboardHTML = \`
      <div id="dashboard">
        <div class="cards">
          <div class="card"><h4>Ingresos Hoy</h4><h2 id="income">$0</h2></div>
          <div class="card"><h4>Reservas Activas</h4><h2 id="active">0</h2></div>
          <div class="card"><h4>Botes Disponibles</h4><h2 id="boats">0</h2></div>
          <div class="card"><h4>Total Clientes</h4><h2 id="customers">0</h2></div>
        </div>
      </div>
    \`;

    async function loadDashboard() {
      document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
      document.querySelector('.menu-item[onclick="loadDashboard()"]').classList.add('active');
      document.getElementById("mainContent").innerHTML = dashboardHTML;
      showToast("Dashboard cargado", "success");
    }

    // Toast
    function showToast(msg, type = "success") {
      const toast = document.getElementById("toast");
      toast.textContent = msg;
      toast.className = \`toast \${type} show\`;
      setTimeout(() => toast.className = "toast", 3500);
    }

    // Inicio
    loadDashboard();
  </script>
</body>
</html>`;
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      }

      // API DASHBOARD
      if (url.pathname === "/api/dashboard") {
        let income_today = 0;
        let active_reservations = 0;
        let available_boats = 0;
        let total_customers = 0;
        try {
          const income = await env.DB.prepare("SELECT COALESCE(SUM(total),0) as total FROM invoices WHERE payment_status = 'paid' AND DATE(created_at) = DATE('now')").first();
          income_today = income?.total ?? 0;
        } catch {}
        try {
          const active = await env.DB.prepare("SELECT COUNT(*) as total FROM reservations WHERE status IN ('pendiente','confirmada')").first();
          active_reservations = active?.total ?? 0;
        } catch {}
        try {
          const boats = await env.DB.prepare("SELECT COUNT(*) as total FROM boats WHERE TRIM(LOWER(status)) = 'available'").first();
          available_boats = boats?.total ?? 0;
        } catch {}
        try {
          const customers = await env.DB.prepare("SELECT COUNT(*) as total FROM customers").first();
          total_customers = customers?.total ?? 0;
        } catch {}
        return json({ income_today, active_reservations, available_boats, total_customers });
      }

      // API CLIENTES
      if (url.pathname.startsWith("/api/customers")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare("SELECT id, full_name, document_id, phone, email FROM customers").all();
          return json(rows.results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare("INSERT INTO customers (full_name, document_id, phone, email) VALUES (?,?,?,?)")
            .bind(body.full_name, body.document_id, body.phone, body.email).run();
          return json({ok:true});
        }
        if (request.method === "PUT") {
          const id = url.pathname.split("/").pop();
          const body = await request.json();
          await env.DB.prepare("UPDATE customers SET full_name=?, document_id=?, phone=?, email=? WHERE id=?")
            .bind(body.full_name, body.document_id, body.phone, body.email, id).run();
          return json({ok:true});
        }
        if (request.method === "DELETE") {
          const id = url.pathname.split("/").pop();
          await env.DB.prepare("DELETE FROM customers WHERE id=?").bind(id).run();
          return json({ok:true});
        }
      }

      // API BOTES
      if (url.pathname.startsWith("/api/boats")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare(`
            SELECT id, name, type, capacity, status,
                   price_per_hour, price_per_day, price_per_week,
                   price_per_month, price_per_year
            FROM boats
          `).all();
          return json(rows.results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(`
            INSERT INTO boats (
              name, type, capacity, status,
              price_per_hour, price_per_day, price_per_week,
              price_per_month, price_per_year
            ) VALUES (?,?,?,?,?,?,?,?,?,?)
          `).bind(
            body.name,
            body.type,
            body.capacity,
            body.status || 'available',
            body.price_per_hour || 0,
            body.price_per_day || 0,
            body.price_per_week || 0,
            body.price_per_month || 0,
            body.price_per_year || 0
          ).run();
          return json({ok:true});
        }
        if (request.method === "PUT") {
          const id = url.pathname.split("/").pop();
          const body = await request.json();
          await env.DB.prepare(`
            UPDATE boats SET
              name = ?,
              type = ?,
              capacity = ?,
              status = ?,
              price_per_hour = ?,
              price_per_day = ?,
              price_per_week = ?,
              price_per_month = ?,
              price_per_year = ?
            WHERE id = ?
          `).bind(
            body.name,
            body.type,
            body.capacity,
            body.status || 'available',
            body.price_per_hour || 0,
            body.price_per_day || 0,
            body.price_per_week || 0,
            body.price_per_month || 0,
            body.price_per_year || 0,
            id
          ).run();
          return json({ok:true});
        }
        if (request.method === "DELETE") {
          const id = url.pathname.split("/").pop();
          await env.DB.prepare("DELETE FROM boats WHERE id=?").bind(id).run();
          return json({ok:true});
        }
      }

      // API RESERVAS - Versión profesional y segura
      if (url.pathname.startsWith("/api/reservations")) {
        const pathParts = url.pathname.split('/');
        const id = pathParts.length > 2 ? pathParts[2] : null;

        if (request.method === "GET") {
          try {
            const rows = await env.DB.prepare(`
              SELECT 
                r.id,
                r.reservation_number,
                r.customer_id,
                r.boat_id,
                r.start_time,
                r.end_time,
                r.duration_hours,
                r.total_amount,
                r.status,
                r.created_at,
                c.full_name AS customer_name,
                b.name AS boat_name,
                b.price_per_hour
              FROM reservations r
              LEFT JOIN customers c ON r.customer_id = c.id
              LEFT JOIN boats b ON r.boat_id = b.id
              ORDER BY r.created_at DESC
            `).all();
            return json({
              success: true,
              count: rows.results.length,
              data: rows.results || []
            });
          } catch (e) {
            console.error("Error GET reservations:", e);
            return json({ success: false, error: "Error al obtener reservas" }, 500);
          }
        }

        if (request.method === "POST") {
          try {
            const body = await request.json();
            if (!body.customer_id || !body.boat_id || !body.start_time || !body.end_time) {
              return json({ success: false, error: "Campos requeridos: customer_id, boat_id, start_time, end_time" }, 400);
            }
            const start = new Date(body.start_time);
            const end = new Date(body.end_time);
            if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
              return json({ success: false, error: "Fechas inválidas o fin anterior a inicio" }, 400);
            }
            const durationHours = (end - start) / (1000 * 60 * 60);
            const boat = await env.DB.prepare("SELECT price_per_hour FROM boats WHERE id = ? AND status = 'available'")
              .bind(body.boat_id).first();
            if (!boat) {
              return json({ success: false, error: "Bote no encontrado o no disponible" }, 404);
            }
            const totalAmount = durationHours * (boat.price_per_hour || 0);
            const result = await env.DB.prepare(`
              INSERT INTO reservations (
                customer_id,
                boat_id,
                start_time,
                end_time,
                duration_hours,
                total_amount,
                status
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
              RETURNING id, reservation_number
            `).bind(
              body.customer_id,
              body.boat_id,
              body.start_time,
              body.end_time,
              durationHours,
              totalAmount,
              'pendiente'
            ).first();
            return json({
              success: true,
              message: "Reserva creada exitosamente",
              data: {
                id: result.id,
                reservation_number: result.reservation_number,
                total_amount: totalAmount
              }
            }, 201);
          } catch (e) {
            console.error("Error POST reservation:", e);
            return json({ success: false, error: "Error al crear reserva: " + e.message }, 500);
          }
        }

        if (request.method === "PUT" && id) {
          try {
            const body = await request.json();
            const exists = await env.DB.prepare("SELECT 1 FROM reservations WHERE id = ?").bind(id).first();
            if (!exists) return json({ success: false, error: "Reserva no encontrada" }, 404);
            await env.DB.prepare(`
              UPDATE reservations SET
                customer_id = COALESCE(?, customer_id),
                boat_id = COALESCE(?, boat_id),
                start_time = COALESCE(?, start_time),
                end_time = COALESCE(?, end_time),
                status = COALESCE(?, status),
                updated_at = datetime('now')
              WHERE id = ?
            `).bind(
              body.customer_id,
              body.boat_id,
              body.start_time,
              body.end_time,
              body.status,
              id
            ).run();
            return json({ success: true, message: "Reserva actualizada correctamente" });
          } catch (e) {
            console.error("Error PUT reservation:", e);
            return json({ success: false, error: "Error al actualizar reserva" }, 500);
          }
        }

        if (request.method === "DELETE" && id) {
          try {
            const exists = await env.DB.prepare("SELECT 1 FROM reservations WHERE id = ?").bind(id).first();
            if (!exists) return json({ success: false, error: "Reserva no encontrada" }, 404);
            await env.DB.prepare("DELETE FROM reservations WHERE id = ?").bind(id).run();
            return json({ success: true, message: "Reserva eliminada correctamente" });
          } catch (e) {
            console.error("Error DELETE reservation:", e);
            return json({ success: false, error: "Error al eliminar reserva" }, 500);
          }
        }

        return json({ success: false, error: "Método no permitido para /reservations" }, 405);
      }

      // API FACTURAS - Profesional y segura
      if (url.pathname.startsWith("/api/invoices")) {
        const pathParts = url.pathname.split('/');
        const id = pathParts.length > 2 ? pathParts[2] : null;

        if (request.method === "GET") {
          try {
            const rows = await env.DB.prepare(`
              SELECT 
                i.id,
                i.invoice_number,
                i.reservation_id,
                i.subtotal,
                i.itbis,
                i.total,
                i.payment_method,
                i.payment_status,
                i.notes,
                i.created_at,
                r.reservation_number,
                c.full_name AS customer_name,
                b.name AS boat_name
              FROM invoices i
              LEFT JOIN reservations r ON i.reservation_id = r.id
              LEFT JOIN customers c ON r.customer_id = c.id
              LEFT JOIN boats b ON r.boat_id = b.id
              ORDER BY i.created_at DESC
            `).all();
            return json({
              success: true,
              count: rows.results.length,
              data: rows.results || []
            });
          } catch (e) {
            console.error("Error GET invoices:", e);
            return json({ success: false, error: "Error al obtener facturas" }, 500);
          }
        }

        if (request.method === "POST") {
          try {
            const body = await request.json();
            if (!body.reservation_id) {
              return json({ success: false, error: "reservation_id es obligatorio" }, 400);
            }
            if (body.subtotal == null || body.itbis == null || body.total == null) {
              return json({ success: false, error: "subtotal, itbis y total son obligatorios" }, 400);
            }
            if (body.total !== body.subtotal + body.itbis) {
              return json({ success: false, error: "El total no coincide con subtotal + itbis" }, 400);
            }
            const result = await env.DB.prepare(`
              INSERT INTO invoices (
                reservation_id,
                subtotal,
                itbis,
                total,
                payment_method,
                payment_status,
                notes
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
              RETURNING id, invoice_number
            `).bind(
              body.reservation_id,
              body.subtotal,
              body.itbis,
              body.total,
              body.payment_method || 'cash',
              body.payment_status || 'pending',
              body.notes || null
            ).first();
            return json({
              success: true,
              message: "Factura creada correctamente",
              data: {
                id: result.id,
                invoice_number: result.invoice_number
              }
            }, 201);
          } catch (e) {
            console.error("Error POST invoice:", e);
            return json({ success: false, error: "Error al crear factura: " + e.message }, 500);
          }
        }

        if (request.method === "PUT" && id) {
          try {
            const body = await request.json();
            const exists = await env.DB.prepare("SELECT 1 FROM invoices WHERE id = ?").bind(id).first();
            if (!exists) return json({ success: false, error: "Factura no encontrada" }, 404);
            await env.DB.prepare(`
              UPDATE invoices SET
                subtotal = COALESCE(?, subtotal),
                itbis = COALESCE(?, itbis),
                total = COALESCE(?, total),
                payment_method = COALESCE(?, payment_method),
                payment_status = COALESCE(?, payment_status),
                notes = ?,
                updated_at = datetime('now')
              WHERE id = ?
            `).bind(
              body.subtotal,
              body.itbis,
              body.total,
              body.payment_method,
              body.payment_status,
              body.notes || null,
              id
            ).run();
            return json({ success: true, message: "Factura actualizada correctamente" });
          } catch (e) {
            console.error("Error PUT invoice:", e);
            return json({ success: false, error: "Error al actualizar factura" }, 500);
          }
        }

        if (request.method === "DELETE" && id) {
          try {
            const exists = await env.DB.prepare("SELECT 1 FROM invoices WHERE id = ?").bind(id).first();
            if (!exists) return json({ success: false, error: "Factura no encontrada" }, 404);
            await env.DB.prepare("DELETE FROM invoices WHERE id = ?").bind(id).run();
            return json({ success: true, message: "Factura eliminada correctamente" });
          } catch (e) {
            console.error("Error DELETE invoice:", e);
            return json({ success: false, error: "Error al eliminar factura" }, 500);
          }
        }

        return json({ success: false, error: "Método no permitido para /invoices" }, 405);
      }

      return json({error:"Not Found"},404);
    } catch(err){
      console.error("Error global:", err);
      return json({error:err.message},500);
    }
  }
}
