import { describe, it, expect } from 'vitest';
import { dataUrlToBlob } from './logic';

describe('PDF to JPG Tool', () => {
  it('converts base64 data URLs to valid binary Blobs with proper MIME type', () => {
    // 1x1 png data url
    const testDataUrl =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const blob = dataUrlToBlob(testDataUrl);
    expect(blob.type).toBe('image/png');
    expect(blob.size).toBeGreaterThan(0);
  });
});
