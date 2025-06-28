"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
var uuid_1 = require("uuid");
var Player = /** @class */ (function () {
    function Player(nickname, isHost) {
        if (isHost === void 0) { isHost = false; }
        this.id = (0, uuid_1.v4)();
        this.nickname = nickname;
        this.isHost = isHost;
        this.hand = [];
    }
    return Player;
}());
exports.Player = Player;
