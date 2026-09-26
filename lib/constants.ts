/** Shared measurement protocol constants used by both the client engine and Edge handlers. */
export const DOWNLOAD_SIZE_BYTES = 16 * 1024 * 1024;
export const DOWNLOAD_CHUNK_BYTES = 64 * 1024;

if (DOWNLOAD_SIZE_BYTES % DOWNLOAD_CHUNK_BYTES !== 0) {
  throw new Error('DOWNLOAD_SIZE_BYTES must be divisible by DOWNLOAD_CHUNK_BYTES');
}
