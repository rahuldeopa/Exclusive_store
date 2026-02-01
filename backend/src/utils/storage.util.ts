import { supabase } from '../config/supabase';
import { env } from '../config/env';

export async function getSignedMediaUrl(objectKey: string) {
  const { data, error } = await supabase
    .storage
    .from(env.SUPABASE_BUCKET)
    .createSignedUrl(objectKey, 1200); // 5 minutes

  if (error) {
    console.error('Supabase signed URL error:', error);
    throw new Error('Failed to generate signed URL');
  }

  return data.signedUrl;
}

export async function uploadFileToSupabase(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  // Determine folder
  const folder = mimeType.startsWith('image') ? 'images' : 
                 mimeType.startsWith('video') ? 'videos' : 
                 mimeType.startsWith('audio') ? 'audio' : 'misc';
                 
  // Create a unique path: folder/timestamp-filename
  const path = `${folder}/${Date.now()}-${fileName}`;

  const { data, error } = await supabase
    .storage
    .from(env.SUPABASE_BUCKET)
    .upload(path, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error('Failed to upload file');
  }

  return data.path;
}

export async function deleteFileFromSupabase(path: string): Promise<void> {
  console.log(`Attempting to delete file from Supabase: bucket=${env.SUPABASE_BUCKET}, path=${path}`);
  const { data, error } = await supabase
    .storage
    .from(env.SUPABASE_BUCKET)
    .remove([path]);

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error('Failed to delete file');
  }

  if (!data || data.length === 0) {
      console.warn(`WARNING: Supabase returned no deleted files for path: ${path}. File might not exist or path is incorrect.`);
  } else {
      console.log('Supabase file deleted successfully:', data);
  }
}
