import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth } from '../../../src/lib/auth'; // Your auth function

// Configure Cloudinary with your credentials from .env
// Cloudinary supports a single CLOUDINARY_URL env var or individual vars.
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL, secure: true });
} else {
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

if (!process.env.CLOUDINARY_URL && !(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)) {
  console.warn('Cloudinary: no CLOUDINARY_URL or individual cloud_name/api_key/api_secret found in env — uploads will fail');
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define the type for Cloudinary upload result
    interface CloudinaryUploadResult {
      secure_url: string;
      [key: string]: unknown;
    }

    // Upload to Cloudinary
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default';

  const uploadResult: CloudinaryUploadResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "hackathon_images", upload_preset: uploadPreset }, // Use preset (falls back to ml_default)
      (error, result) => {
        if (error) reject(error);
        resolve(result as CloudinaryUploadResult);
      }
    );
    uploadStream.end(buffer);
  });

    return NextResponse.json({ success: true, url: uploadResult.secure_url });

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}