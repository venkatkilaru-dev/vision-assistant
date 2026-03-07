this is the final one 
import React, { useState, useRef } from "react";

function App() {
  const [isActive, setIsActive] = useState(false);
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

      // This is where we will trigger vision analysis later
      // analyzeFrameWithTranscript(text);
    }
  };

  recognition.onerror = (e: any) => {
    console.error("Speech recognition error:", e);
  };

  recognition.start();
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

    <div style={{ marginTop: "20px" }}>
      {!isActive ? (
        <button onClick={startConversation}>Start Conversation</button>
      ) : (
        <button onClick={stopConversation}>Stop Conversation</button>
      )}
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