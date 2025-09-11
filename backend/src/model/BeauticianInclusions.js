import mongoose from "mongoose";
const Schema = mongoose.Schema;

const beauticianinclusionsSchema = new mongoose.Schema(
  {
    beautician_id: { type: Schema.Types.ObjectId, ref: "Beautician" },
    description: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const BeauticianInclusions = mongoose.model("BeauticianInclusions", beauticianinclusionsSchema);

export default BeauticianInclusions;
