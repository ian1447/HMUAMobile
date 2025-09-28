import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import Booking from "../model/Bookings.js";
import mongoose from "mongoose";

const router = express.Router();
// create
// update
// delete

router.post("/", protectRoute, async (req, res) => {
  try {
    const {
      beautician_id,
      ubooker_id,
      beauticianWork_id,
      datetime,
      status,
      amount,
    } = req.body;

    if (
      !beautician_id ||
      !ubooker_id ||
      !beauticianWork_id ||
      !datetime ||
      !status ||
      !amount
    )
      res
        .status(400)
        .json({ message: "Please Provide all necessary details." });

    const newBooking = new Booking({
      beautician_id,
      ubooker_id,
      beauticianWork_id,
      datetime,
      status,
      amount,
    });

    await newBooking.save();

    res.status(201).json({ newBooking });
  } catch (error) {
    console.log("error", error);

    res.status(500).json({ message: error.message });
  }
});

router.get("/user", protectRoute, async (req, res) => {
  try {
    const { ubooker_id } = req.query;

    if (!ubooker_id) {
      return res.status(400).json({ message: "Missing ubooker_id" });
    }

    const bookings = await Booking.find({
      ubooker_id,
    })
      .populate("ubooker_id")
      .populate("beautician_id")
      .populate("beauticianWork_id")
      .lean();

    res.send(bookings);
  } catch (error) {
    console.log("Error getting Bookings: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/admin", protectRoute, async (req, res) => {
  try {
    const { beautician_id } = req.query;

    if (!beautician_id) {
      return res.status(400).json({ message: "Missing beautician_id" });
    }
    console.log(beautician_id);

    const bookings = await Booking.find({
      beautician_id,
    })
      .populate("beautician_id")
      .populate("ubooker_id")
      .lean();
    console.log(bookings);

    res.send(bookings);
  } catch (error) {
    console.log("Error getting Bookings: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id", protectRoute, async (req, res) => {
  try {
    const { id } = req.params; // matches the URL param
    const { _status } = req.body;

    if (!id && !_status) {
      return res.status(400).json({ message: "Missing BookingImageId" });
    }

    const updated = await Booking.findByIdAndUpdate(
      id,
      { $set: { status: _status } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("❌ Error updating Booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// router.get("/user", protectRoute, async (req, res) => {
//   try {
//     const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });

//     res.send({ books });
//   } catch (error) {
//     console.log("Error getting user books: ", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

export default router;
