const express = require("express");
const { cloudinary } = require('./utils/cloudinary_config');
const path = require('path');
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const bcrypt = require("bcryptjs");
const connectMultiparty = require("connect-multiparty");
const port = process.env.PORT ||7000;
app.use(express.json());
app.use('/uploads', express.static('uploads'));
//app.use(express.static(__dirname))
const { user_Collection, data_Collection } = require("./connector");
const bodyParser = require("body-parser");
var cors = require("cors");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
//app.use(connectMultiparty());
const multer = require('multer'); //for file read


app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');

  next();
})


//renaming & store the each upload image with date&time
// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function(req, file, cb) {
//     cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
//   }
// });

// //filer files for image only
// const fileFilter = (req, file, cb) => {
//   // reject a file
//   if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

// //upload image using multer
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 1024 * 1024 * 5
//   },
//   fileFilter: fileFilter
// });

// const upload = multer({dest: 'uploads/'})





app.use('/article', require('./routes/articleRoutes'))
app.use('/user', require('./routes/userRoutes'))


//start the server locally
app.listen(port, () => console.log(`App listen on port ${port}`));
