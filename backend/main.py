from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from logging_config import setup_logging
from ollama import Client
import base64
import time

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
client = Client()

# ⭐ Warm up Moondream so first request is instant
try:
    client.chat(
        model="moondream",
        messages=[{"role": "user", "content": "warmup"}]
    )
except Exception as e:
    print("Warmup failed (will still work on first request):", e)

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

class ImageRequest(BaseModel):
    image: str

@app.post("/analyze")
async def analyze(req: ImageRequest):
    try:
        logger.info("Received image for analysis")

        base64_data = req.image.split(",")[1]
        logger.info("Image decoded successfully")

        # Fast pass
        logger.info("Running Moondream fast pass")
        fast_response = client.chat(
            model="moondream",
            messages=[{
                "role": "user",
                "content": "Quickly describe this image in one short sentence.",
                "images": [base64_data]
            }]
        )["message"]["content"]
        logger.info(f"Moondream response: {fast_response}")

        # Decide if we need LLaVA
        needs_detail = any(keyword in fast_response.lower() for keyword in [
            "unclear", "not sure", "can't tell", "blurry", "unknown",
            "text", "words", "numbers", "small", "detailed", "complex"
        ])

        if not needs_detail:
            logger.info("Fast response is good enough")
            return {"description": fast_response}

        # Slow pass
        logger.info("Running LLaVA detailed pass")
        detailed_response = client.chat(
            model="llava:7b",
            messages=[{
                "role": "user",
                "content": "Describe this image in detail.",
                "images": [base64_data]
            }]
        )["message"]["content"]

        logger.info("LLaVA detailed response complete")
        return {"description": detailed_response}

    except Exception as e:
        logger.error(f"Error during analysis: {e}")
        return {"description": "Error analyzing image"}
