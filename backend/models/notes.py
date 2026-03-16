from pydantic import BaseModel
from typing import Optional, List

class CreateSectionRequest(BaseModel):
    course_code: str
    course_name: str
    dept: str
    semester: int

class UpdateSectionRequest(BaseModel):
    course_code: Optional[str] = None
    course_name: Optional[str] = None