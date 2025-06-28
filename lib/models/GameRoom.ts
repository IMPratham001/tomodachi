import mongoose, { Schema, Document } from "mongoose";
import CardSchema from "./Card";
import { IPlayer } from "./Player";

export interface IGameRoom extends Document {
  roomCode: string;
  players: IPlayer[];
  status: "waiting" | "in-progress" | "finished";
  currentTurn?: IPlayer["_id"];
  deck?: any[];
  discardPile?: any[];
  roundHistory?: any[];
  host: IPlayer["_id"];
  loser?: IPlayer["_id"];
  maxPlayers: number;
  botSettings?: {
    enabled: boolean;
    difficulty: "easy" | "medium" | "nightmare";
    count: number;
  };
  createdAt: Date;
}

const GameRoomSchema: Schema = new Schema(
  {
    roomCode: { type: String, required: true, unique: true, index: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
    status: {
      type: String,
      enum: ["waiting", "in-progress", "finished"],
      default: "waiting",
    },
    currentTurn: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    deck: [CardSchema],
    discardPile: [CardSchema],
    roundHistory: [
      {
        type: { type: String }, // 'draw', 'pair', 'start', 'win', 'join', 'leave'
        player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        target: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        cards: [CardSchema],
        message: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    loser: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    maxPlayers: { type: Number, default: 5 },
    botSettings: {
      enabled: { type: Boolean, default: false },
      difficulty: {
        type: String,
        enum: ["easy", "medium", "nightmare"],
        default: "medium",
      },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.GameRoom ||
  mongoose.model<IGameRoom>("GameRoom", GameRoomSchema); 