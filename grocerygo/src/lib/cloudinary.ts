import { v2 as cloudinary } from 'cloudinary'

const uploadOnCloudinary = async (file: Blob): Promise<string | null> => {
  if (!file) return null;

  // ✅ Config inside the function — runs at call time, not module load time
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("Missing Cloudinary env variables");
    return null;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve(result?.secure_url ?? null);
          }
        }
      );
      uploadStream.end(buffer);
    });

  } catch (error) {
    console.error("uploadOnCloudinary error:", error);
    throw error;
  }
}

export default uploadOnCloudinary;