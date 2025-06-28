"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var CardSchema = new mongoose_1.default.Schema({
    value: { type: String, required: true },
    suit: { type: String, required: true },
    isJoker: { type: Boolean, default: false },
});
exports.default = CardSchema;
