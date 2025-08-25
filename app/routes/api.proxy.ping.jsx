// app/routes/api.proxy.ping.jsx
export async function loader() {
  return new Response(JSON.stringify({ ok: true, msg: "proxy works!" }), {
    headers: { "Content-Type": "application/json" },
  });
}
