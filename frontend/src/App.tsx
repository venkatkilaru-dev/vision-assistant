import React, { useState, useRef } from "react";

function App() {
  const [isActive, setIsActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const recognitionRef = useRef<any>(null);

  // ⭐ Track if first output was posted
  const outputPostedRef = useRef(false);

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

    // ⭐ Wait 300ms for webcam to warm up, then analyze ONCE
    setTimeout(() => {
      analyzeFrame();
    }, 300);
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
        setMessages((prev) => [...prev, { sender: "You", text }]);
      }
    };

    recognition.onerror = (e: any) => {
      console.error("Speech recognition error:", e);
    };

    recognition.start();
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return null;

    // Canvas is hidden but still works
    canvas.width = 512;
    canvas.height = 512;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", 0.7);
  };

  const analyzeFrame = async () => {
    console.log("analyzeFrame() called");

    const imageData = captureFrame();
    if (!imageData) {
      console.log("No frame captured");
      return;
    }

    try {
      console.log("Sending frame to backend...");

      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });

      const result = await response.json();

      console.log("Vision response:", result.description);

      // ⭐ Mark output as posted
      outputPostedRef.current = true;
      console.log("outputPosted set to TRUE");

      setMessages((prev) => [
        ...prev,
        { sender: "Vision", text: result.description },
      ]);

    } catch (err) {
      console.error("Analyze error:", err);

      setMessages((prev) => [
        ...prev,
        { sender: "System", text: "Error analyzing frame" },
      ]);
    }

    // ⭐ If outputPosted is true → analyze again ONCE
    if (outputPostedRef.current) {
      outputPostedRef.current = false; // reset so it only runs once
      console.log("Running second analysis because outputPosted was TRUE");
      analyzeFrame(); // run ONE more time
    }
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

      {/* ⭐ Hidden canvas (used only for frame capture) */}
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />

      <div style={{ marginTop: "20px" }}>
        {!isActive ? (
          <button onClick={startConversation}>Start Conversation</button>
        ) : (
          <button onClick={stopConversation}>Stop Conversation</button>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>You said:</h3>
        <p>{transcript}</p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Chat</h3>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            height: "250px",
            overflowY: "auto",
            background: "#f7f7f7",
            borderRadius: "6px",
          }}
        >
          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
