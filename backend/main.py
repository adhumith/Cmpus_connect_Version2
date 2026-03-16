from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles
import os
from core.config import settings
from core.logger import logger
from core.gemini import setup_gemini
from db.mongo import connect_mongo, close_mongo
from db.redis import connect_redis, close_redis
from db.pinecone import init_pinecone
from middleware.auth import init_firebase

from routers import auth, admin, students, staff, notes, blogs, notifications, rag

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up...")
    init_firebase()
    await connect_mongo()
    await connect_redis()
    init_pinecone()
    setup_gemini()
    yield
    logger.info("Shutting down...")
    await close_mongo()
    await close_redis()

app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

os.makedirs("uploads/blogs", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(students.router)
app.include_router(staff.router)
app.include_router(notes.router)
app.include_router(blogs.router)
app.include_router(notifications.router)
app.include_router(rag.router)

@app.get("/")
async def root():
    return {"message": f"{settings.APP_NAME} is running"}