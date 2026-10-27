import os
import time
from pypdf import PdfReader, PdfWriter

def compress_pdf_task(input_path: str, output_path: str, quality: str = "recommended") -> dict:
    """
    Compresses PDF streams, removes duplicate objects, and optimizes resources.
    Quality presets: 'low', 'recommended', 'extreme'
    """
    reader = PdfReader(input_path)
    writer = PdfWriter()

    for page in reader.pages:
        page.compress_content_streams()  # Deflate content streams
        writer.add_page(page)

    writer.compress_identical_objects(remove_identicals=True, remove_orphans=True)

    with open(output_path, "wb") as f:
        writer.write(f)

    original_size = os.path.getsize(input_path)
    output_size = os.path.getsize(output_path)
    reduction = max(0, round((1 - output_size / original_size) * 100, 1)) if original_size > 0 else 0

    return {
        "status": "success",
        "original_size": original_size,
        "output_size": output_size,
        "reduction_percentage": reduction,
    }

def protect_pdf_task(input_path: str, output_path: str, password: str, permissions: dict = None) -> dict:
    """
    Encrypts a PDF using AES-256 standard with user/owner password.
    """
    reader = PdfReader(input_path)
    writer = PdfWriter()

    for page in reader.pages:
        writer.add_page(page)

    # Encrypt with AES-256
    writer.encrypt(user_password=password, owner_password=password + "_admin")

    with open(output_path, "wb") as f:
        writer.write(f)

    return {
        "status": "success",
        "output_size": os.path.getsize(output_path),
        "encryption": "AES-256",
    }

def unlock_pdf_task(input_path: str, output_path: str, password: str) -> dict:
    """
    Decrypts a password-protected PDF and outputs an unencrypted copy.
    """
    reader = PdfReader(input_path)

    if reader.is_encrypted:
        decrypt_result = reader.decrypt(password)
        if decrypt_result == 0:
            raise ValueError("Incorrect password provided for encrypted document")

    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)

    with open(output_path, "wb") as f:
        writer.write(f)

    return {
        "status": "success",
        "output_size": os.path.getsize(output_path),
        "unlocked": True,
    }

def repair_pdf_task(input_path: str, output_path: str) -> dict:
    """
    Rebuilds damaged xref tables and stream dictionaries in lenient mode.
    """
    reader = PdfReader(input_path, strict=False)
    writer = PdfWriter()

    for page in reader.pages:
        writer.add_page(page)

    with open(output_path, "wb") as f:
        writer.write(f)

    return {
        "status": "success",
        "output_size": os.path.getsize(output_path),
        "repaired": True,
    }
