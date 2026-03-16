import google.generativeai as genai
from core.config import settings

def setup_gemini():
    genai.configure(api_key=settings.GEMINI_API_KEY)