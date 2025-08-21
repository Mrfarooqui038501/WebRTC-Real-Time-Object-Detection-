import ngrok from "ngrok";

let publicUrl = null;

export async function startNgrok() {
  if (publicUrl) return publicUrl; // reuse if already started
  publicUrl = await ngrok.connect({
    addr: 3000, // frontend dev server port
    authtoken: process.env.NGROK_AUTHTOKEN, // from .env
    region: "in", // India
  });
  console.log("🌍 Ngrok tunnel:", publicUrl);
  return publicUrl;
}

export function getNgrokUrl() {
  return publicUrl;
}
