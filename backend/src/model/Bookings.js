import mongoose from "mongoose";
const Schema = mongoose.Schema;

const bookingSchema = new mongoose.Schema(
  {
    beautician_id: { type: Schema.Types.ObjectId, ref: "Beautician" },
    ubooker_id: { type: Schema.Types.ObjectId, ref: "User" },
    beauticianWork_id: { type: Schema.Types.ObjectId, ref: "BeauticianWork" },
    datetime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
