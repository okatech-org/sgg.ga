/**
 * SGG Digital - Google Cloud Storage Configuration
 * Configuration for file storage and management
 */

import { Storage, Bucket, File, GetSignedUrlConfig } from '@google-cloud/storage';

// Initialize Cloud Storage client
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID || 'sgg-digital-gabon',
});

// Bucket names from environment
const BUCKETS = {
  documents: process.env.GCS_BUCKET_DOCUMENTS || 'sgg-documents-prod',
  uploads: process.env.GCS_BUCKET_UPLOADS || 'sgg-uploads-prod',
  backups: process.env.GCS_BUCKET_BACKUPS || 'sgg-backups-prod',
} as const;

type BucketType = keyof typeof BUCKETS;

/**
 * Get a bucket reference
 */
export function getBucket(type: BucketType): Bucket {
  return storage.bucket(BUCKETS[type]);
}

/**
 * Upload a file to storage
 */
export async function uploadFile(
  bucketType: BucketType,
  filePath: string,
  fileBuffer: Buffer,
  options: {
    contentType?: string;
    metadata?: Record<string, string>;
    public?: boolean;
  } = {}
): Promise<{ url: string; gcsUri: string }> {
  const bucket = getBucket(bucketType);
  const file = bucket.file(filePath);

  await file.save(fileBuffer, {
    contentType: options.contentType || 'application/octet-stream',
    metadata: {
      metadata: options.metadata,
    },
    public: options.public || false,
  });

  const url = options.public
    ? `https://storage.googleapis.com/${BUCKETS[bucketType]}/${filePath}`
    : await getSignedUrl(bucketType, filePath, 'read', 3600);

  return {
    url,
    gcsUri: `gs://${BUCKETS[bucketType]}/${filePath}`,
  };
}

/**
 * Download a file from storage
 */
export async function downloadFile(
  bucketType: BucketType,
  filePath: string
): Promise<Buffer> {
  const bucket = getBucket(bucketType);
  const file = bucket.file(filePath);
  const [contents] = await file.download();
  return contents;
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  bucketType: BucketType,
  filePath: string
): Promise<void> {
  const bucket = getBucket(bucketType);
  const file = bucket.file(filePath);
  await file.delete();
}

/**
 * Check if a file exists
 */
export async function fileExists(
  bucketType: BucketType,
  filePath: string
): Promise<boolean> {
  const bucket = getBucket(bucketType);
  const file = bucket.file(filePath);
  const [exists] = await file.exists();
  return exists;
}

/**
 * Get file metadata
 */
export async function getFileMetadata(
  bucketType: BucketType,
  filePath: string
): Promise<{
  name: string;
  size: number;
  contentType: string;
  created: Date;
  updated: Date;
  metadata: Record<string, string>;
}> {
  const bucket = getBucket(bucketType);
  const file = bucket.file(filePath);
  const [metadata] = await file.getMetadata();

  return {
    name: metadata.name || '',
    size: parseInt(metadata.size as string, 10) || 0,
    contentType: metadata.contentType || '',
    created: new Date(metadata.timeCreated || ''),
    updated: new Date(metadata.updated || ''),
    metadata: (metadata.metadata as Record<string, string>) || {},
  };
}

/**
 * Generate a signed URL for temporary access
 */
export async function getSignedUrl(
  bucketType: BucketType,
  filePath: string,
  action: 'read' | 'write',
  expiresInSeconds: number = 3600
): Promise<string> {
  const bucket = getBucket(bucketType);
  const file = bucket.file(filePath);

  const options: GetSignedUrlConfig = {
    version: 'v4',
    action: action === 'read' ? 'read' : 'write',
    expires: Date.now() + expiresInSeconds * 1000,
  };

  const [url] = await file.getSignedUrl(options);
  return url;
}

/**
 * Generate a signed URL for resumable upload
 */
export async function getUploadUrl(
  bucketType: BucketType,
  filePath: string,
  contentType: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  const bucket = getBucket(bucketType);
  const file = bucket.file(filePath);

  const options: GetSignedUrlConfig = {
    version: 'v4',
    action: 'resumable',
    expires: Date.now() + expiresInSeconds * 1000,
    contentType,
  };

  const [url] = await file.getSignedUrl(options);
  return url;
}

/**
 * List files in a directory
 */
export async function listFiles(
  bucketType: BucketType,
  prefix: string,
  maxResults: number = 100
): Promise<Array<{
  name: string;
  size: number;
  updated: Date;
}>> {
  const bucket = getBucket(bucketType);
  const [files] = await bucket.getFiles({
    prefix,
    maxResults,
  });

  return files.map((file) => ({
    name: file.name,
    size: parseInt(file.metadata.size as string, 10) || 0,
    updated: new Date(file.metadata.updated || ''),
  }));
}

/**
 * Copy a file to another location
 */
export async function copyFile(
  sourceBucket: BucketType,
  sourceFile: string,
  destBucket: BucketType,
  destFile: string
): Promise<void> {
  const source = getBucket(sourceBucket).file(sourceFile);
  const destination = getBucket(destBucket).file(destFile);
  await source.copy(destination);
}

/**
 * Move a file to another location
 */
export async function moveFile(
  sourceBucket: BucketType,
  sourceFile: string,
  destBucket: BucketType,
  destFile: string
): Promise<void> {
  await copyFile(sourceBucket, sourceFile, destBucket, destFile);
  await deleteFile(sourceBucket, sourceFile);
}

/**
 * Generate a unique file path
 */
export function generateFilePath(
  directory: string,
  originalName: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || '';
  const safeName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 50);

  return `${directory}/${timestamp}-${random}-${safeName}.${extension}`;
}

// Export storage client for advanced use cases
export { storage };
