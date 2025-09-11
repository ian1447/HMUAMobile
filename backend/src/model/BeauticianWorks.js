import mongoose from "mongoose";
const Schema = mongoose.Schema;

const beauticianworksSchema = new mongoose.Schema(
  {
    beautician_id: { type: Schema.Types.ObjectId, ref: "Beautician" },
    image: {
      type: String,
      required: true,
    },
    description: {
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

const BeauticianWorks = mongoose.model("BeauticianWork", beauticianworksSchema);

export default BeauticianWorks;
