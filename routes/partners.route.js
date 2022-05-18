const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const Partners = require("../models/partners");
const multer = require("multer");
let fileUnsupported = false;

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const ext = String(file.mimetype).split("/")[1];
    cb(null, Date.now() + "-" + Math.floor(Math.random() * 1e9) + "." + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/png" 
  ) {
    fileUnsupported = false;
    cb(null, true);
  } else {
    console.log("only jpg/jpeg/png and pdf is supported");
    fileUnsupported = true;
    cb(null, false);
  }
  limits: {
    filesize: 1024 * 1024 * 1;
  }
};

router.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("file")
);


router.get("/all", async (req, res) => {
  const partners = await Partners.find();
  return res.json(partners);
});
/*
without using Multer through bodyFields req.body isn't showing any data. so I had to do it...
*/


/**Work from here */
router.post(
  "/delete",
  [check("_id", "Partner Must be selected to be deleted").not().isEmpty()],
  async (req, res) => {
    const { _id } = req.body;
    console.log(_id);
    Partners.deleteOne({ _id: _id }, (err, result) => {
      console.log("error", err);
      console.log("result", result);
      if (!err) {
        res.status(200).json("Successfully deleted");
      } else {
        res.status(400).json("Delete process stopped unexpectedly");
      }
    });
  }
);

///POST REQUEST
router.post(
  "/create",
  [
    check("name", "Name is required").not().isEmpty(),
  ],
  async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    console.log(req.body);

    const { name } = req.body;

    const file = req.file;

    //console.log(req.file);
    console.log(req.file);
    // console.log(req);
    if (!file) {
      res
        .status(422)
        .json("Wrong file type. Please upload images of jpg/jpeg/png format");
    } else {
      //everything else
      const partners = new Partners({
        name: name,
        file: file ? file.filename : [],
        date: new Date().toString(),
      });

      partners.save((err, courses) => {
        if (err) {
          if (err.code === 11000) {
            res
              .status(500)
              .json("Duplicate Input. This entry has already been enlisted");
          } else {
            res.status(err.status || 500).json(err.message);
          }
        } else {
          console.log("Successfully added");
          res.status(201).json(courses);
        }
      });
    }
  }
);

module.exports = router;
