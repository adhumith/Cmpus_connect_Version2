from pydantic import BaseModel
from typing import Optional
from enum import Enum

class BlogCategory(str, Enum):
    dept = "dept"
    clubs = "clubs"
    global_ = "global"

class CreateBlogRequest(BaseModel):
    title: str
    content: str
    category: BlogCategory
    dept: Optional[str] = None  # required if category == dept