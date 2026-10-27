import { ToolExecutionProgress, ToolExecutionResult } from '../../registry/types';

export interface ProtectOptions {
  password: string;
  confirmPassword?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Submits PDF protection to backend API
 */
export async function executeProtect(
  files: File[],
  options: ProtectOptions,
  onProgress: (p: ToolExecutionProgress) => void
): Promise<ToolExecutionResult> {
  if (files.length === 0) {
    throw new Error('Please select a PDF file to protect');
  }

  if (!options.password || options.password.length < 4) {
    throw new Error('Please enter a password with at least 4 characters');
  }

  if (options.confirmPassword && options.password !== options.confirmPassword) {
    throw new Error('Passwords do not match');
  }

  const file = files[0];
  onProgress({ percentage: 20, message: 'Uploading document for AES encryption...' });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('action', 'protect');
  formData.append('options', JSON.stringify({ password: options.password }));

  const response = await fetch(`${API_BASE}/api/jobs/submit`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to encrypt PDF file');
  }

  const data = await response.json();
  const jobId = data.job_id;

  onProgress({ percentage: 70, message: 'Applying AES-256 encryption...' });

  // Download encrypted file
  const downloadRes = await fetch(`${API_BASE}/api/jobs/${jobId}/download`);
  if (!downloadRes.ok) {
    throw new Error('Failed to download encrypted PDF');
  }

  const blob = await downloadRes.blob();
  onProgress({ percentage: 100, message: 'Document encrypted!' });

  return {
    blob,
    filename: `${file.name.replace(/\.[^/.]+$/, '')}_protected.pdf`,
    mimeType: 'application/pdf',
    stats: {
      originalSize: file.size,
      outputSize: blob.size,
    },
  };
}
