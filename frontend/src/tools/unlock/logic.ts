import { ToolExecutionProgress, ToolExecutionResult } from '../../registry/types';

export interface UnlockOptions {
  password: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Submits PDF decryption to backend API
 */
export async function executeUnlock(
  files: File[],
  options: UnlockOptions,
  onProgress: (p: ToolExecutionProgress) => void
): Promise<ToolExecutionResult> {
  if (files.length === 0) {
    throw new Error('Please select a PDF file to unlock');
  }

  const file = files[0];
  onProgress({ percentage: 20, message: 'Uploading document for decryption...' });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('action', 'unlock');
  formData.append('options', JSON.stringify({ password: options.password || '' }));

  const response = await fetch(`${API_BASE}/api/jobs/submit`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to unlock PDF. Please check the password.');
  }

  const data = await response.json();
  const jobId = data.job_id;

  onProgress({ percentage: 70, message: 'Stripping password security...' });

  const downloadRes = await fetch(`${API_BASE}/api/jobs/${jobId}/download`);
  if (!downloadRes.ok) {
    throw new Error('Failed to download unlocked PDF');
  }

  const blob = await downloadRes.blob();
  onProgress({ percentage: 100, message: 'Document unlocked!' });

  return {
    blob,
    filename: `${file.name.replace(/\.[^/.]+$/, '')}_unlocked.pdf`,
    mimeType: 'application/pdf',
    stats: {
      originalSize: file.size,
      outputSize: blob.size,
    },
  };
}
