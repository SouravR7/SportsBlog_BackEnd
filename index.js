const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const port = 7000;
app.use(express.json());
const { user_Collection, data_Collection } = require("./connector");
const bodyParser = require("body-parser");
var cors = require("cors");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.post("/api/create", (req, res) => {
  const { imgURL, description, title } = req.body;

  const newdata = new data_Collection({
    imgURL,
    description,
    title,
    date,
  });

  newdata
    .save()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(404).json({ msg: err.msg }));
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
      return res.status(400).json({ msg: "User account already exists" });
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
