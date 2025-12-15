const express = require("express");
const multer = require("multer");
const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per file
    files: 25,
  },
});

router.post("/cloudinary/bulk", upload.array("files", 25), async (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: "No files received" });
    }

    const folder = (req.body.folder || "nif_students").trim();
    const tags = (req.body.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const uploaded = await Promise.all(
      req.files.map(async (file) => {
        const r = await uploadBufferToCloudinary(file.buffer, {
          folder,
          tags,
          use_filename: true,
          unique_filename: true,
        });

        return {
          originalName: file.originalname,
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

    return res.status(200).json({ uploaded: uploaded.length, files: uploaded });
  } catch (err) {
    console.error("Cloudinary bulk upload error:", err);
    return res.status(500).json({
      message: "Cloudinary bulk upload failed",
      error: err.message,
    });
  }
});

module.exports = router;
