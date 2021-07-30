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
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  }
});

//filer files for image only
const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//upload image using multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

// const upload = multer({dest: 'uploads/'})

app.post("/api/create", async (req, res) => {
  const { description, title,date,imgData } = req.body;
  //console.log(req);
  try{
    //for upload images in cloudinary
    const uploadResponse = await cloudinary.uploader.upload(imgData, {
    upload_preset: 'Sports_Blog_upload',
    });
    console.log(uploadResponse);

    const newdata = new data_Collection({
      imgURL : uploadResponse.secure_url,
      description,
      title,
      date,
    });
  
    newdata
      .save()
      .then((data) => {
        res.status(201).json({
           msg: "Created Sucessfully",
           product:{
             data
           }
          })
      })
      .catch((err) => res.status(404).json({ msg: err.msg }));

  }catch(e){
    console.error(e);
    return res.status(500).json({ err: 'Something went wrong' });
  }
});

app.get("/api/get", (req, res) => {
  data_Collection
    .find()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(404).json({ msg: err.msg }));
});
app.get("/api/get/:id", (req, res) => {
  const id = req.params.id;
  data_Collection
    .findById(id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(404).json({ msg: err.msg }));
});

app.post("/api/register", async (req, res) => {
  try {
    const { firstname, lastname, password, email, isAdmin } = req.body;
    const existingUser = await user_Collection.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ msg: "User account already exists", });
    }

    const salt = await bcrypt.genSalt();
    const passwordhash = await bcrypt.hash(password, salt);
    const newUser = new user_Collection({
      firstname,
      lastname,
      email,
      password: passwordhash,
    });
    // console.log('newUser')
    // console.log(newUser)
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await user_Collection.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ msg: "User account does not exists" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    res.json({
      id: user._id,
      name: user.firstname,
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

app.delete("/api/delete/:id", (req, res) => {
  const id = req.params.id;
  data_Collection
    .findByIdAndRemove(id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(404).json({ msg: err.msg }));
});

app.listen(port, () => console.log(`App listen on port ${port}`));
