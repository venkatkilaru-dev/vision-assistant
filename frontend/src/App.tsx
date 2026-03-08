// this is the final one 
import React, { useState, useRef } from "react";

function App() {
  const [isActive, setIsActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [transcript, setTranscript] = useState("");
const recognitionRef = useRef<any>(null);

  const startConversation = async () => {
  setIsActive(true);

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  if (videoRef.current) {
    videoRef.current.srcObject = stream;
    videoRef.current.play();
  }

  startSpeechRecognition();
};


 const stopConversation = () => {
  setIsActive(false);

  const stream = videoRef.current?.srcObject as MediaStream;
  stream?.getTracks().forEach((track) => track.stop());

  if (recognitionRef.current) {
    recognitionRef.current.stop();
    recognitionRef.current = null;
  }
};


const startSpeechRecognition = () => {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognitionRef.current = recognition;

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event: any) => {
    const result = event.results[event.results.length - 1];
    if (result.isFinal) {
      const text = result[0].transcript.trim();
      setTranscript(text);
      console.log("Final transcript:", text);
    }
  };

  recognition.onerror = (e: any) => {
    console.error("Speech recognition error:", e);
  };

  recognition.start();
};

// Capture a single frame from the webcam
const captureFrame = () => {
  const video = videoRef.current;
  const canvas = canvasRef.current;

  if (!video || !canvas) return null;

 canvas.width = 256;
canvas.height = 256;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", 0.3);
};

const analyzeFrame = async () => {
  const imageData = captureFrame();
  if (!imageData) return;

  const response = await fetch("http://localhost:5000/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageData }),
  });

  const result = await response.json();
  setTranscript(prev => prev + "\nVision: " + result.description);
};

 return (
  <div style={{ padding: "20px" }}>
    <h1>Conversational Vision Assistant</h1>

    <video
      ref={videoRef}
      style={{ width: "400px", border: "1px solid #ccc" }}
      autoPlay
      muted
    />
<canvas ref={canvasRef} style={{ display: "none" }} />

    <div style={{ marginTop: "20px" }}>
      {!isActive ? (
        <button onClick={startConversation}>Start Conversation</button>
      ) : (
        <button onClick={stopConversation}>Stop Conversation</button>
      )}
      <button onClick={analyzeFrame} style={{ marginTop: "10px" }}>
  Analyze Frame
</button>

    </div>

    {/* Transcript Display */}
    <div style={{ marginTop: "20px" }}>
      <h3>You said:</h3>
      <p>{transcript}</p>
    </div>
  </div>
);

}

export default App;