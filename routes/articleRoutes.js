let express = require("express");
let router = express.Router();

const { user_Collection, data_Collection } = require("../connector");
const { cloudinary } = require("../utils/cloudinary_config");
const multer = require("multer");

router.get("/api/get", (req, res) => {
  data_Collection
    .find()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(404).json({ msg: err.msg }));
});

router.get("/api/get/:id", (req, res) => {
  const id = req.params.id;
  data_Collection
    .findById(id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(404).json({ msg: err.msg }));
});

router.delete("/api/delete/:id", (req, res) => {
  const id = req.params.id;
  data_Collection
    .findByIdAndRemove(id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(404).json({ msg: err.msg }));
});

router.post("/api/create", async (req, res) => {
  const { description, title, date, imgData } = req.body;
  //console.log(req);
  try {
    //for upload images in cloudinary
    const uploadResponse = await cloudinary.uploader.upload(imgData, {
      upload_preset: "Sports_Blog_upload",
    });
    console.log(uploadResponse);

    const newdata = new data_Collection({
      imgURL: uploadResponse.secure_url,
      description,
      title,
      date,
    });

    newdata
      .save()
      .then((data) => {
        res.status(201).json({
          msg: "Created Sucessfully",
          product: {
            data,
          },
        });
      })
      .catch((err) => res.status(404).json({ msg: err.msg }));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ err: "Something went wrong" });
  }
});

module.exports = router;
