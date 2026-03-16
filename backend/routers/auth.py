from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from middleware.auth import get_current_user
from core.logger import logger

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    logger.info(f"current_user received: {current_user}")
    logger.info(f"current_user type: {type(current_user)}")
    
    user = {
        "firebase_uid": current_user.get("firebase_uid", ""),
        "role":         current_user.get("role", ""),
        "name":         current_user.get("name", ""),
        "email":        current_user.get("email", ""),
        "dept":         current_user.get("dept", ""),
        "position":     current_user.get("position", ""),
        "roll_no":      current_user.get("roll_no", ""),
        "semester":     current_user.get("semester", None),
        "class_name":   current_user.get("class_name", ""),
    }
    
    logger.info(f"sending back: {user}")
    return JSONResponse(content=user)