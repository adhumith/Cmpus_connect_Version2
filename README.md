# Campus Knowledge & Communication System

A Governance-Oriented Lifecycle-Aware Campus Knowledge and Communication System built with a **FastAPI** backend and a **Vite + React** frontend.

---

## Installation & Setup

### 1. Backend Setup (FastAPI)
Navigate to the backend directory and install the necessary Python packages:
```powershell
cd backend
pip install -r requirements.txt
```
# Environment Configuration:
Create a file named .env inside the /backend folder. Populate it with the following variables (replace placeholders with your actual keys):

```bash
APP_NAME="Campus Knowledge System API"
ENVIRONMENT="local"
MONGO_URI="your_mongodb_uri"
GOOGLE_API_KEY="your_google_ai_key"
PINECONE_API_KEY="your_pinecone_key"
REDIS_URL="your_redis_connection_string"
FIREBASE_CREDENTIALS_PATH="./firebase-adminsdk.json"
GEMINI_API_KEY="your_gemini_api_key"
PINECONE_INDEX_NAME="your_index_name"
```
# Firebase Admin SDK:
Place your firebase-adminsdk.json file directly inside the /backend folder to enable administrative Firebase features.

## 2. Frontend Setup (Vite + React)
Navigate to the frontend directory and install the Node dependencies:

```bash
cd frontend
npm install
```

# Environment Configuration:
Create a file named .env inside the /frontend folder:

Code snippet
```bash
VITE_API_URL=http://localhost:8000
```
# Firebase Client:
Ensure your firebase.js file is configured within your source directory to initialize the Firebase frontend SDK.

# How to Run
Automated Execution (Windows)
To start both the backend and frontend simultaneously, run the batch file located in the root directory:

```PowerShell
.\run_project.bat
```
# Manual Execution
If you prefer to run the services individually:

Backend:

```PowerShell
cd backend
uvicorn main:app --reload --port 8000
```
Frontend:

```PowerShell
cd frontend
npm run dev
```
