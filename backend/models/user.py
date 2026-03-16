from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class Role(str, Enum):
    student = "student"
    staff = "staff"
    admin = "admin"

class AddStudentRequest(BaseModel):
    name: str
    email: EmailStr
    roll_no: str
    dept: str
    semester: int
    class_name: str
    password: str

class AddStaffRequest(BaseModel):
    name: str
    email: EmailStr
    dept: str
    position: str
    password: str

class AddAdminRequest(BaseModel):
    name: str
    email: EmailStr
    dept: str
    position: str
    password: str