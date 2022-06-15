const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const SiteImage = require("../models/siteImage");
const multer = require("multer");
const bodyFields = multer();
let fileUnsupported = false;
const Upload = require("../middleware/upload");


router.get("/all", async (req, res) => {
    const siteImage = await SiteImage.find().sort({_id:-1});
    return res.json(siteImage);
  });
  
  router.get("/getOne/:location", async (req, res) => {
    
    console.log(req.params)
    const query = {location: req.params.location}
    SiteImage.findOne(query, (err, result)=>{
      
      if(!err){
        
        res.status(200).json(result);
      }else{
        console.log(err)
        res.status(500).json("Server Error");
      }
    })
  })
  /*
  without using Multer through bodyFields req.body isn't showing any data. so I had to do it...
  */
  router.post(
    "/delete",
    bodyFields.fields([]),
    [check("_id", "Site Image Must be selected to be deleted").not().isEmpty()],
    async (req, res) => {
      const { _id } = req.body;
      console.log(_id);
      SiteImage.deleteOne({ _id: _id }, (err, result) => {
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
    Upload.array("file"),
    [
      check("location", "Location is required").not().isEmpty(),
    ],
    async (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
  
      console.log(req.body);
  
      const { location, details } = req.body;
  
      const files = req.files;
  
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
        const siteImage = new SiteImage({
          location: location,
          file: fileNames ? fileNames : [],
          details: details
        });
  
        siteImage.save((err, courses) => {
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
  