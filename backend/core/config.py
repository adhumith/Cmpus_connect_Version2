from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Campus Knowledge System API"
    ENVIRONMENT: str = "local"
    MONGO_URI: str
    GOOGLE_API_KEY: str
    PINECONE_API_KEY: str
    REDIS_URL: str
    FIREBASE_CREDENTIALS_PATH: str
    GEMINI_API_KEY: str
    PINECONE_INDEX_NAME: str = "campus-rag"

    class Config:
        env_file = ".env"

settings = Settings()