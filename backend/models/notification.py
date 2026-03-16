from pydantic import BaseModel
from typing import Optional

class SendNotificationRequest(BaseModel):
    title: str
    message: str
    dept: Optional[str] = None
    semester: Optional[int] = None
    class_name: Optional[str] = None