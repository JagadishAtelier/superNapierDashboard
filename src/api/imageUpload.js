import axios from "axios";

const CLOUD_NAME = "dxm28ujz3";
const UPLOAD_PRESET = "unsigned_products";

export const uploadToCloudinary = async (file, folder = "products", onProgress = () => {}) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    formData,
    {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      },
    }
  );

  return res.data.secure_url;
};
