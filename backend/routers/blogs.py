from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from bson import ObjectId
from middleware.auth import get_current_user, require_role
from db.mongo import get_db
from datetime import datetime
from typing import Optional
import aiofiles
import os
import uuid

router = APIRouter(prefix="/blogs", tags=["Blogs"])
UPLOAD_DIR = "uploads/blogs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
async def create_blog(
    title: str = Form(...),
    content: str = Form(...),
    category: str = Form(...),
    dept: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user=Depends(get_current_user)
):
    image_url = None

    if image and image.filename:
        ext = image.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        path = f"{UPLOAD_DIR}/{filename}"
        async with aiofiles.open(path, "wb") as f:
            await f.write(await image.read())
        image_url = f"/uploads/blogs/{filename}"

    db = get_db()
    blog = {
        "title": title,
        "content": content,
        "category": category,
        "dept": dept if category == "dept" else None,
        "image_url": image_url,
        "author_uid": current_user["firebase_uid"],
        "author_name": current_user["name"],
        "author_role": current_user["role"],
        "created_at": datetime.utcnow().isoformat()
    }
    result = await db.blogs.insert_one(blog)
    return {"message": "Blog created", "blog_id": str(result.inserted_id)}

@router.get("/")
async def list_blogs(
    category: str = None,
    dept: str = None,
    current_user=Depends(get_current_user)
):
    db = get_db()
    query = {}
    if category:
        query["category"] = category
    if dept:
        query["dept"] = dept
    blogs = await db.blogs.find(query).sort("created_at", -1).to_list(500)
    for b in blogs:
        b["_id"] = str(b["_id"])
    return blogs

@router.delete("/{blog_id}")
async def delete_blog(blog_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    blog = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    if blog["author_uid"] != current_user["firebase_uid"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Delete image file if exists
    if blog.get("image_url"):
        file_path = blog["image_url"].lstrip("/")
        if os.path.exists(file_path):
            os.remove(file_path)

    await db.blogs.delete_one({"_id": ObjectId(blog_id)})
    return {"message": "Blog deleted"}