from fastapi import APIRouter, UploadFile, File, Depends
from pydantic import BaseModel
from middleware.auth import get_current_user, require_role
from services.rag_service import process_document_for_rag, generate_chat_response, wipe_knowledge_base

router = APIRouter(prefix="/rag", tags=["RAG"])

class ChatRequest(BaseModel):
    question: str

@router.post("/upload")
async def upload_doc(file: UploadFile = File(...), current_user=Depends(require_role("staff", "admin"))):
    return await process_document_for_rag(file)

@router.post("/chat")
async def chat(req: ChatRequest, current_user=Depends(get_current_user)):
    answer = await generate_chat_response(req.question)
    return {"answer": answer}

@router.delete("/wipe")
async def wipe(current_user=Depends(require_role("admin"))):
    await wipe_knowledge_base()
    return {"message": "Knowledge base wiped"}