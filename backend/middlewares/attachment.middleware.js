import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./temp/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB (biggest case, pdf)
  },
  fileFilter: (req, file, cb) => {
    // images: allow only image mime types
    if (file.fieldname === "images") {
      if (file.mimetype.startsWith("image/")) {
        return cb(null, true);
      } else {
        return cb(
          new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname)
        );
      }
    }

    // pdf: allow only application/pdf
    if (file.fieldname === "pdf") {
      if (file.mimetype === "application/pdf") {
        return cb(null, true);
      } else {
        return cb(
          new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname)
        );
      }
    }

    // unexpected field name
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  },
});

const attachmentMiddleware = upload.fields([
  { name: "images", maxCount: 3 },
  { name: "pdf", maxCount: 1 },
]);

export { attachmentMiddleware };
