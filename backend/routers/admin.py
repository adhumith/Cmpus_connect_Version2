from fastapi import APIRouter, HTTPException, Depends
from firebase_admin import auth as firebase_auth
from middleware.auth import require_role
from models.user import AddStudentRequest, AddStaffRequest, AddAdminRequest
from db.mongo import get_db

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/add-student")
async def add_student(data: AddStudentRequest, current_user=Depends(require_role("admin"))):
    db = get_db()
    fb_user = firebase_auth.create_user(email=data.email, password=data.password, display_name=data.name)
    doc = {
        "firebase_uid": fb_user.uid,
        "role": "student",
        "name": data.name,
        "email": data.email,
        "roll_no": data.roll_no,
        "dept": data.dept,
        "semester": data.semester,
        "class_name": data.class_name,
    }
    await db.users.insert_one(doc)
    return {"message": "Student added", "uid": fb_user.uid}

@router.post("/add-staff")
async def add_staff(data: AddStaffRequest, current_user=Depends(require_role("admin"))):
    db = get_db()
    fb_user = firebase_auth.create_user(email=data.email, password=data.password, display_name=data.name)
    doc = {
        "firebase_uid": fb_user.uid,
        "role": "staff",
        "name": data.name,
        "email": data.email,
        "dept": data.dept,
        "position": data.position,
    }
    await db.users.insert_one(doc)
    return {"message": "Staff added", "uid": fb_user.uid}

@router.post("/add-admin")
async def add_admin(data: AddAdminRequest, current_user=Depends(require_role("admin"))):
    db = get_db()
    fb_user = firebase_auth.create_user(email=data.email, password=data.password, display_name=data.name)
    doc = {
        "firebase_uid": fb_user.uid,
        "role": "admin",
        "name": data.name,
        "email": data.email,
        "dept": data.dept,
        "position": data.position,
    }
    await db.users.insert_one(doc)
    return {"message": "Admin added", "uid": fb_user.uid}

@router.post("/semester-lifecycle")
async def advance_semester(current_user=Depends(require_role("admin"))):
    db = get_db()
    # Delete semester 8 students first
    del_result = await db.users.delete_many({"role": "student", "semester": 8})
    # Increment all remaining students
    upd_result = await db.users.update_many({"role": "student"}, {"$inc": {"semester": 1}})
    return {
        "deleted_graduated": del_result.deleted_count,
        "advanced": upd_result.modified_count
    }

@router.get("/users")
async def list_users(role: str = None, current_user=Depends(require_role("admin"))):
    db = get_db()
    query = {"role": role} if role else {}
    users = await db.users.find(query, {"_id": 0}).to_list(1000)
    return users