import express from "express";
import User from "../model/User.js";
import jwt from "jsonwebtoken";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

router.post("/register", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Request body is missing" });
    }
    // console.log("req", req.body);
    const { email, username, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing Requirements" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be greater than 6" });
    }

    // const existingUser = await User.findOne({$or: [{email},{username}]});

    // if (existinguser) return res.status(400).json({message: "User already exists"})

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    const user = new User({
      email,
      username,
      password,
      profileImage,
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Error in saving: ", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.post("/login", async (req, res) => {
  //   res.send("login");
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credential" });

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credential" });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
        beautician: user.beautician_id,
      },
    });
  } catch (error) {
    console.log("Error in saving: ", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.get("/", protectRoute, async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "Missing id" });
    }

    const user = await User.findOne({ _id: id }).lean();
    if (user) {
      res.send({ message: "Authenticated " });
    } else {
      res.send({ message: "No user found" });
    }
  } catch (error) {
    console.log("Error getting user: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
