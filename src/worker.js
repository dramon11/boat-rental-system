export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
      });

    try {

      // ===============================
      // API DASHBOARD
      // ===============================
      if (url.pathname === "/api/dashboard") {
        let income_today = 0;
        let active_reservations = 0;
        let available_boats = 0;
        let total_customers = 0;

        try {
          const income = await env.DB.prepare(
            "SELECT COALESCE(SUM(total),0) as total FROM invoices WHERE payment_status = 'paid' AND DATE(created_at) = DATE('now')"
          ).first();
          income_today = income?.total ?? 0;
        } catch {}

        try {
          const active = await env.DB.prepare(
            "SELECT COUNT(*) as total FROM reservations WHERE status IN ('pendiente','confirmada')"
          ).first();
          active_reservations = active?.total ?? 0;
        } catch {}

        try {
          const boats = await env.DB.prepare(
            "SELECT COUNT(*) as total FROM boats WHERE TRIM(LOWER(status)) = 'available'"
          ).first();
          available_boats = boats?.total ?? 0;
        } catch {}

        try {
          const customers = await env.DB.prepare(
            "SELECT COUNT(*) as total FROM customers"
          ).first();
          total_customers = customers?.total ?? 0;
        } catch {}

        return json({ income_today, active_reservations, available_boats, total_customers });
      }

      // ===============================
      // API CLIENTES
      // ===============================
      if (url.pathname.startsWith("/api/customers")) {
        const id = url.pathname.split("/")[3];

        if (request.method === "GET") {
          const rows = await env.DB.prepare(
            "SELECT id, full_name, document_id, phone, email FROM customers"
          ).all();
          return json(rows.results || []);
        }

        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(
            "INSERT INTO customers (full_name, document_id, phone, email) VALUES (?,?,?,?)"
          )
            .bind(body.full_name, body.document_id, body.phone, body.email)
            .run();
          return json({ ok: true });
        }

        if (request.method === "PUT" && id) {
          const body = await request.json();
          await env.DB.prepare(
            "UPDATE customers SET full_name=?, document_id=?, phone=?, email=? WHERE id=?"
          )
            .bind(body.full_name, body.document_id, body.phone, body.email, id)
            .run();
          return json({ ok: true });
        }

        if (request.method === "DELETE" && id) {
          await env.DB.prepare("DELETE FROM customers WHERE id=?")
            .bind(id)
            .run();
          return json({ ok: true });
        }
      }

      // ===============================
      // API BOTES
      // ===============================
      if (url.pathname.startsWith("/api/boats")) {
        const id = url.pathname.split("/")[3];

        if (request.method === "GET") {
          const rows = await env.DB.prepare(`
            SELECT id, name, type, capacity, status,
                   price_per_hour, price_per_day,
                   price_per_week, price_per_month,
                   price_per_year
            FROM boats
          `).all();
          return json(rows.results || []);
        }

        if (request.method === "POST") {
          const body = await request.json();

          await env.DB.prepare(`
            INSERT INTO boats (
              name, type, capacity, status,
              price_per_hour, price_per_day,
              price_per_week, price_per_month,
              price_per_year
            ) VALUES (?,?,?,?,?,?,?,?,?)
          `).bind(
            body.name,
            body.type,
            body.capacity,
            body.status || "available",
            body.price_per_hour || 0,
            body.price_per_day || 0,
            body.price_per_week || 0,
            body.price_per_month || 0,
            body.price_per_year || 0
          ).run();

          return json({ ok: true });
        }

        if (request.method === "PUT" && id) {
          const body = await request.json();

          await env.DB.prepare(`
            UPDATE boats SET
              name=?,
              type=?,
              capacity=?,
              status=?,
              price_per_hour=?,
              price_per_day=?,
              price_per_week=?,
              price_per_month=?,
              price_per_year=?
            WHERE id=?
          `).bind(
            body.name,
            body.type,
            body.capacity,
            body.status || "available",
            body.price_per_hour || 0,
            body.price_per_day || 0,
            body.price_per_week || 0,
            body.price_per_month || 0,
            body.price_per_year || 0,
            id
          ).run();

          return json({ ok: true });
        }

        if (request.method === "DELETE" && id) {
          await env.DB.prepare("DELETE FROM boats WHERE id=?")
            .bind(id)
            .run();
          return json({ ok: true });
        }
      }

      // ===============================
      // API RESERVAS
      // ===============================
      if (url.pathname.startsWith("/api/reservations")) {
        const id = url.pathname.split("/")[3];

        if (request.method === "GET") {
          const rows = await env.DB.prepare(`
            SELECT 
              r.id,
              r.customer_id,
              r.boat_id,
              r.start_time,
              r.end_time,
              r.status,
              c.full_name AS customer_name,
              b.name AS boat_name
            FROM reservations r
            LEFT JOIN customers c ON r.customer_id = c.id
            LEFT JOIN boats b ON r.boat_id = b.id
            ORDER BY r.id DESC
          `).all();

          return json({ success: true, data: rows.results || [] });
        }

        if (request.method === "POST") {
          const body = await request.json();

          if (!body.customer_id || !body.boat_id || !body.start_time || !body.end_time) {
            return json({ success: false, error: "Campos incompletos" }, 400);
          }

          await env.DB.prepare(`
            INSERT INTO reservations (
              customer_id,
              boat_id,
              start_time,
              end_time,
              status
            ) VALUES (?,?,?,?,?)
          `).bind(
            body.customer_id,
            body.boat_id,
            body.start_time,
            body.end_time,
            "pendiente"
          ).run();

          return json({ success: true });
        }

        if (request.method === "DELETE" && id) {
          await env.DB.prepare("DELETE FROM reservations WHERE id=?")
            .bind(id)
            .run();
          return json({ success: true });
        }
      }

      // ===============================
      // API FACTURAS
      // ===============================
      if (url.pathname.startsWith("/api/invoices")) {
        const id = url.pathname.split("/")[3];

        if (request.method === "GET") {
          const rows = await env.DB.prepare(`
            SELECT id, reservation_id, subtotal, itbis, total,
                   payment_method, payment_status
            FROM invoices
            ORDER BY id DESC
          `).all();

          return json({ success: true, data: rows.results || [] });
        }

        if (request.method === "POST") {
          const body = await request.json();

          await env.DB.prepare(`
            INSERT INTO invoices (
              reservation_id,
              subtotal,
              itbis,
              total,
              payment_method,
              payment_status
            ) VALUES (?,?,?,?,?,?)
          `).bind(
            body.reservation_id,
            body.subtotal || 0,
            body.itbis || 0,
            body.total || 0,
            body.payment_method || "cash",
            "pending"
          ).run();

          return json({ success: true });
        }

        if (request.method === "DELETE" && id) {
          await env.DB.prepare("DELETE FROM invoices WHERE id=?")
            .bind(id)
            .run();
          return json({ success: true });
        }
      }

      return json({ error: "Ruta no encontrada" }, 404);

    } catch (err) {
      return json({ error: err.message }, 500);
    // API FACTURAS - Versión profesional y segura
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
          i.created_at,
          i.notes,
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
        data: rows.results || []
      });
    } catch (e) {
      return json({ success: false, error: "Error al obtener facturas: " + e.message }, 500);
    }
  }

  if (request.method === "POST") {
    try {
      const body = await request.json();

      // Validación mínima
      if (!body.reservation_id) {
        return json({ success: false, error: "reservation_id es obligatorio" }, 400);
      }
      if (body.subtotal == null || body.itbis == null || body.total == null) {
        return json({ success: false, error: "subtotal, itbis y total son obligatorios" }, 400);
      }

      const stmt = await env.DB.prepare(`
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
      `);

      const result = await stmt.bind(
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
          subtotal = ?,
          itbis = ?,
          total = ?,
          payment_method = ?,
          payment_status = ?,
          notes = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).bind(
        body.subtotal ?? 0,
        body.itbis ?? 0,
        body.total ?? 0,
        body.payment_method || 'cash',
        body.payment_status || 'pending',
        body.notes || null,
        id
      ).run();

      return json({ success: true, message: "Factura actualizada" });
    } catch (e) {
      return json({ success: false, error: "Error al actualizar factura: " + e.message }, 500);
    }
  }

  if (request.method === "DELETE" && id) {
    try {
      const exists = await env.DB.prepare("SELECT 1 FROM invoices WHERE id = ?").bind(id).first();
      if (!exists) return json({ success: false, error: "Factura no encontrada" }, 404);

      await env.DB.prepare("DELETE FROM invoices WHERE id = ?").bind(id).run();
      return json({ success: true, message: "Factura eliminada" });
    } catch (e) {
      return json({ success: false, error: "Error al eliminar factura: " + e.message }, 500);
    }
  }

  return json({ success: false, error: "Método no permitido" }, 405);
}
      };
      
