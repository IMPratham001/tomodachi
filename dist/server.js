"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var next_1 = __importDefault(require("next"));
var mongoose_1 = __importDefault(require("mongoose"));
var GameRoom_1 = __importDefault(require("./lib/models/GameRoom"));
var Player_1 = __importDefault(require("./lib/models/Player"));
var gameLogic_1 = require("./lib/gameLogic");
var dev = process.env.NODE_ENV !== "production";
var app = (0, next_1.default)({ dev: dev });
var handle = app.getRequestHandler();
var PORT = process.env.PORT || 3000;
var MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/old-maid";
mongoose_1.default.connect(MONGO_URI);
var playerSockets = new Map();
app.prepare().then(function () {
    var httpServer = (0, http_1.createServer)(function (req, res) {
        handle(req, res);
    });
    var io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: dev ? "http://localhost:3000" : false,
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", function (socket) {
        console.log("Player connected: ".concat(socket.id));
        var emitRoomUpdate = function (roomCode) { return __awaiter(void 0, void 0, void 0, function () {
            var room;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, GameRoom_1.default.findOne({ roomCode: roomCode }).populate("players")];
                    case 1:
                        room = _a.sent();
                        io.to(roomCode).emit("room-updated", room);
                        return [2 /*return*/];
                }
            });
        }); };
        socket.on("create-room", function (_a) {
            var nickname = _a.nickname, botSettings = _a.botSettings;
            return __awaiter(void 0, void 0, void 0, function () {
                var roomCode, hostPlayer, newRoom, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 4, , 5]);
                            roomCode = Math.random()
                                .toString(36)
                                .substring(2, 8)
                                .toUpperCase();
                            hostPlayer = new Player_1.default({
                                nickname: nickname,
                                playerId: socket.id,
                                isBot: false,
                                isHost: true,
                                isReady: true,
                            });
                            return [4 /*yield*/, hostPlayer.save()];
                        case 1:
                            _b.sent();
                            newRoom = new GameRoom_1.default({
                                roomCode: roomCode,
                                host: hostPlayer._id,
                                players: [hostPlayer._id],
                                status: "waiting",
                                botSettings: botSettings !== null && botSettings !== void 0 ? botSettings : { enabled: false, count: 0 },
                            });
                            return [4 /*yield*/, newRoom.save()];
                        case 2:
                            _b.sent();
                            hostPlayer.gameRoom = newRoom._id;
                            return [4 /*yield*/, hostPlayer.save()];
                        case 3:
                            _b.sent();
                            playerSockets.set(socket.id, {
                                playerId: hostPlayer._id.toString(),
                                roomCode: roomCode,
                            });
                            socket.join(roomCode);
                            socket.emit("room-created", {
                                roomCode: roomCode,
                                playerId: hostPlayer._id.toString(),
                            });
                            emitRoomUpdate(roomCode);
                            console.log("Room ".concat(roomCode, " created by ").concat(nickname));
                            return [3 /*break*/, 5];
                        case 4:
                            error_1 = _b.sent();
                            console.error("Error creating room:", error_1);
                            socket.emit("error", "Could not create room.");
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        });
        socket.on("join-room", function (_a) {
            var roomCode = _a.roomCode, nickname = _a.nickname;
            return __awaiter(void 0, void 0, void 0, function () {
                var room, newPlayer, error_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 4, , 5]);
                            return [4 /*yield*/, GameRoom_1.default.findOne({ roomCode: roomCode })];
                        case 1:
                            room = _b.sent();
                            if (!room) {
                                return [2 /*return*/, socket.emit("error", { message: "Room not found." })];
                            }
                            if (room.status !== "waiting") {
                                return [2 /*return*/, socket.emit("error", {
                                        message: "Game has already started.",
                                    })];
                            }
                            if (room.players.length >= room.maxPlayers) {
                                return [2 /*return*/, socket.emit("error", { message: "Room is full." })];
                            }
                            newPlayer = new Player_1.default({
                                nickname: nickname,
                                playerId: socket.id,
                                gameRoom: room._id,
                                isBot: false,
                            });
                            return [4 /*yield*/, newPlayer.save()];
                        case 2:
                            _b.sent();
                            room.players.push(newPlayer._id);
                            return [4 /*yield*/, room.save()];
                        case 3:
                            _b.sent();
                            playerSockets.set(socket.id, {
                                playerId: newPlayer._id.toString(),
                                roomCode: roomCode,
                            });
                            socket.join(roomCode);
                            socket.emit("room-joined", {
                                roomCode: roomCode,
                                playerId: newPlayer._id.toString(),
                            });
                            emitRoomUpdate(roomCode);
                            console.log("".concat(nickname, " joined room ").concat(roomCode));
                            return [3 /*break*/, 5];
                        case 4:
                            error_2 = _b.sent();
                            console.error("Error joining room:", error_2);
                            socket.emit("error", { message: "Could not join room." });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        });
        socket.on("toggle-ready", function (_a) {
            var roomCode = _a.roomCode;
            return __awaiter(void 0, void 0, void 0, function () {
                var socketInfo, player, error_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 4, , 5]);
                            socketInfo = playerSockets.get(socket.id);
                            if (!socketInfo) return [3 /*break*/, 3];
                            return [4 /*yield*/, Player_1.default.findById(socketInfo.playerId)];
                        case 1:
                            player = _b.sent();
                            if (!player) return [3 /*break*/, 3];
                            player.isReady = !player.isReady;
                            return [4 /*yield*/, player.save()];
                        case 2:
                            _b.sent();
                            emitRoomUpdate(roomCode);
                            _b.label = 3;
                        case 3: return [3 /*break*/, 5];
                        case 4:
                            error_3 = _b.sent();
                            console.error("Error toggling ready state:", error_3);
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        });
        socket.on("add-bot", function (_a) {
            var roomCode = _a.roomCode, difficulty = _a.difficulty;
            return __awaiter(void 0, void 0, void 0, function () {
                var room, botPlayer, error_4;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 5, , 6]);
                            return [4 /*yield*/, GameRoom_1.default.findOne({ roomCode: roomCode })];
                        case 1:
                            room = _b.sent();
                            if (!(room && room.players.length < room.maxPlayers)) return [3 /*break*/, 4];
                            botPlayer = new Player_1.default({
                                nickname: "Bot ".concat(Math.floor(Math.random() * 100)),
                                playerId: new mongoose_1.default.Types.ObjectId().toString(),
                                isBot: true,
                                isReady: true,
                                botDifficulty: difficulty,
                                gameRoom: room._id,
                            });
                            return [4 /*yield*/, botPlayer.save()];
                        case 2:
                            _b.sent();
                            room.players.push(botPlayer._id);
                            return [4 /*yield*/, room.save()];
                        case 3:
                            _b.sent();
                            emitRoomUpdate(roomCode);
                            _b.label = 4;
                        case 4: return [3 /*break*/, 6];
                        case 5:
                            error_4 = _b.sent();
                            console.error("Error adding bot:", error_4);
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        });
        socket.on("remove-bot", function (_a) {
            var roomCode = _a.roomCode, botId = _a.botId;
            return __awaiter(void 0, void 0, void 0, function () {
                var room, error_5;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 5, , 6]);
                            return [4 /*yield*/, Player_1.default.findByIdAndDelete(botId)];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, GameRoom_1.default.findOne({ roomCode: roomCode })];
                        case 2:
                            room = _b.sent();
                            if (!room) return [3 /*break*/, 4];
                            room.players = room.players.filter(function (p) { return p.toString() !== botId; });
                            return [4 /*yield*/, room.save()];
                        case 3:
                            _b.sent();
                            emitRoomUpdate(roomCode);
                            _b.label = 4;
                        case 4: return [3 /*break*/, 6];
                        case 5:
                            error_5 = _b.sent();
                            console.error("Error removing bot:", error_5);
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        });
        socket.on("start-game", function (_a) {
            var roomCode = _a.roomCode;
            return __awaiter(void 0, void 0, void 0, function () {
                var room, socketInfo, allPlayersReady, deck, hands, i, player, _b, hand, pairs, _i, _c, player, p, error_6;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _d.trys.push([0, 7, , 8]);
                            return [4 /*yield*/, GameRoom_1.default.findOne({ roomCode: roomCode }).populate("players")];
                        case 1:
                            room = _d.sent();
                            socketInfo = playerSockets.get(socket.id);
                            if (!room ||
                                !socketInfo ||
                                room.host.toString() !== socketInfo.playerId) {
                                return [2 /*return*/, socket.emit("error", {
                                        message: "Only the host can start the game.",
                                    })];
                            }
                            allPlayersReady = room.players.every(function (p) { return p.isReady; });
                            if (!allPlayersReady) {
                                return [2 /*return*/, socket.emit("error", { message: "Not all players are ready." })];
                            }
                            deck = (0, gameLogic_1.createDeck)();
                            (0, gameLogic_1.shuffleDeck)(deck);
                            hands = (0, gameLogic_1.dealCards)(deck, room.players.length).hands;
                            i = 0;
                            _d.label = 2;
                        case 2:
                            if (!(i < room.players.length)) return [3 /*break*/, 5];
                            player = room.players[i];
                            _b = (0, gameLogic_1.removePairs)(hands[i]), hand = _b.hand, pairs = _b.pairs;
                            player.hand = hand;
                            return [4 /*yield*/, player.save()];
                        case 3:
                            _d.sent();
                            _d.label = 4;
                        case 4:
                            i++;
                            return [3 /*break*/, 2];
                        case 5:
                            room.status = 'in-progress';
                            room.currentTurn = room.players[0]._id; // Start with the host or a random player
                            return [4 /*yield*/, room.save()];
                        case 6:
                            _d.sent();
                            io.to(roomCode).emit('game-started', room);
                            // Emit individual hands to each player
                            for (_i = 0, _c = room.players; _i < _c.length; _i++) {
                                player = _c[_i];
                                p = player;
                                if (!p.isBot) {
                                    io.to(p.playerId).emit("your-hand", p.hand);
                                }
                            }
                            return [3 /*break*/, 8];
                        case 7:
                            error_6 = _d.sent();
                            console.error("Error starting game:", error_6);
                            socket.emit("error", "Could not start game.");
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        });
        socket.on('draw-card', function (_a) {
            var roomCode = _a.roomCode, fromPlayerId = _a.fromPlayerId;
            return __awaiter(void 0, void 0, void 0, function () {
                var room, drawerId_1, drawer, fromPlayer, cardIndex, drawnCard, newHand, activePlayers, currentPlayerIndexInActive, nextPlayerIndexInActive, error_7;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 5, , 6]);
                            return [4 /*yield*/, GameRoom_1.default.findOne({ roomCode: roomCode }).populate("players")];
                        case 1:
                            room = _c.sent();
                            drawerId_1 = (_b = playerSockets.get(socket.id)) === null || _b === void 0 ? void 0 : _b.playerId;
                            if (!room || room.status !== 'in-progress' || room.currentTurn.toString() !== drawerId_1) {
                                return [2 /*return*/, socket.emit('error', 'It is not your turn.')];
                            }
                            drawer = room.players.find(function (p) { return p.id === drawerId_1; });
                            fromPlayer = room.players.find(function (p) { return p.id === fromPlayerId; });
                            if (!drawer || !fromPlayer || fromPlayer.hand.length === 0) {
                                return [2 /*return*/, socket.emit("error", "Invalid draw.")];
                            }
                            cardIndex = Math.floor(Math.random() * fromPlayer.hand.length);
                            drawnCard = fromPlayer.hand.splice(cardIndex, 1)[0];
                            drawer.hand.push(drawnCard);
                            newHand = (0, gameLogic_1.removePairs)(drawer.hand).hand;
                            drawer.hand = newHand;
                            return [4 /*yield*/, fromPlayer.save()];
                        case 2:
                            _c.sent();
                            return [4 /*yield*/, drawer.save()];
                        case 3:
                            _c.sent();
                            activePlayers = room.players.filter(function (p) { return p.hand.length > 0; });
                            if (activePlayers.length <= 1) {
                                room.status = 'finished';
                                if (activePlayers.length === 1) {
                                    room.loser = activePlayers[0]._id;
                                }
                                io.to(roomCode).emit('game-over', room);
                            }
                            else {
                                currentPlayerIndexInActive = activePlayers.findIndex(function (p) { return p.id === drawerId_1; });
                                nextPlayerIndexInActive = (currentPlayerIndexInActive + 1) % activePlayers.length;
                                room.currentTurn = activePlayers[nextPlayerIndexInActive]._id;
                            }
                            return [4 /*yield*/, room.save()];
                        case 4:
                            _c.sent();
                            io.to(roomCode).emit('game-state-update', room);
                            // Emit individual hands
                            if (drawer.playerId)
                                io.to(drawer.playerId).emit('your-hand', drawer.hand);
                            if (fromPlayer.playerId)
                                io.to(fromPlayer.playerId).emit('your-hand', fromPlayer.hand);
                            return [3 /*break*/, 6];
                        case 5:
                            error_7 = _c.sent();
                            console.error('Error drawing card:', error_7);
                            socket.emit('error', 'Could not draw card.');
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        });
        socket.on("disconnect", function () { return __awaiter(void 0, void 0, void 0, function () {
            var socketInfo, playerId_1, roomCode, room, newHost, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Player disconnected: ".concat(socket.id));
                        socketInfo = playerSockets.get(socket.id);
                        if (!socketInfo) return [3 /*break*/, 13];
                        playerId_1 = socketInfo.playerId, roomCode = socketInfo.roomCode;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 11, , 12]);
                        return [4 /*yield*/, Player_1.default.findByIdAndDelete(playerId_1)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, GameRoom_1.default.findOne({ roomCode: roomCode })];
                    case 3:
                        room = _a.sent();
                        if (!room) return [3 /*break*/, 10];
                        room.players = room.players.filter(function (p) { return p.toString() !== playerId_1; });
                        if (!(room.host.toString() === playerId_1 && room.players.length > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, Player_1.default.findById(room.players[0])];
                    case 4:
                        newHost = _a.sent();
                        if (!newHost) return [3 /*break*/, 6];
                        newHost.isHost = true;
                        return [4 /*yield*/, newHost.save()];
                    case 5:
                        _a.sent();
                        room.host = newHost._id;
                        _a.label = 6;
                    case 6: return [4 /*yield*/, room.save()];
                    case 7:
                        _a.sent();
                        if (!(room.players.length === 0)) return [3 /*break*/, 9];
                        return [4 /*yield*/, GameRoom_1.default.findByIdAndDelete(room._id)];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        emitRoomUpdate(roomCode);
                        _a.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        error_8 = _a.sent();
                        console.error("Error on disconnect:", error_8);
                        return [3 /*break*/, 12];
                    case 12:
                        playerSockets.delete(socket.id);
                        _a.label = 13;
                    case 13: return [2 /*return*/];
                }
            });
        }); });
    });
    httpServer.on("error", function (err) {
        console.error(err);
        process.exit(1);
    });
    httpServer.listen(PORT, function () {
        console.log("> Ready on http://localhost:".concat(PORT));
    });
});
