const express = require("express");
const multer = require("multer");
const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 25 }, // 20MB/file, max 25 files
});

// POST /api/uploads/cloudinary/single   (field: "file")
router.post("/cloudinary/single", upload.single("file"), async (req, res) => {
  // #swagger.tags = ['Uploads']
  try {
    if (!req.file) return res.status(400).json({ message: "No file received" });
    const folder = (req.body.folder || "nif_students").trim();
    const tags = String(req.body.tags || "")
      .split(",").map((t) => t.trim()).filter(Boolean);

    const r = await uploadBufferToCloudinary(req.file.buffer, {
      folder, tags, resource_type: "auto", use_filename: true, unique_filename: true, overwrite: false,
    });

    res.json({
      uploaded: 1,
      files: [{
        originalName: req.file.originalname,
        public_id: r.public_id,
        secure_url: r.secure_url,
        resource_type: r.resource_type,
        format: r.format,
        bytes: r.bytes,
        width: r.width,
        height: r.height,
      }],
    });
  } catch (e) {
    console.error("Cloudinary single upload error:", e);
    res.status(500).json({ message: "Upload failed", error: e.message });
  }
});

// POST /api/uploads/cloudinary/bulk     (field: "files")
router.post("/cloudinary/bulk", upload.array("files", 25), async (req, res) => {
  // #swagger.tags = ['Uploads']
  try {
    if (!req.files?.length) return res.status(400).json({ message: "No files received" });

    const folder = (req.body.folder || "nif_students").trim();
    const tags = String(req.body.tags || "")
      .split(",").map((t) => t.trim()).filter(Boolean);

    const files = await Promise.all(
      req.files.map(async (f) => {
        const r = await uploadBufferToCloudinary(f.buffer, {
          folder, tags, resource_type: "auto", use_filename: true, unique_filename: true, overwrite: false,
        });
        return {
          originalName: f.originalname,
          public_id: r.public_id,
          secure_url: r.secure_url,
          resource_type: r.resource_type,
          format: r.format,
          bytes: r.bytes,
          width: r.width,
          height: r.height,
        };
      })
    );

    res.json({ uploaded: files.length, files });
  } catch (e) {
    console.error("Cloudinary bulk upload error:", e);
    res.status(500).json({ message: "Cloudinary bulk upload failed", error: e.message });
  }
});

module.exports = router;
