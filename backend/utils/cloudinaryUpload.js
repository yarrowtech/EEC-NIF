const cloudinary = require("./cloudinary");

// Why stream: avoids temp files & works with multer.memoryStorage
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", use_filename: true, unique_filename: true, overwrite: false, ...options },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}
module.exports = { uploadBufferToCloudinary };