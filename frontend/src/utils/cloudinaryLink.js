export const getDownloadLink = (fileType, publicId) => {
  if (!fileType || !publicId) return;
  if (!fileType in ["pdf", "image"]) return;
  return `https://res.cloudinary.com/${
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  }/${fileType === "pdf" ? "raw" : "image"}/upload/fl_attachment/${publicId}`;
};

export const getThumbnailLink = (publicId, width = 200, height = 200) => {
  if (!publicId) return;
  return `https://res.cloudinary.com/${
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  }/image/upload/w_${width},h_${height},c_fill/${publicId}.jpg`;
};
