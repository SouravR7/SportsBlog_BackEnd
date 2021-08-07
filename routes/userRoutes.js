let express = require('express');
let router = express.Router();
const bcrypt = require("bcryptjs");

const { user_Collection, data_Collection } = require("../connector");

router.post("/api/register", async (req, res) => {
    try {
      const { firstname, lastname, password, email, isAdmin } = req.body;
      const existingUser = await user_Collection.findOne({ email: email });
      if (!existingUser) {
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
  
  router.post("/api/login", async (req, res) => {
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

  router.get("/api/getAllUsers", async (req, res) => {
    try{
        let allUsers = await user_Collection.find();

        if (!allUsers) {
            return res.status(400).json({ msg: "No Records found" });
          }
    
        let userMap = allUsers.map((users)=>{
            return {
                firstname: users.firstname,
                lastname: users.lastname,
                isAdmin: users.isAdmin,
                email : users.email,
            }
        })

        res.json(userMap)

    } catch{
        res.status(500).json({ err: err.message });
    }
  })

  router.put("/updateUser",async (req, res)=>{
    const {email , value} = req.body;
    try{
      const existingUser = await user_Collection.findOne({email: email});
      if(!existingUser){
        res.status(400).json({ err: "User not found !!!" });
      }

      existingUser.isAdmin = value;

      const saveData = await existingUser.save();
    
      res.json({msg: "User access updated"});

    }catch(err){
      res.status(500).json({ err: err.message });
    }
  })

  module.exports = router;