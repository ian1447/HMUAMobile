import mongoose from "mongoose";
const Schema = mongoose.Schema;

const bookingImageSchema = new mongoose.Schema(
  {
    booking_id: { type: Schema.Types.ObjectId, ref: "Booking" },
    url: {
      type: String,
      required: true,
    },
    is_done: {
      type: Number,
      required: true,
      default: 0,
    },
    is_ai: {
      type: Number,
      required: true,
      default: 0,
    },
    is_selected: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const BookingImage = mongoose.model("BookingImage", bookingImageSchema);

export default BookingImage;
