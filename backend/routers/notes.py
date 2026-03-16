from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from bson import ObjectId
import aiofiles, os
from middleware.auth import require_role, get_current_user
from models.notes import CreateSectionRequest
from db.mongo import get_db

router = APIRouter(prefix="/notes", tags=["Notes"])
UPLOAD_DIR = "uploads/notes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/sections")
async def create_section(data: CreateSectionRequest, current_user=Depends(require_role("staff", "admin"))):
    db = get_db()
    section = {
        "course_code": data.course_code,
        "course_name": data.course_name,
        "dept": data.dept,
        "semester": data.semester,
        "created_by": current_user["firebase_uid"],
        "files": []
    }
    result = await db.note_sections.insert_one(section)
    return {"message": "Section created", "section_id": str(result.inserted_id)}

@router.get("/sections")
async def list_sections(current_user=Depends(get_current_user)):
    db = get_db()
    if current_user["role"] == "student":
        query = {"dept": current_user["dept"], "semester": current_user["semester"]}
    else:
        query = {"created_by": current_user["firebase_uid"]}
    sections = await db.note_sections.find(query).to_list(500)
    for s in sections:
        s["_id"] = str(s["_id"])
    return sections

@router.post("/sections/{section_id}/upload")
async def upload_file(
    section_id: str,
    file: UploadFile = File(...),
    current_user=Depends(require_role("staff", "admin"))
):
    db = get_db()
    section = await db.note_sections.find_one({"_id": ObjectId(section_id)})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    safe_filename = f"{section_id}_{file.filename}"
    path = f"{UPLOAD_DIR}/{safe_filename}"
    async with aiofiles.open(path, "wb") as f:
        await f.write(await file.read())

    await db.note_sections.update_one(
        {"_id": ObjectId(section_id)},
        {"$push": {"files": {"filename": file.filename, "path": path}}}
    )
    return {"message": "File uploaded", "filename": file.filename}

@router.get("/sections/{section_id}/download/{filename}")
async def download_file(
    section_id: str,
    filename: str,
    current_user=Depends(get_current_user)
):
    db = get_db()
    section = await db.note_sections.find_one({"_id": ObjectId(section_id)})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    # Find the file in section
    file_entry = next(
        (f for f in section.get("files", []) if f["filename"] == filename),
        None
    )
    if not file_entry:
        raise HTTPException(status_code=404, detail="File not found")

    path = file_entry["path"]
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(
        path=path,
        filename=filename,
        media_type="application/octet-stream"
    )

@router.delete("/sections/{section_id}/files/{filename}")
async def delete_file(
    section_id: str,
    filename: str,
    current_user=Depends(require_role("staff", "admin"))
):
    db = get_db()
    section = await db.note_sections.find_one({"_id": ObjectId(section_id)})
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    file_entry = next(
        (f for f in section.get("files", []) if f["filename"] == filename),
        None
    )
    if file_entry and os.path.exists(file_entry["path"]):
        os.remove(file_entry["path"])

    await db.note_sections.update_one(
        {"_id": ObjectId(section_id)},
        {"$pull": {"files": {"filename": filename}}}
    )
    return {"message": "File deleted"}

@router.delete("/sections/{section_id}")
async def delete_section(
    section_id: str,
    current_user=Depends(require_role("staff", "admin"))
):
    db = get_db()
    section = await db.note_sections.find_one({"_id": ObjectId(section_id)})
    if section:
        for f in section.get("files", []):
            if os.path.exists(f["path"]):
                os.remove(f["path"])
    await db.note_sections.delete_one({"_id": ObjectId(section_id)})
    return {"message": "Section deleted"}