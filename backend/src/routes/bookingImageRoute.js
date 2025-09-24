import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import BookingImage from "../model/BookingImage.js";
import mongoose from "mongoose";

const router = express.Router();
// create
// update
// delete

router.post("/", protectRoute, async (req, res) => {
  try {
    const { booking_id, url } = req.body;

    if (!booking_id || !url) {
      return res
        .status(400)
        .json({ message: "Please provide booking_id and url." });
    }

    const newBookingImage = new BookingImage({
      booking_id,
      url,
    });

    await newBookingImage.save();

    res.status(201).json(newBookingImage);
  } catch (error) {
    console.error("BookingImage Error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
