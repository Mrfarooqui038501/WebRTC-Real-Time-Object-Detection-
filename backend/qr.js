import os from "os";
import qrcode from "qrcode";
import ip from "ip";
import ngrok from "ngrok";

const PORT = process.env.PORT || 5173;
const USE_NGROK = process.env.USE_NGROK === "true";

async function main() {
  let url;

  if (USE_NGROK) {
    // Public internet mode
    url = await ngrok.connect(PORT);
    console.log("🌍 Public URL via ngrok:", url);
  } else {
    // Local WiFi mode
    const localIP = ip.address();
    url = `http://${localIP}:${PORT}`;
    console.log("📡 Local network URL:", url);
  }

  // Print QR
  qrcode.toString(url, { type: "terminal" }, (err, qr) => {
    if (err) throw err;
    console.log(qr);
  });

  console.log("🔗 Scan this QR on your phone:", url);
}

main();
