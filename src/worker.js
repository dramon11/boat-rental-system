// ... (todo el HTML y JS frontend se mantiene igual al que tenías)

// Dentro del worker, reemplaza SOLO esta parte:

if (url.pathname === "/api/dashboard") {
  let income_today = 0;
  let active_rentals = 0;
  let available_boats = 0;
  let total_customers = 0;

  try {
    const r = await env.DB.prepare("SELECT IFNULL(SUM(total_amount),0) as total FROM rentals WHERE DATE(created_at)=DATE('now')").first();
    income_today = r?.total ?? 0;
  } catch (e) {
    console.log("Error query ingresos:", e.message);
  }

  try {
    const r = await env.DB.prepare("SELECT COUNT(*) as total FROM rentals WHERE LOWER(status) = 'active'").first();
    active_rentals = r?.total ?? 0;
  } catch (e) {
    console.log("Error query rentals active:", e.message);
  }

  try {
    // Versión robusta: LOWER(status) = 'available' y TRIM para quitar espacios
    const r = await env.DB.prepare(`
      SELECT COUNT(*) as total 
      FROM boats 
      WHERE TRIM(LOWER(status)) = 'available'
    `).first();
    available_boats = r?.total ?? 0;
    console.log("Botes disponibles encontrados:", available_boats);  // ← log para depurar
  } catch (e) {
    console.log("Error query boats available:", e.message);
  }

  try {
    const r = await env.DB.prepare("SELECT COUNT(*) as total FROM customers").first();
    total_customers = r?.total ?? 0;
  } catch (e) {
    console.log("Error query customers:", e.message);
  }

  return json({
    income_today,
    active_rentals,
    available_boats,
    total_customers
  });
}
