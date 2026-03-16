from fastapi import APIRouter, Depends
from middleware.auth import require_role, get_current_user
from models.notification import SendNotificationRequest
from db.mongo import get_db
from datetime import datetime

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/send")
async def send_notification(data: SendNotificationRequest, current_user=Depends(require_role("staff", "admin"))):
    db = get_db()
    notif = {
        "title": data.title,
        "message": data.message,
        "dept": data.dept,
        "semester": data.semester,
        "class_name": data.class_name,
        "sent_by": current_user["firebase_uid"],
        "sender_name": current_user["name"],
        "created_at": datetime.utcnow().isoformat()
    }
    result = await db.notifications.insert_one(notif)
    return {"message": "Notification sent", "id": str(result.inserted_id)}

@router.get("/my")
async def get_my_notifications(current_user=Depends(require_role("student"))):
    db = get_db()
    query = {}
    # Match student's dept, semester, class
    filters = []
    filters.append({"dept": None, "semester": None, "class_name": None})  # broadcast
    if current_user.get("dept"):
        filters.append({"dept": current_user["dept"]})
    if current_user.get("semester"):
        filters.append({"semester": current_user["semester"]})
    if current_user.get("class_name"):
        filters.append({"class_name": current_user["class_name"]})
    
    notifs = await db.notifications.find(
        {"$or": [
            {"dept": current_user.get("dept"), "semester": current_user.get("semester"), "class_name": current_user.get("class_name")},
            {"dept": current_user.get("dept"), "semester": None, "class_name": None},
            {"dept": None, "semester": None, "class_name": None},
        ]}
    ).sort("created_at", -1).to_list(200)
    
    for n in notifs:
        n["_id"] = str(n["_id"])
    return notifs