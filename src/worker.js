export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });

    try {
      // ────────────────────────────────────────────────
      //  FRONTEND (HTML + JS) → se mantiene igual al que te di antes
      // ────────────────────────────────────────────────
      if (url.pathname === "/" && request.method === "GET") {
        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Boat Rental ERP</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    /* ... exactamente el mismo CSS que te entregué en el mensaje anterior ... */
  </style>
</head>
<body>
  <!-- ... exactamente el mismo HTML (sidebar, header, modals, toast) ... -->

  <script>
    /* ... exactamente el mismo <script> con loadDashboard, loadCustomers, loadBoats,
           loadReservations, loadInvoices, calculateReservationPrice,
           openReservationModal, saveReservation, etc. ... */
  </script>
</body>
</html>`;
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      }

      // ────────────────────────────────────────────────
      //  API - DASHBOARD (mejorado ligeramente)
      // ────────────────────────────────────────────────
      if (url.pathname === "/api/dashboard") {
        let income_today = 0, active_reservations = 0, available_boats = 0, total_customers = 0;

        try {
          const income = await env.DB.prepare(
            "SELECT IFNULL(SUM(total),0) as total FROM invoices WHERE DATE(created_at)=DATE('now') AND payment_status='paid'"
          ).first();
          income_today = income?.total ?? 0;
        } catch {}

        try {
          const active = await env.DB.prepare(
            "SELECT COUNT(*) as cnt FROM reservations WHERE status IN ('pendiente','confirmada')"
          ).first();
          active_reservations = active?.cnt ?? 0;
        } catch {}

        try {
          const boats = await env.DB.prepare(
            "SELECT COUNT(*) as cnt FROM boats WHERE status = 'available'"
          ).first();
          available_boats = boats?.cnt ?? 0;
        } catch {}

        try {
          const customers = await env.DB.prepare("SELECT COUNT(*) as cnt FROM customers").first();
          total_customers = customers?.cnt ?? 0;
        } catch {}

        return json({
          income_today,
          active_reservations,
          available_boats,
          total_customers
        });
      }

      // ────────────────────────────────────────────────
      //  API - CLIENTES (sin cambios importantes)
      // ────────────────────────────────────────────────
      if (url.pathname.startsWith("/api/customers")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare(
            "SELECT id, full_name, document_id, phone, email FROM customers ORDER BY full_name"
          ).all();
          return json(rows.results || []);
        }
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(
            "INSERT INTO customers (full_name, document_id, phone, email) VALUES (?,?,?,?)"
          ).bind(body.full_name, body.document_id, body.phone || null, body.email || null).run();
          return json({ success: true });
        }
        if (request.method === "PUT") {
          const id = url.pathname.split("/").pop();
          const body = await request.json();
          await env.DB.prepare(
            "UPDATE customers SET full_name=?, document_id=?, phone=?, email=? WHERE id=?"
          ).bind(body.full_name, body.document_id, body.phone || null, body.email || null, id).run();
          return json({ success: true });
        }
        if (request.method === "DELETE") {
          const id = url.pathname.split("/").pop();
          await env.DB.prepare("DELETE FROM customers WHERE id=?").bind(id).run();
          return json({ success: true });
        }
      }

      // ────────────────────────────────────────────────
      //  API - BOTES (sin cambios importantes)
      // ────────────────────────────────────────────────
      if (url.pathname.startsWith("/api/boats")) {
        if (request.method === "GET") {
          let query = `
            SELECT id, name, type, capacity, status,
                   price_per_hour, price_per_day, price_per_week, price_per_month
            FROM boats
          `;
          let stmt = env.DB.prepare(query);
          let results;

          if (url.searchParams.has("status")) {
            query += " WHERE status = ?";
            stmt = env.DB.prepare(query).bind(url.searchParams.get("status"));
          }

          results = await stmt.all();
          return json(results.results || []);
        }

        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(`
            INSERT INTO boats (name, type, capacity, status, price_per_hour, price_per_day, price_per_week, price_per_month)
            VALUES (?,?,?,?,?,?,?,?)
          `).bind(
            body.name?.trim(),
            body.type?.trim(),
            body.capacity || null,
            body.status || "available",
            body.price_per_hour || 0,
            body.price_per_day || 0,
            body.price_per_week || 0,
            body.price_per_month || 0
          ).run();
          return json({ success: true });
        }

        if (request.method === "PUT") {
          const id = url.pathname.split("/").pop();
          const body = await request.json();
          await env.DB.prepare(`
            UPDATE boats SET name=?, type=?, capacity=?, status=?, price_per_hour=?, price_per_day=?, price_per_week=?, price_per_month=?
            WHERE id=?
          `).bind(
            body.name?.trim(),
            body.type?.trim(),
            body.capacity || null,
            body.status || "available",
            body.price_per_hour || 0,
            body.price_per_day || 0,
            body.price_per_week || 0,
            body.price_per_month || 0,
            id
          ).run();
          return json({ success: true });
        }

        if (request.method === "DELETE") {
          const id = url.pathname.split("/").pop();
          await env.DB.prepare("DELETE FROM boats WHERE id=?").bind(id).run();
          return json({ success: true });
        }
      }

      // ────────────────────────────────────────────────
      //  API - RESERVAS (mejorada con joins y cálculo)
      // ────────────────────────────────────────────────
      if (url.pathname.startsWith("/api/reservations")) {
        if (request.method === "GET") {
          let query = `
            SELECT 
              r.id, r.customer_id, r.boat_id, r.start_time, r.end_time, r.status, r.calculated_amount,
              c.full_name AS customer_name,
              b.name AS boat_name, b.price_per_hour
            FROM reservations r
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN boats b ON r.boat_id = b.id
          `;
          let stmt = env.DB.prepare(query);
          let bindings = [];

          if (url.searchParams.has("status")) {
            query += " WHERE r.status = ?";
            bindings.push(url.searchParams.get("status"));
            stmt = env.DB.prepare(query);
          }

          const rows = await stmt.bind(...bindings).all();
          return json(rows.results || []);
        }

        if (request.method === "POST") {
          const body = await request.json();
          const result = await env.DB.prepare(`
            INSERT INTO reservations 
            (customer_id, boat_id, start_time, end_time, calculated_amount, status)
            VALUES (?,?,?,?,?,?)
          `).bind(
            body.customer_id,
            body.boat_id,
            body.start_time,
            body.end_time,
            body.calculated_amount || 0,
            body.status || "pendiente"
          ).run();

          return json({ success: true, lastID: result.lastRowId });
        }

        if (request.method === "PUT") {
          const id = url.pathname.split("/").pop();
          const body = await request.json();
          await env.DB.prepare(`
            UPDATE reservations 
            SET customer_id=?, boat_id=?, start_time=?, end_time=?, calculated_amount=?, status=?
            WHERE id=?
          `).bind(
            body.customer_id,
            body.boat_id,
            body.start_time,
            body.end_time,
            body.calculated_amount || 0,
            body.status || "pendiente",
            id
          ).run();
          return json({ success: true });
        }

        if (request.method === "DELETE") {
          const id = url.pathname.split("/").pop();
          await env.DB.prepare("DELETE FROM reservations WHERE id=?").bind(id).run();
          return json({ success: true });
        }
      }

      // ────────────────────────────────────────────────
      //  API - FACTURAS (mejorada con joins)
      // ────────────────────────────────────────────────
      if (url.pathname.startsWith("/api/invoices")) {
        if (request.method === "GET") {
          const rows = await env.DB.prepare(`
            SELECT 
              i.id, i.reservation_id, i.subtotal, i.itbis, i.total, i.payment_method, i.payment_status, i.created_at,
              r.start_time, r.end_time,
              c.full_name AS customer_name,
              b.name AS boat_name
            FROM invoices i
            LEFT JOIN reservations r ON i.reservation_id = r.id
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN boats b ON r.boat_id = b.id
            ORDER BY i.created_at DESC
          `).all();
          return json(rows.results || []);
        }

        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(`
            INSERT INTO invoices 
            (reservation_id, subtotal, itbis, total, payment_method, payment_status)
            VALUES (?,?,?,?,?,?)
          `).bind(
            body.reservation_id || null,
            body.subtotal || 0,
            body.itbis || 0,
            body.total || 0,
            body.payment_method || "cash",
            body.payment_status || "pending"
          ).run();
          return json({ success: true });
        }

        if (request.method === "PUT") {
          const id = url.pathname.split("/").pop();
          const body = await request.json();
          await env.DB.prepare(`
            UPDATE invoices 
            SET reservation_id=?, subtotal=?, itbis=?, total=?, payment_method=?, payment_status=?
            WHERE id=?
          `).bind(
            body.reservation_id || null,
            body.subtotal || 0,
            body.itbis || 0,
            body.total || 0,
            body.payment_method || "cash",
            body.payment_status || "pending",
            id
          ).run();
          return json({ success: true });
        }

        if (request.method === "DELETE") {
          const id = url.pathname.split("/").pop();
          await env.DB.prepare("DELETE FROM invoices WHERE id=?").bind(id).run();
          return json({ success: true });
        }
      }

      return json({ error: "Not Found" }, 404);
    } catch (err) {
      console.error(err);
      return json({ error: err.message || "Internal Server Error" }, 500);
    }
  }
};
