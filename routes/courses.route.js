const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const bodyFields = multer();
const Courses = require("../models/courses");
//const { fileStorage } = require("../middleware/storage");
const Upload = require("../middleware/upload");

router.get("/all", async (req, res) => {
  const courses = await Courses.find();
  return res.json(courses);
});
/*
without using Multer through bodyFields req.body isn't showing any data. so I had to do it...
*/
router.post(
  "/delete",
  bodyFields.fields([]),
  [check("_id", "Notice Must be selected to be deleted").not().isEmpty()],
  async (req, res) => {
    const { _id } = req.body;
    console.log(_id);
    Courses.deleteOne({ _id: _id }, (err, result) => {
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
  Upload.array("files"),
  [
    check("name", "Name is required").not().isEmpty(),
    check("details", "Details is required").not().isEmpty(),
    check("price", "Price is required").not().isEmpty(),
    check("rating", "Rating is required").not().isEmpty(),
    check("category", "Category is required").not().isEmpty(),
  ],
  async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    console.log(req.body);

    const { name, details, price, rating, category, category_label } = req.body;

    const files = req.files;

    //console.log(req.file);
    console.log(req.files);
    // console.log(req);
    if (!files) {
      res
        .status(422)
        .json("Wrong file type. Please upload images of jpg/jpeg/png format");
    } else {
      //everything else
      const fileNames = [];
      files.map((file) => {
        fileNames.push(file.filename);
      });
      console.log(fileNames);
      const courses = new Courses({
        name: name,
        details: details,
        price: price,
        rating: rating,
        category: category,
        category_label: category_label,
        files: fileNames ? fileNames : [],
        date: new Date().toString(),
      });

      courses.save((err, courses) => {
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

router.post("/update", bodyFields.fields([{}]), async (req, res) => {
  
  const { _id } = req.body;
  delete req.body._id;
  console.log(req.body);

  Courses.findOneAndUpdate({ _id: _id }, { $set: req.body } ,{returnNewDocument : true}, (err) => {
    console.log(err);
    if(!err){
      res.status(200).json(`Successfully Updated`);
    }
    else{
      res.status(500).json("Server Error");

    }
  });
});

module.exports = router;
