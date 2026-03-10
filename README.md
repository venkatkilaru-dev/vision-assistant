
---

# 📘 **Conversational Vision Assistant**  
A full‑stack multimodal assistant combining **webcam vision**, **speech recognition**, and **AI‑powered image understanding**.  
Built with **React + TypeScript** (frontend) and **FastAPI + Python** (backend).

---

## 🚀 **Features**

### 🎥 Vision  
- Captures a **single frame** from the webcam  
- Sends it to the backend for analysis  
- Uses a **hybrid vision pipeline** (Moondream + LLaVA)  
- Returns a natural‑language description of the scene  

### 🎤 Speech  
- Real‑time speech recognition using the Web Speech API  
- Displays user speech in the chat interface  

### 💬 Chat UI  
- Shows user messages and vision responses  
- Clean, simple, and easy to extend  

### 🧠 Local AI  
- No cloud APIs  
- No API keys  
- Fully local, private, and free  

---

## 🏗️ **Architecture Overview**

```
Frontend (React + TypeScript)
│
├── Webcam capture (hidden canvas)
├── Speech recognition (Web Speech API)
├── Single-frame vision trigger
└── Sends Base64 image → Backend

Backend (FastAPI)
│
├── /analyze endpoint
├── Decodes Base64 image
├── Moondream fast pass
└── LLaVA accurate pass
```

The backend returns a JSON response:

```json
{
  "description": "A man holding a bottle in a kitchen."
}
```

---

## 📦 **Project Structure**

```
vision-assistant/
│
├── backend/
│   ├── main.py
│   ├── models/
│   └── utils/
│
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   └── components/
    └── public/
```

---

## 🛠️ **Setup Instructions**

### 1️⃣ Clone the repository

```bash
git clone https://github.com/venkatkilaru-dev/vision-assistant.git
cd vision-assistant
```

---

## 🖥️ **Backend Setup (FastAPI)**

### Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Run the server

```bash
uvicorn main:app --reload --port 5000
```

Backend will run at:

```
http://localhost:5000
```

---

## 🌐 **Frontend Setup (React + TypeScript)**

### Install dependencies

```bash
cd frontend
npm install
```

### Run the frontend

```bash
npm start
```

Frontend will run at:

```
http://localhost:3000
```

---

## 🎯 **How It Works**

### 1. Start Conversation  
- Webcam activates  
- Speech recognition begins  
- After 300ms, one frame is captured  

### 2. Vision Analysis  
- Frame is captured using a **hidden canvas**  
- Converted to Base64  
- Sent to `/analyze`  

### 3. Hybrid Vision Pipeline  
- Moondream generates a fast description  
- LLaVA refines it for accuracy  
- Final description returned  

### 4. Chat Output  
- Vision result appears in the chat window  

---

## 🧪 **API Endpoint**

### `POST /analyze`

**Request:**

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}
```

**Response:**

```json
{
  "description": "A laptop on a desk next to a coffee mug."
}
```

---

## 🔮 **Future Enhancements**

- Continuous vision mode  
- Vision-on-speech (analyze when user speaks)  
- Object detection boxes  
- OCR mode  
- Streaming responses  
- GPU acceleration  

---

## 👨‍💻 **Author**

**Venkata Tirumala Nagendra Babu Kilaru**  
Full‑Stack Developer | AI Engineer | Vision Systems

---

