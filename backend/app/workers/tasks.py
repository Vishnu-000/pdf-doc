import time

def example_pdf_task(task_name: str, payload: dict):
    """
    Example background worker task for future Phase 2/3 heavy server operations
    (e.g., OCR, complex compression, Office conversions).
    """
    print(f"Starting task: {task_name}")
    time.sleep(2)
    print(f"Completed task: {task_name}")
    return {"status": "success", "task_name": task_name}
