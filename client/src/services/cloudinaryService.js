const CLOUD_NAME = "zf9agfbc";
const UPLOAD_PRESET = "tail_tracker";

export const uploadImage = async (imageFile) => {
  const formData = new FormData();

  formData.append("file", imageFile);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  const data = await response.json();

  return data.secure_url;
};