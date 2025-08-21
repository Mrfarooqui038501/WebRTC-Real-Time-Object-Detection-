# WebRTC Real-Time Object Detection 🚀

This project is a **real-time video conferencing + AI inference app** built with **WebRTC** for peer-to-peer communication and **ONNXRuntime** for AI-powered object detection. It uses **React (frontend)**, **Node.js + Express (backend)**, and **YOLOv8 ONNX model** for inference. The app can be run locally or inside **Docker**, and exposed securely over the internet via **ngrok**.

## ✨ Features

- 📹 **WebRTC-based video streaming** (low latency)
- 🤖 **ONNXRuntime inference** (runs YOLOv8 ONNX model for object detection)
- 🌍 **ngrok integration** → secure public URL for testing
- 🐳 **Dockerized setup** (frontend + backend + ngrok in containers)
- 📊 **Metrics endpoint** (`/metrics`) for monitoring
- ⚡ **React + Vite + Tailwind** frontend

## 🧠 Model Used

We use **YOLOv8 (Ultralytics)** exported to **ONNX format**.

- **Input Size:** 640 × 640
- **Confidence Threshold:** 0.25
- **IOU Threshold:** 0.45
- **Runtime:** onnxruntime-node

You can swap the model by replacing `MODEL_PATH` in `backend/src/env.js` with your custom ONNX model.

## 🛠️ Technologies

### Frontend
- **React 18 + Vite** → fast build and dev server
- **TailwindCSS** → styling
- **WebRTC API** → camera/mic streaming

### Backend
- **Node.js 20 + Express** → server framework
- **WebSocket (ws)** → signaling server for WebRTC peers
- **onnxruntime-node** → AI inference on server
- **sharp** → image preprocessing
- **ngrok** → secure public tunnel

### DevOps
- **Docker** → containerized setup
- **Docker Compose** → multi-container orchestration

## 📂 Project Structure

```
WebRTC/
├── backend/             # Node.js + Express + ONNX inference
│   ├── src/
│   │   ├── inference/   # ONNX model handling
│   │   ├── signaling.js # WebRTC signaling
│   │   ├── routes.js    # API routes
│   │   ├── env.js       # Environment vars
│   │   └── index.js     # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/            # React + Vite + Tailwind
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml   # Multi-container setup
└── README.md
```

## ⚡ Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Mrfarooqui038501/WebRTC-Real-Time-Object-Detection-.git
cd webrtc-onnx-app
```

### 2️⃣ Environment Variables

Create a `.env` file inside `backend/`:

```env
# Server
PORT=8080
MODE=wasm

# Ngrok
NGROK_AUTHTOKEN=your-ngrok-token

# Detection thresholds
CONF_THRESHOLD=0.25
IOU_THRESHOLD=0.45
INPUT_SIZE=640

# Model path
MODEL_PATH=./models/yolov8.onnx
```

## 🐳 Running with Docker + ngrok

### Step 1: Build and Run

```bash
docker compose up --build
```

This will start **three containers**:
1. `webrtc-frontend` → React + Vite app served with Nginx
2. `webrtc-backend` → Express + ONNX inference server
3. `ngrok` → tunnel exposing backend to the internet

### Step 2: Get Public URL

To check the ngrok tunnel URL:

```bash
docker logs ngrok
```

You'll see something like:

```
ngrok tunnel started → https://8.ngrok-free.app
```

That URL is your **public backend API**. You can then open the **frontend (localhost:3000)**, and it will automatically fetch the backend public URL from `/api/public-url`.

## 🚀 Local Development

### Prerequisites

- Node.js 20+
- npm or yarn
- Docker (optional)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
cd backend
npm install
npm start
```

The backend will be available at `http://localhost:8080`

### Download YOLOv8 Model

```bash
# Create models directory
mkdir backend/models

# Download YOLOv8n ONNX model
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx -O backend/models/yolov8.onnx
```

## 📡 API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/public-url` | Returns active ngrok URL |
| `POST` | `/api/inference` | Run model inference on base64 image |
| `GET` | `/metrics` | Prometheus-style metrics |
| `WS` | `/ws` | WebSocket signaling for WebRTC |

### Example API Usage

#### Inference Request

```javascript
const response = await fetch('/api/inference', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
    confidence: 0.25,
    iou: 0.45
  })
});

const result = await response.json();
console.log(result.detections);
```

#### WebSocket Signaling

```javascript
const ws = new WebSocket('ws://localhost:8080/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'offer',
    sdp: peerConnection.localDescription
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle signaling messages
};
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Backend server port |
| `MODE` | `wasm` | ONNX runtime mode (wasm/cpu/cuda) |
| `NGROK_AUTHTOKEN` | - | Your ngrok authentication token |
| `CONF_THRESHOLD` | `0.25` | Object detection confidence threshold |
| `IOU_THRESHOLD` | `0.45` | Intersection over Union threshold |
| `INPUT_SIZE` | `640` | Model input size (640x640) |
| `MODEL_PATH` | `./models/yolov8.onnx` | Path to ONNX model file |

### Docker Configuration

The `docker-compose.yml` includes:

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
  
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - NGROK_AUTHTOKEN=${NGROK_AUTHTOKEN}
  
  ngrok:
    image: ngrok/ngrok:latest
    command: http backend:8080
    environment:
      - NGROK_AUTHTOKEN=${NGROK_AUTHTOKEN}
```

## 🧪 Testing

### Unit Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Integration Tests

```bash
# Run full stack tests
docker compose -f docker-compose.test.yml up --abort-on-container-exit
```

### Manual Testing

1. Open `http://localhost:3000`
2. Allow camera/microphone permissions
3. Start video stream
4. Objects should be detected and highlighted in real-time
5. Check `/metrics` endpoint for performance data

## 🔍 Troubleshooting

### Common Issues

#### WebRTC Connection Failed
- Ensure ports 3000 and 8080 are available
- Check firewall settings
- Verify ngrok tunnel is active

#### ONNX Model Not Loading
- Verify model path in `.env` file
- Ensure model file exists and is valid ONNX format
- Check available memory (models can be 20MB+)

#### Docker Build Errors
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker compose build --no-cache
```

#### Ngrok Token Issues
- Get free token from https://ngrok.com/
- Verify token is correctly set in `.env`
- Check ngrok container logs: `docker logs ngrok`

### Debug Mode

Enable debug logging:

```bash
# Backend debug
DEBUG=webrtc:* npm start

# Frontend debug (open browser console)
localStorage.setItem('debug', 'webrtc:*')
```

## 📊 Performance Metrics

The `/metrics` endpoint provides:

- Inference latency (ms)
- Detection count per frame
- WebRTC connection status
- Memory usage
- CPU utilization

Example metrics output:

```
# HELP inference_duration_ms Time taken for model inference
# TYPE inference_duration_ms histogram
inference_duration_ms_bucket{le="50"} 45
inference_duration_ms_bucket{le="100"} 78
inference_duration_ms_bucket{le="200"} 92

# HELP detections_total Total number of objects detected
# TYPE detections_total counter
detections_total 1547

# HELP webrtc_connections_active Active WebRTC connections
# TYPE webrtc_connections_active gauge
webrtc_connections_active 2
```

## 📋 Roadmap

### Short Term
- [ ] Add authentication (JWT)
- [ ] Support multiple simultaneous users
- [ ] Implement recording functionality
- [ ] Add mobile app support

### Medium Term
- [ ] Multi-user rooms with WebRTC mesh/SFU
- [ ] Support multiple AI models (face detection, pose estimation)
- [ ] Real-time model switching
- [ ] Cloud deployment guides (AWS, GCP, Azure)

### Long Term
- [ ] GPU inference with CUDA ONNX
- [ ] Custom model training integration
- [ ] Advanced analytics dashboard
- [ ] WebAssembly client-side inference

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Submit a pull request

### Code Style

- Use ESLint and Prettier for formatting
- Follow conventional commit messages
- Add JSDoc comments for new functions
- Update README if adding new features

## 🔐 Security

- All WebRTC connections use DTLS encryption
- Ngrok tunnels are HTTPS by default
- No sensitive data is logged
- Environment variables for secrets

## 📜 License

MIT License © 2025

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Mrfarooqui038501/WebRTC-Real-Time-Object-Detection-.git)
- **Discussions**: [GitHub Discussions](https://github.com/Mrfarooqui038501/WebRTC-Real-Time-Object-Detection-.git)
- **Email**: armanfarooqui078601@gmail.com

## 📈 Star History

If you find this project useful, please give it a star! ⭐

---

**Built with ❤️ using WebRTC, ONNX, and modern web technologies.**# WebRTC-Real-Time-Object-Detection-
