import mongoose from "mongoose";

const CardSchema = new mongoose.Schema({
  value: { type: String, required: true },
  suit: { type: String, required: true },
  isJoker: { type: Boolean, default: false },
});

export default CardSchema; 