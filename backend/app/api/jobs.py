import os
import uuid
import json
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from app.workers.tasks import (
    compress_pdf_task,
    protect_pdf_task,
    unlock_pdf_task,
    repair_pdf_task,
)

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

STORAGE_DIR = os.getenv("STORAGE_DIR", "/tmp/pdfdoc_jobs" if os.name != "nt" else "C:/temp/pdfdoc_jobs")
os.makedirs(STORAGE_DIR, exist_ok=True)

# In-memory job registry for local/lightweight fallback
JOBS_STORE = {}

@router.post("/submit")
async def submit_job(
    file: UploadFile = File(...),
    action: str = Form(...),  # 'compress', 'protect', 'unlock', 'repair'
    options: str = Form("{}"),
):
    job_id = str(uuid.uuid4())
    job_dir = os.path.join(STORAGE_DIR, job_id)
    os.makedirs(job_dir, exist_ok=True)

    input_path = os.path.join(job_dir, file.filename or "input.pdf")
    output_filename = f"processed_{file.filename or 'document.pdf'}"
    output_path = os.path.join(job_dir, output_filename)

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    parsed_options = json.loads(options) if options else {}

    # Register initial job status
    JOBS_STORE[job_id] = {
        "id": job_id,
        "action": action,
        "status": "processing",
        "progress": 10,
        "input_path": input_path,
        "output_path": output_path,
        "output_filename": output_filename,
        "result": None,
        "error": None,
    }

    try:
        # Execute task (with RQ queue or local direct execution)
        if action == "compress":
            quality = parsed_options.get("quality", "recommended")
            result = compress_pdf_task(input_path, output_path, quality)
        elif action == "protect":
            password = parsed_options.get("password", "")
            if not password:
                raise ValueError("Password is required for protection")
            result = protect_pdf_task(input_path, output_path, password)
        elif action == "unlock":
            password = parsed_options.get("password", "")
            result = unlock_pdf_task(input_path, output_path, password)
        elif action == "repair":
            result = repair_pdf_task(input_path, output_path)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported action: {action}")

        JOBS_STORE[job_id]["status"] = "finished"
        JOBS_STORE[job_id]["progress"] = 100
        JOBS_STORE[job_id]["result"] = result

        return {
            "job_id": job_id,
            "status": "finished",
            "message": "Processing completed successfully",
            "result": result,
        }

    except Exception as e:
        JOBS_STORE[job_id]["status"] = "failed"
        JOBS_STORE[job_id]["error"] = str(e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{job_id}/status")
def get_job_status(job_id: str):
    job = JOBS_STORE.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "job_id": job["id"],
        "status": job["status"],
        "progress": job["progress"],
        "result": job["result"],
        "error": job["error"],
    }

@router.get("/{job_id}/download")
def download_job_result(job_id: str):
    job = JOBS_STORE.get(job_id)
    if not job or job["status"] != "finished":
        raise HTTPException(status_code=404, detail="Processed file not available")

    output_path = job["output_path"]
    if not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="Output file not found on disk")

    return FileResponse(
        path=output_path,
        filename=job["output_filename"],
        media_type="application/pdf",
    )
