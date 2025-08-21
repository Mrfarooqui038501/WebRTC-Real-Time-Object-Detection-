import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

export default function QRJoin() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const res = await fetch("/api/public-url");
        const data = await res.json();
        if (data.url) {
          // ✅ use ngrok public url
          setUrl(data.url);
        } else {
          // fallback to LAN/local
          const { protocol, port } = window.location;
          const lanIP = "192.168.1.8"; // change to your LAN IP
          setUrl(`${protocol}//${lanIP}:${port}`);
        }
      } catch (err) {
        console.error("Error fetching public URL:", err);
      }
    };
    fetchUrl();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-2">Join from your phone</h2>
      {url && (
        <>
          <QRCode value={url} size={160} className="mb-2" />
          <p className="text-gray-600 text-sm break-all">{url}</p>
        </>
      )}
    </div>
  );
}
