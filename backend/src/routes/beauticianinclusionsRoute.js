import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import BeauticianInclusions from "../model/BeauticianInclusions.js";

const router = express.Router();

router.get("/", protectRoute, async (req, res) => {
  try {
    const { beautician_id } = req.query;
    if (!beautician_id) {
      return res.status(400).json({ message: "Missing beautician_id" });
    }

    const beauticianInclusions = await BeauticianInclusions.find({
      beautician_id,
    }).lean();

    res.send(beauticianInclusions);
  } catch (error) {
    console.log("Error getting beautician inclusions: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
