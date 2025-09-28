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

router.get("/selected/:booking_id", protectRoute, async (req, res) => {
  console.log("ming abot");
  
  try {
    const { booking_id } = req.params;

    const aiImages = await BookingImage.find({
      booking_id,
      is_selected: 1,
    });
    console.log(aiImages);
    

    res.status(200).json(aiImages);
  } catch (error) {
    console.error("BookingImage Selected Error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/", protectRoute, async (req, res) => {
  try {
    const { booking_id } = req.query;
    console.log(booking_id);

    if (!booking_id) {
      return res.status(400).json({ message: "Missing booking id" });
    }

    const BookingImages = await BookingImage.find({
      booking_id,
      is_ai: 1,
    });

    res.send(BookingImages);
  } catch (error) {
    console.log("Error getting AI Images : ", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id", protectRoute, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing BookingImageId" });
    }

    const updated = await BookingImage.findByIdAndUpdate(
      id,
      { $set: { is_selected: 1 } },
      { new: true } // return updated doc
    );

    if (!updated) {
      return res.status(404).json({ message: "BookingImage not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("❌ Error updating Booking Image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/", protectRoute, async (req, res) => {
  try {
    const { booking_id } = req.query;
    if (!booking_id) {
      return res.status(400).json({ message: "Missing booking id" });
    }

    const result = await BookingImage.deleteMany({ booking_id });

    res.json({
      message: `Deleted ${result.deletedCount} images for booking_id ${booking_id}`,
    });
  } catch (error) {
    console.error("❌ Error deleting Booking Images:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
