const cloudinary = require("cloudinary").v2;
require("dotenv").config({ path: "./config/config.env" });


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const upload = (req, res, next) => {
  try {
    const file = "data:image/jpeg;base64," + req.body.image;
    cloudinary.uploader
      .upload(file)
      .then((result) => {
        req.pp = result;
        next();
      })
      .catch((e) => {
        return res
          .status(400)
          .json({ status: "failed", error: e, message: "error has occured" });
      });
  } catch (e) {
    return res.status(400).json({
      status: "failed",
      error: e,
      message: "req.files.avatar is not found / Error has been occured",
    });
  }
};

module.exports = { upload };
