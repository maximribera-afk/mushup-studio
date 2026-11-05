// Intermediario entre la web y Replicate (Demucs). La clave nunca llega al navegador.
const API = "https://api.replicate.com/v1";
// Versión de ryan5453/demucs. Si Replicate la cambia, copia la nueva desde la pestaña API del modelo.
const VERSION = Netlify.env.get("DEMUCS_VERSION") || "ff5ad47d2685b27c0f820ee134c4394140804f08fa755cb20c846459faa4b337";
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });

export default async (req) => {
  const token = Netlify.env.get("REPLICATE_API_TOKEN");
  if (!token) return json({ error: "Falta REPLICATE_API_TOKEN en el servidor" }, 500);
  const auth = { Authorization: `Bearer ${token}` };

  if (req.method === "POST") {
    const { audio } = await req.json();
    if (!audio) return json({ error: "No llegó ningún audio" }, 400);
    const bytes = Buffer.from(audio.split(",")[1], "base64");
    const fd = new FormData();
    fd.append("content", new Blob([bytes], { type: "audio/mpeg" }), "song.mp3");
    const up = await fetch(`${API}/files`, { method: "POST", headers: auth, body: fd });
    const file = await up.json();
    if (!up.ok) return json({ error: file.detail || "No se pudo subir el audio" }, up.status);
    const r = await fetch(`${API}/predictions`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ version: VERSION, input: { audio: file.urls.get, isolate_stem: "vocals", format: "mp3" } }),
    });
    const p = await r.json();
    if (!r.ok) return json({ error: p.detail || "No se pudo iniciar la separación" }, r.status);
    return json({ id: p.id, status: p.status });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return json({ error: "Falta id" }, 400);
  const r = await fetch(`${API}/predictions/${encodeURIComponent(id)}`, { headers: auth });
  const p = await r.json();
  if (!r.ok) return json({ error: p.detail || "Error al consultar" }, r.status);
  if (p.status !== "succeeded") return json({ status: p.status, error: p.error });
  const o = p.output || {};
  const stems = { vocals: o.vocals, inst: o.no_vocals };
  return json({ status: "succeeded", stems });
};

export const config = { path: "/api/separate" };
