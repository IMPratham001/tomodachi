"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importStar(require("mongoose"));
var Card_1 = __importDefault(require("./Card"));
var GameRoomSchema = new mongoose_1.Schema({
    roomCode: { type: String, required: true, unique: true, index: true },
    players: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Player" }],
    status: {
        type: String,
        enum: ["waiting", "in-progress", "finished"],
        default: "waiting",
    },
    currentTurn: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Player" },
    deck: [Card_1.default],
    discardPile: [Card_1.default],
    roundHistory: [
        {
            type: { type: String },
            player: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Player" },
            target: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Player" },
            cards: [Card_1.default],
            message: { type: String },
            timestamp: { type: Date, default: Date.now },
        },
    ],
    host: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Player",
        required: true,
    },
    loser: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Player" },
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
}, { timestamps: true });
exports.default = mongoose_1.default.models.GameRoom ||
    mongoose_1.default.model("GameRoom", GameRoomSchema);
