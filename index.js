const express = require('express');
const morgan = require('morgan');

const bodyParser = require('body-parser');
const app = express();
const { check, validationResult } = require("express-validator");
const auth = require("./middleware/auth");


app.use(bodyParser.json());

require('dotenv').config({
    path: './config/index.env'
});
 const cors = require ('cors');
// app.use(cors({
//     origin:['http://wholesalebd.info:3000'],
//     credentials:true
// }));

const connectionDB = require("./config/db");
connectionDB();

app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const corsOpts = {
    origin: '*',
  
    methods: [
      'GET',
      'POST',
    ]
  };
app.use(cors(corsOpts));

app.use("/api/user/", require("./routes/auth.route"));
app.use("/category/", require("./routes/category.route"));
app.use("/instructor/", require("./routes/instructor.route"));
app.use("/notice", require("./routes/notice.route"));
app.use("/courses", require("./routes/courses.route"));
app.use("/images", express.static("uploads"));
app.use("/partners", require("./routes/partners.route"));
app.post("/contactUs", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const data = req.body;
  console.log(data);

  if (
    req.body.name == undefined ||
    req.body.email == undefined ||
    req.body.phone == undefined ||
    req.body.description == undefined
  ) {
    return res.status(400).json({
      error: "All Fields are required.",
    });
  }
  let contact = new Contact(data);
  try {
    await contact.save();
    res.json("contact saved Successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
});

app.get("/", function (req, res) {
  res.send("hello home");
});
app.use((req, res) => {
  res.status(404).json({
    message: "Page Not Found !!!",
  });
});
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("listening on port:" + PORT);
});
