import axios from "axios";

export const uploadToCloudinary = async (
  file: File | Blob,
  fileName = "image",
  cloudName: string,
  uploadPreset: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("public_id", `${fileName}-${Date.now()}`);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );
    return response.data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
};

export const enhanceImage = async (
  url: string,
  cloudName: string,
  uploadPreset: string
): Promise<string> => {
  try {
    // Call Ryzen API to enhance the image
    const response = await axios.get(
      `https://api.ryzendesu.vip/api/ai/remini?url=${encodeURIComponent(url)}`,
      {
        responseType: "arraybuffer",
      }
    );

    // Convert to Blob and upload to Cloudinary
    const blob = new Blob([response.data], {
      type: response.headers["content-type"] || "image/jpeg",
    });

    return await uploadToCloudinary(blob, "enhanced", cloudName, uploadPreset);
  } catch (err) {
    console.error("Error enhancing image:", err);
    throw new Error("Failed to enhance image");
  }
};
