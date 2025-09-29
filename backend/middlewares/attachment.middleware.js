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
});

const attachmentMiddleware = upload.fields([
  { name: "images", maxCount: 3 },
  { name: "pdf", maxCount: 1 },
]);

export { attachmentMiddleware };
