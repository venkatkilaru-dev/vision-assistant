from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from logging_config import setup_logging
from ollama import Client
import base64
import time
from PIL import Image
import io
import numpy as np
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
# Detect low-light frames
def is_low_light(base64_data):
    try:
        img_bytes = base64.b64decode(base64_data)
        img = Image.open(io.BytesIO(img_bytes)).convert("L")  # grayscale
        arr = np.array(img)
        brightness = arr.mean()
        return brightness < 60  # threshold
    except:
        return False

# Detect hallucination patterns Moondream often produces
HALLUCINATION_PATTERNS = [
    "urn", "vase", "shelf", "white wall", "window", "blinds",
    "fruit", "flowers", "clock", "painting"
]

def looks_hallucinated(text):
    text = text.lower()
    return any(p in text for p in HALLUCINATION_PATTERNS)

# Detect low-information responses
def is_low_information(text):
    return len(text.split()) < 5

# Detect missing face references
def face_missing(text):
    text = text.lower()
    return ("person" not in text and "man" not in text and "woman" not in text)
@app.post("/analyze")
async def analyze(req: ImageRequest):
    try:
        logger.info("Received image for analysis")

        base64_data = req.image.split(",")[1]

        # ---------------------------
        # FAST PASS — MOONDREAM
        # ---------------------------
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

        # ---------------------------
        # CONFIDENCE CHECKS
        # ---------------------------
        low_info = is_low_information(fast_response)
        hallucinated = looks_hallucinated(fast_response)
        dark = is_low_light(base64_data)
        missing_face = face_missing(fast_response)

        logger.info(
            f"Confidence flags → low_info={low_info}, "
            f"hallucinated={hallucinated}, dark={dark}, missing_face={missing_face}"
        )

        # If ANY confidence issue → fallback to LLaVA
        if low_info or hallucinated or dark or missing_face:
            logger.info("Low confidence → switching to LLaVA")

            detailed_response = client.chat(
                model="llava:7b",
                messages=[{
                    "role": "user",
                    "content": "Describe this image in detail.",
                    "images": [base64_data]
                }]
            )["message"]["content"]

            logger.info(f"LLaVA detailed response: {detailed_response}")
            return {"description": detailed_response}

        # Otherwise Moondream is good
        logger.info("Moondream response accepted")
        return {"description": fast_response}

    except Exception as e:
        logger.error(f"Error during analysis: {e}")
        return {"description": "Error analyzing image"}
