import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

/**
 * Minimal WebSocket room signaling for WebRTC:
 * - Viewer creates room
 * - Phone joins with room id
 * - They exchange SDP/ICE via server (pure relay)
 */
export function attachSignaling(httpServer, metrics) {
  const wss = new WebSocketServer({ server: httpServer, path: '/signal' });
  const rooms = new Map(); // roomId -> { viewer, phone }

  function send(ws, type, payload) {
    if (ws && ws.readyState === ws.OPEN) ws.send(JSON.stringify({ type, ...payload }));
  }

  wss.on('connection', (ws) => {
    ws.id = uuidv4();

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'create-room') {
          const roomId = uuidv4().slice(0, 6);
          rooms.set(roomId, { viewer: ws, phone: null });
          ws.roomId = roomId;
          ws.role = 'viewer';
          send(ws, 'room-created', { roomId });
          return;
        }

        if (msg.type === 'join-room') {
          const { roomId } = msg;
          const room = rooms.get(roomId);
          if (!room) return send(ws, 'error', { message: 'Room not found' });
          if (room.phone) return send(ws, 'error', { message: 'Room is full' });
          room.phone = ws;
          ws.roomId = roomId;
          ws.role = 'phone';
          send(room.viewer, 'phone-joined', {});
          send(ws, 'room-joined', { roomId });
          return;
        }

        // Relay SDP/ICE between peers
        if (msg.type === 'signal' && ws.roomId) {
          const room = rooms.get(ws.roomId);
          if (!room) return;

          const target = ws.role === 'viewer' ? room.phone : room.viewer;
          if (!target) return;

          send(target, 'signal', { data: msg.data });
          return;
        }

        // Metrics relays (viewer -> server)
        if (msg.type === 'metric') {
          metrics.ingestClientMetric(msg.data);
          return;
        }
      } catch (e) {
        // ignore
      }
    });

    ws.on('close', () => {
      if (ws.roomId) {
        const room = rooms.get(ws.roomId);
        if (!room) return;
        if (room.viewer === ws) {
          if (room.phone) send(room.phone, 'room-closed', {});
          rooms.delete(ws.roomId);
        } else if (room.phone === ws) {
          send(room.viewer, 'phone-left', {});
          room.phone = null;
        }
      }
    });
  });
}
