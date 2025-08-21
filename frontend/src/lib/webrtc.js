// Simple WebRTC wrapper
export async function initWebRTC(localVideoEl, onRemoteStream, onDataMessage) {
  const pc = new RTCPeerConnection();

  // Local camera
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  stream.getTracks().forEach(track => pc.addTrack(track, stream));
  if (localVideoEl) localVideoEl.srcObject = stream;

  // Remote
  pc.ontrack = (event) => {
    if (onRemoteStream) onRemoteStream(event.streams[0]);
  };

  // Data channel
  const dataChannel = pc.createDataChannel("detections");
  dataChannel.onmessage = (event) => {
    if (onDataMessage) {
      try {
        onDataMessage(JSON.parse(event.data));
      } catch (e) {
        console.error("Invalid data msg:", e);
      }
    }
  };

  return { pc, dataChannel };
}
