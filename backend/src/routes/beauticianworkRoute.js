import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import BeauticianWorks from "../model/BeauticianWorks.js";

const router = express.Router();

// create
// update
// delete

// router.post("/", protectRoute, async (req, res) => {
//   try {
//     const { title, caption, rating } = req.body;

//     if (!title || !caption || !rating) res.status(400).json({ message: "Please Provide all necessary details." });

//     const newBook = new Book({
//       title,
//       caption,
//       rating,
//       user: req.user._id,
//     });

//     await newBook.save();
``;
//     res.status(201).json({ newBook });
//   } catch (error) {
//     console.log("error", error);

//     res.status(500).json({ message: error.message });
//   }
// });

router.get("/", protectRoute, async (req, res) => {
  try {
    const { beautician_id } = req.query;
    if (!beautician_id) {
      return res.status(400).json({ message: "Missing beautician_id" });
    }

    const beauticianWorks = await BeauticianWorks.find({
      beautician_id,
    }).populate("beautician_id").lean();

    res.send(beauticianWorks);
  } catch (error) {
    console.log("Error getting beauticianWorks: ", error);
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

// router.delete("/:id", protectRoute, async (req, res) => {
//   try {
//     const book = await Book.findById(req.params.id);
//     if (!book) return res.status(401).json({ message: "Book not found" });

//     if (book.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: "cannot delete book" });

//     await Book.deleteOne();

//     res.json({ message: "Deleted Successfully" });
//   } catch (error) {
//     console.log("error", error);
//     return res.status(500).json({ message: "Internal server errro" });
//   }
// });

export default router;
