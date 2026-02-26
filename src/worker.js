export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });

    try {
      if (url.pathname === "/" && request.method === "GET") {
        // ... (todo el HTML + JS del frontend se mantiene EXACTAMENTE igual al que tenías en tu último mensaje funcional)
        // No lo repito aquí para no alargar, pero NO lo cambies, copia solo la parte de abajo si ya tienes el frontend
        const html = `...`; // pega aquí tu HTML completo anterior
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      }

      /* ============================= API DASHBOARD ============================== */
      if (url.pathname === "/api/dashboard") {
        let income_today = 0;
        let active_rentals = 0;
        let available_boats = 0;
        let total_customers = 0;
        let total_boats = 0; // ← agregado para diagnóstico

        // Log inicial para confirmar que llega aquí
        console.log("Dashboard API llamada - iniciando consultas");

        try {
          const income = await env.DB.prepare("SELECT IFNULL(SUM(total_amount),0) as total FROM rentals WHERE DATE(created_at)=DATE('now')").first();
          income_today = income?.total ?? 0;
          console.log("Ingresos hoy:", income_today);
        } catch (e) {
          console.log("Error query ingresos:", e.message);
        }

        try {
          const active = await env.DB.prepare("SELECT COUNT(*) as total FROM rentals WHERE status='active'").first();
          active_rentals = active?.total ?? 0;
          console.log("Alquileres activos:", active_rentals);
        } catch (e) {
          console.log("Error query active rentals:", e.message);
        }

        try {
          // Consulta de diagnóstico: total de botes
          const totalB = await env.DB.prepare("SELECT COUNT(*) as total FROM boats").first();
          total_boats = totalB?.total ?? 0;
          console.log("Total botes en tabla:", total_boats);

          // Consulta principal con TRIM y LOWER
          const boats = await env.DB.prepare("SELECT COUNT(*) as total FROM boats WHERE TRIM(LOWER(status)) = 'available'").first();
          available_boats = boats?.total ?? 0;
          console.log("Botes disponibles (TRIM+LOWER):", available_boats);
        } catch (e) {
          console.log("Error query boats:", e.message);
        }

        try {
          const customers = await env.DB.prepare("SELECT COUNT(*) as total FROM customers").first();
          total_customers = customers?.total ?? 0;
          console.log("Total clientes:", total_customers);
        } catch (e) {
          console.log("Error query customers:", e.message);
        }

        console.log("Respuesta final enviada:", { income_today, active_rentals, available_boats, total_customers });

        return json({ income_today, active_rentals, available_boats, total_customers });
      }

      // ... (todas las rutas /api/customers y /api/boats se mantienen EXACTAMENTE iguales a tu versión anterior)

      return json({error:"Not Found"},404);
    } catch(err){
      console.log("Error global en worker:", err.message);
      return json({error:err.message},500);
    }
  }
}
