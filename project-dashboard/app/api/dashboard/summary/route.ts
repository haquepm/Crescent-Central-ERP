export const dynamic = "force-dynamic";
export async function GET() {
  // The live ERP/Supabase source is intentionally not simulated.
  // Replace this status response when the dedicated dashboard data service is connected.
  return Response.json({
    connected: false,
    source: "not-configured",
    message: "Live Crescent data integration is pending."
  }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
