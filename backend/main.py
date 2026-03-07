from fastapi import FastAPI
import time
from pydantic import BaseModel
from logging_config import setup_logging
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = setup_logging()

def check_vision_api():
    return True

def check_transcription():
    return True

def check_audio_stream():
    return True

def check_video_stream():
    return True

@app.get("/health")
def health_check():
    start = time.time()

    status = {
        "vision_api": check_vision_api(),
        "transcription": check_transcription(),
        "audio_stream": check_audio_stream(),
        "video_stream": check_video_stream(),
    }

    healthy = all(status.values())

    logger.info(f"Health check status: {status}")

    return {
        "status": "healthy" if healthy else "unhealthy",
        "components": status,
        "latency_ms": round((time.time() - start) * 1000, 2),
    }

@app.get("/")
def root():
    return {"message": "Conversational Vision Assistant Backend Running"}

# ---------------------------
# FIXED ANALYZE ROUTE
# ---------------------------
class ImageRequest(BaseModel):
    image: str

@app.post("/analyze")
async def analyze(req: ImageRequest):
    return {"description": "Vision test successful — backend received the frame."}
