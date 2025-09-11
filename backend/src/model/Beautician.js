import mongoose from "mongoose";

const beauticianSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    specialties: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Beautician = mongoose.model("Beautician", beauticianSchema);

export default Beautician;