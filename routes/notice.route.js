const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const Notice = require("../models/notice");
//const { fileStorage } = require("../middleware/storage");
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
    file.mimetype == "image/png" ||
    file.mimetype == "application/pdf"
  ) {
    fileUnsupported = false;
    cb(null, true);
  } else {
    console.log("only jpg/jpeg/png and pdf is supported");
    fileUnsupported = true;
    cb(null, false);
  }
  limits: {
    filesize: 1024 * 1024 * 2;
  }
};

router.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("file")
);

/*API REQUESTS START HERE*/

router.get("/all", async (req, res) => {
  const notice = await Notice.find().sort({_id:-1});
  return res.json(notice);
});

router.get("/getOne/:id", async (req, res) => {
  
  console.log(req.params)
  const query = {_id: req.params.id}
  Notice.findOne(query, (err, result)=>{
    
    if(!err){
      console.log(result)
      res.status(200).json(result);
    }else{
      console.log(err)
      res.status(500).json("Server Error");
    }
  })
})


///POST REQUEST
router.post(
  "/create",
  [
    check("title", "title is required").not().isEmpty(),
    check("description", "description is required").not().isEmpty(),
  ],
  async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    console.log(req.body);

    const { title, description } = req.body;

    const file = req.file;

    console.log(req.file);
    if (fileUnsupported) {
      res.status(422).json("only jpg/jpeg/png and pdf is supported");
    } else {
      try {
        const notice = new Notice({
          title: title,
          description: description,
          file: file ? file.filename : [],
          date: new Date().toString(),
        });

        notice.save((err, notice) => {
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
            res.status(201).json(notice);
          }
        });
      } catch (err) {
        console.log(err);
      }
    }
  }
);
//delete request
router.post(
  "/delete",
  [check("_id", "Notice Must be selected to be deleted").not().isEmpty()],
  async (req, res) => {
    const { _id } = req.body;
    Notice.deleteOne({ _id: _id }, (err, result) => {
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



router.post(
  "/update",
  [check("_id", "Notice Must be selected to be updated").not().isEmpty()],
  async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    console.log(req.body);
    const { _id, title, description } = req.body;

    const file = req.file;
    console.log(req.file);

    if (fileUnsupported) {
      res.status(422).json("only jpg/jpeg/png and pdf is supported");
    } else {
      try {
        const query = [{ _id: _id }];
        Notice.findOneAndUpdate(
          query,
          {
            title: title,
            description: description,
          },
          { returnNewDocument: true },
          (err, notice) => {
            if (err) {
              console.log(err);
            } else {
              
            }
          }
        );
      } catch (err) {
        console.log(err);
      }
    }
  }
);

module.exports = router;
