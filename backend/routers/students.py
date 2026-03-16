from fastapi import APIRouter, Depends
from middleware.auth import require_role

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/profile")
async def get_profile(current_user=Depends(require_role("student"))):
    return {k: v for k, v in current_user.items() if k != "_id"}