import mongoose, { Schema, Document } from "mongoose";
import CardSchema from "./Card";
import { IGameRoom } from "./GameRoom";
import { Card } from "../gameLogic";

export interface IPlayer extends Document {
  nickname: string;
  playerId: string;
  hand: Card[];
  isBot: boolean;
  isHost: boolean;
  isReady: boolean;
  botDifficulty?: "easy" | "medium" | "nightmare";
  gameRoom?: IGameRoom["_id"];
}

const PlayerSchema: Schema = new Schema({
  nickname: { type: String, required: true },
  playerId: { type: String, required: true },
  hand: [CardSchema],
  isBot: { type: Boolean, default: false },
  isHost: { type: Boolean, default: false },
  isReady: { type: Boolean, default: false },
  botDifficulty: { type: String, enum: ["easy", "medium", "nightmare"] },
  gameRoom: { type: mongoose.Schema.Types.ObjectId, ref: "GameRoom" },
});

export default mongoose.models.Player ||
  mongoose.model<IPlayer>("Player", PlayerSchema); 