const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const Instructors = require("../models/instructor");
//const { fileStorage } = require("../middleware/storage");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/png"
  ) {
    cb(null, true);
  } else {
    console.log("only jpg and png is supported");
    cb(null, false);
  }
  limits: {
    filesize: 1024 * 1024 * 2;
  }
};

router.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

/*API REQUESTS START HERE*/

router.get("/all", async (req, res) => {
  const instructor = await Instructors.find();
  return res.json(instructor);
});

///POST REQUEST
router.post(
  "/create",
  [
    check("name", "name is required").not().isEmpty(),
    check("email", "email is required").isEmail(),
    check("phoneNo", "phone Number is required").isMobilePhone(),
    check("specialization", "specialization is required").not().isEmpty(),
  ],
  async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    
    console.log(req.body);
    

    const { name, email, phoneNo, specialization, linkedin } = req.body;

    const image = req.file;

    console.log(image);
    if (!image) {
      res
        .status(422)
        .json("Wrong file type. Please upload images of jpg/jpeg/png format");
    }

    const instructor = new Instructors({
      name: name,
      email: email,
      phoneNo: phoneNo,
      specialization: specialization,
      linkedin: linkedin,
      image: image.path,
    });

    instructor.save((err, instructor) => {
      if (err) {
      
        res.status(err.status || 500).json(err.message);
      } else {
        console.log("Successfully added");
        res.status(201).json(instructor);
      }
    });
  }
);

router.post(
  "/delete",
  [check("_id", "User Must be served to be deleted").not().isEmpty()],
  async (req, res) => {
    const { _id } = req.body;
    Instructors.deleteOne({_id:_id}, (err, result)=>{
        console.log("error",err)
        console.log("result",result);
        if(!err){
            res.status(200).json("Successfully deleted");
        }else{
            res.status(400).json("Delete process stopped unexpectedly");
        }
    })
  }
);

module.exports = router;
