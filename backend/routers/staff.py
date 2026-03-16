from fastapi import APIRouter, Depends
from middleware.auth import require_role

router = APIRouter(prefix="/staff", tags=["Staff"])

@router.get("/profile")
async def get_profile(current_user=Depends(require_role("staff", "admin"))):
    return {k: v for k, v in current_user.items() if k != "_id"}