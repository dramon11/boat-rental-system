export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
      });

    try {

      if (url.pathname === "/api/customers" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM customers ORDER BY id DESC").all();
        return json(results);
      }

      if (url.pathname === "/api/customers" && request.method === "POST") {
        const body = await request.json();
        if (!body.full_name || !body.document_id) {
          return json({ error: "Missing required fields" }, 400);
        }
        await env.DB.prepare(
          "INSERT INTO customers (full_name, document_id, phone, email) VALUES (?,?,?,?)"
        ).bind(body.full_name, body.document_id, body.phone, body.email).run();
        return json({ success: true });
      }

      if (url.pathname === "/api/boats" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM boats ORDER BY id DESC").all();
        return json(results);
      }

      if (url.pathname === "/api/boats" && request.method === "POST") {
        const body = await request.json();
        await env.DB.prepare(
          "INSERT INTO boats (name,type,capacity,price_per_hour,status) VALUES (?,?,?,?,?)"
        ).bind(body.name, body.type, body.capacity, body.price_per_hour, "available").run();
        return json({ success: true });
      }

      if (url.pathname === "/api/rentals" && request.method === "POST") {
        const body = await request.json();

        if (new Date(body.end_datetime) <= new Date(body.start_datetime)) {
          return json({ error: "Invalid dates" }, 400);
        }

        const boat = await env.DB.prepare("SELECT * FROM boats WHERE id=?")
          .bind(body.boat_id).first();

        if (!boat || boat.status !== "available") {
          return json({ error: "Boat not available" }, 400);
        }

        const hours = (new Date(body.end_datetime) - new Date(body.start_datetime)) / 3600000;
        const total = hours * boat.price_per_hour;

        await env.DB.prepare(
          "INSERT INTO rentals (customer_id,boat_id,start_datetime,end_datetime,total_amount,status) VALUES (?,?,?,?,?,?)"
        ).bind(body.customer_id, body.boat_id, body.start_datetime, body.end_datetime, total, "active").run();

        await env.DB.prepare("UPDATE boats SET status='rented' WHERE id=?")
          .bind(body.boat_id).run();

        return json({ success: true, total_amount: total });
      }

      if (url.pathname === "/api/dashboard") {
        const income = await env.DB.prepare(
          "SELECT IFNULL(SUM(total_amount),0) as total FROM rentals WHERE DATE(created_at)=DATE('now')"
        ).first();

        const active = await env.DB.prepare(
          "SELECT COUNT(*) as total FROM rentals WHERE status='active'"
        ).first();

        const boats = await env.DB.prepare(
          "SELECT COUNT(*) as total FROM boats WHERE status='available'"
        ).first();

        const customers = await env.DB.prepare(
          "SELECT COUNT(*) as total FROM customers"
        ).first();

        return json({
          income_today: income.total,
          active_rentals: active.total,
          available_boats: boats.total,
          total_customers: customers.total
        });
      }

      return json({ error: "Not Found" }, 404);

    } catch (err) {
      return json({ error: err.message }, 500);
    }
  },
};
