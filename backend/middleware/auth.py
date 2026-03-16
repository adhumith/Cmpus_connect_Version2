from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from core.config import settings
from db.mongo import get_db
from core.logger import logger

bearer_scheme = HTTPBearer()

def init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin initialized")

async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    token = creds.credentials
    try:
        decoded = firebase_auth.verify_id_token(token)
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    uid = decoded["uid"]
    logger.info(f"Looking up UID: {uid}")

    db = get_db()
    user = await db.users.find_one({"firebase_uid": uid})
    logger.info(f"MongoDB returned: {user}")

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    clean = {
        "firebase_uid": str(user.get("firebase_uid", "")),
        "role":         str(user.get("role", "")),
        "name":         str(user.get("name", "")),
        "email":        str(user.get("email", "")),
        "dept":         str(user.get("dept", "")),
        "position":     str(user.get("position", "")),
        "roll_no":      str(user.get("roll_no", "")),
        "semester":     user.get("semester", None),
        "class_name":   str(user.get("class_name", "")),
    }
    logger.info(f"Returning clean: {clean}")
    return clean

def require_role(*roles):
    async def checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user
    return checker