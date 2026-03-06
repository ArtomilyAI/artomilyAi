import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

/**
 * Storage Service - Handles file storage using Supabase Storage (S3-compatible API)
 *
 * Supabase Storage exposes an S3-compatible API, so we use the AWS SDK S3 client.
 * Generated media (images, videos) from AI models are downloaded from their
 * temporary URLs and permanently stored in Supabase Storage.
 */

// Supabase S3-compatible config read from environment variables
const getS3Client = () => {
  const endpoint = process.env.SUPABASE_STORAGE_ENDPOINT
  const region = process.env.SUPABASE_STORAGE_REGION || 'ap-southeast-1'
  const accessKeyId = process.env.SUPABASE_STORAGE_ACCESS_KEY_ID
  const secretAccessKey = process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    return null
  }

  return new S3Client({
    forcePathStyle: true,
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

// Bucket names
const IMAGE_BUCKET = process.env.SUPABASE_STORAGE_IMAGE_BUCKET || 'generations-images'
const VIDEO_BUCKET = process.env.SUPABASE_STORAGE_VIDEO_BUCKET || 'generations-videos'

export type StorageFileType = 'image' | 'video'

export interface UploadResult {
  success: boolean
  url?: string
  storagePath?: string
  error?: string
}

export class StorageService {
  /**
   * Download a file from a URL and upload it to Supabase Storage.
   * Returns the permanent public URL stored in Supabase.
   */
  static async uploadFromUrl(
    sourceUrl: string,
    fileType: StorageFileType,
    generationId: string,
    userId: string
  ): Promise<UploadResult> {
    const client = getS3Client()

    if (!client) {
      console.warn('Supabase Storage not configured — skipping upload, returning original URL')
      return { success: true, url: sourceUrl }
    }

    try {
      // Download the file from the AI provider's temporary URL
      const response = await fetch(sourceUrl)
      if (!response.ok) {
        throw new Error(`Failed to download file from source: ${response.status} ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type') || inferContentType(fileType, sourceUrl)
      const fileExtension = inferExtension(contentType, fileType)
      const buffer = Buffer.from(await response.arrayBuffer())

      const bucket = fileType === 'video' ? VIDEO_BUCKET : IMAGE_BUCKET
      const storagePath = `${userId}/${generationId}/${Date.now()}.${fileExtension}`

      // Upload to Supabase Storage via S3 API
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: storagePath,
          Body: buffer,
          ContentType: contentType,
          // Make files publicly readable (bucket policy must also allow this)
          ACL: 'public-read',
        })
      )

      // Build the public URL
      const publicUrl = buildPublicUrl(bucket, storagePath)

      console.log(`Uploaded ${fileType} to Supabase Storage: ${publicUrl}`)

      return {
        success: true,
        url: publicUrl,
        storagePath,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown upload error'
      console.error(`Storage upload error for generation ${generationId}:`, error)
      // Non-fatal: return the original URL so the generation is not lost
      return {
        success: false,
        url: sourceUrl,
        error: message,
      }
    }
  }

  /**
   * Upload raw buffer/text content directly (e.g. generated text as a file).
   */
  static async uploadBuffer(
    content: Buffer | string,
    contentType: string,
    filePath: string,
    bucket: string = IMAGE_BUCKET
  ): Promise<UploadResult> {
    const client = getS3Client()

    if (!client) {
      console.warn('Supabase Storage not configured — skipping buffer upload')
      return { success: false, error: 'Storage not configured' }
    }

    try {
      const body = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content

      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: filePath,
          Body: body,
          ContentType: contentType,
          ACL: 'public-read',
        })
      )

      const publicUrl = buildPublicUrl(bucket, filePath)

      return { success: true, url: publicUrl, storagePath: filePath }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('Storage buffer upload error:', error)
      return { success: false, error: message }
    }
  }

  /**
   * Delete a stored file by its storage path.
   */
  static async deleteFile(
    storagePath: string,
    fileType: StorageFileType
  ): Promise<{ success: boolean; error?: string }> {
    const client = getS3Client()

    if (!client) {
      return { success: false, error: 'Storage not configured' }
    }

    const bucket = fileType === 'video' ? VIDEO_BUCKET : IMAGE_BUCKET

    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: storagePath,
        })
      )
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('Storage delete error:', error)
      return { success: false, error: message }
    }
  }

  /**
   * Generate a temporary signed URL for private access (expires in 1 hour by default).
   */
  static async getSignedUrl(
    storagePath: string,
    fileType: StorageFileType,
    expiresInSeconds = 3600
  ): Promise<string | null> {
    const client = getS3Client()

    if (!client) return null

    const bucket = fileType === 'video' ? VIDEO_BUCKET : IMAGE_BUCKET

    try {
      const command = new GetObjectCommand({ Bucket: bucket, Key: storagePath })
      return await getSignedUrl(client, command, { expiresIn: expiresInSeconds })
    } catch (error) {
      console.error('Signed URL error:', error)
      return null
    }
  }

  /**
   * Check whether Supabase Storage is properly configured.
   */
  static isConfigured(): boolean {
    return !!(
      process.env.SUPABASE_STORAGE_ENDPOINT &&
      process.env.SUPABASE_STORAGE_ACCESS_KEY_ID &&
      process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY
    )
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function inferContentType(fileType: StorageFileType, url: string): string {
  if (fileType === 'video') return 'video/mp4'
  if (url.endsWith('.png')) return 'image/png'
  if (url.endsWith('.webp')) return 'image/webp'
  return 'image/jpeg'
}

function inferExtension(contentType: string, fallback: StorageFileType): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
  }
  return map[contentType] ?? (fallback === 'video' ? 'mp4' : 'jpg')
}

function buildPublicUrl(bucket: string, storagePath: string): string {
  // Format: https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`
  }
  // Fallback: construct from storage endpoint
  const endpoint = process.env.SUPABASE_STORAGE_ENDPOINT || ''
  // endpoint is like https://<ref>.storage.supabase.co/storage/v1/s3
  // public URL is https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const base = endpoint.replace('/storage/v1/s3', '').replace('.storage.supabase.co', '.supabase.co')
  return `${base}/storage/v1/object/public/${bucket}/${storagePath}`
}
