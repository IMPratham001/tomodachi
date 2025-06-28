import { createServer, IncomingMessage, ServerResponse } from "http";
import { Server, Socket } from "socket.io";
import next from "next";
import mongoose from "mongoose";
import GameRoom from "./lib/models/GameRoom";
import Player, { IPlayer } from "./lib/models/Player";
import {
  createDeck,
  shuffleDeck,
  dealCards,
  removePairs,
} from "./lib/gameLogic";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/old-maid";

mongoose.connect(MONGO_URI);

const playerSockets = new Map<string, { playerId: string; roomCode: string }>();

app.prepare().then(() => {
  const httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: dev ? "http://localhost:3000" : false,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);

    const emitRoomUpdate = async (roomCode: string) => {
      const room = await GameRoom.findOne({ roomCode }).populate<{
        players: IPlayer[];
      }>("players");
      io.to(roomCode).emit("room-updated", room);
    };

    socket.on(
      "create-room",
      async ({
        nickname,
        botSettings,
      }: {
        nickname: string;
        botSettings?: any;
      }) => {
        try {
          const roomCode = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

          const hostPlayer = new Player({
            nickname,
            playerId: socket.id,
            isBot: false,
            isHost: true,
            isReady: true,
          });
          await hostPlayer.save();

          const newRoom = new GameRoom({
            roomCode,
            host: hostPlayer._id,
            players: [hostPlayer._id],
            status: "waiting",
            botSettings: botSettings ?? { enabled: false, count: 0 },
          });
          await newRoom.save();

          hostPlayer.gameRoom = newRoom._id;
          await hostPlayer.save();

          playerSockets.set(socket.id, {
            playerId: hostPlayer._id.toString(),
            roomCode,
          });
          socket.join(roomCode);

          socket.emit("room-created", {
            roomCode,
            playerId: hostPlayer._id.toString(),
          });
          emitRoomUpdate(roomCode);
          console.log(`Room ${roomCode} created by ${nickname}`);
        } catch (error) {
          console.error("Error creating room:", error);
          socket.emit("error", "Could not create room.");
        }
      }
    );

    socket.on(
      "join-room",
      async ({
        roomCode,
        nickname,
      }: {
        roomCode: string;
        nickname: string;
      }) => {
        try {
          const room = await GameRoom.findOne({ roomCode });
          if (!room) {
            return socket.emit("error", { message: "Room not found." });
          }
          if (room.status !== "waiting") {
            return socket.emit("error", {
              message: "Game has already started.",
            });
          }
          if (room.players.length >= room.maxPlayers) {
            return socket.emit("error", { message: "Room is full." });
          }

          const newPlayer = new Player({
            nickname,
            playerId: socket.id,
            gameRoom: room._id,
            isBot: false,
          });
          await newPlayer.save();

          room.players.push(newPlayer._id);
          await room.save();

          playerSockets.set(socket.id, {
            playerId: newPlayer._id.toString(),
            roomCode,
          });
          socket.join(roomCode);

          socket.emit("room-joined", {
            roomCode,
            playerId: newPlayer._id.toString(),
          });
          emitRoomUpdate(roomCode);
          console.log(`${nickname} joined room ${roomCode}`);
        } catch (error) {
          console.error("Error joining room:", error);
          socket.emit("error", { message: "Could not join room." });
        }
      }
    );

    socket.on("toggle-ready", async ({ roomCode }: { roomCode: string }) => {
      try {
        const socketInfo = playerSockets.get(socket.id);
        if (socketInfo) {
          const player = await Player.findById(socketInfo.playerId);
          if (player) {
            player.isReady = !player.isReady;
            await player.save();
            emitRoomUpdate(roomCode);
          }
        }
      } catch (error) {
        console.error("Error toggling ready state:", error);
      }
    });

    socket.on(
      "add-bot",
      async ({
        roomCode,
        difficulty,
      }: {
        roomCode: string;
        difficulty: "easy" | "medium" | "nightmare";
      }) => {
        try {
          const room = await GameRoom.findOne({ roomCode });
          if (room && room.players.length < room.maxPlayers) {
            const botPlayer = new Player({
              nickname: `Bot ${Math.floor(Math.random() * 100)}`,
              playerId: new mongoose.Types.ObjectId().toString(),
              isBot: true,
              isReady: true,
              botDifficulty: difficulty,
              gameRoom: room._id,
            });
            await botPlayer.save();
            room.players.push(botPlayer._id);
            await room.save();
            emitRoomUpdate(roomCode);
          }
        } catch (error) {
          console.error("Error adding bot:", error);
        }
      }
    );

    socket.on(
      "remove-bot",
      async ({ roomCode, botId }: { roomCode: string; botId: string }) => {
        try {
          await Player.findByIdAndDelete(botId);
          const room = await GameRoom.findOne({ roomCode });
          if (room) {
            room.players = room.players.filter(
              (p: mongoose.Types.ObjectId) => p.toString() !== botId
            );
            await room.save();
            emitRoomUpdate(roomCode);
          }
        } catch (error) {
          console.error("Error removing bot:", error);
        }
      }
    );

    socket.on("start-game", async ({ roomCode }: { roomCode: string }) => {
      try {
        const room = await GameRoom.findOne({ roomCode }).populate<{
          players: IPlayer[];
        }>("players");
        const socketInfo = playerSockets.get(socket.id);
        if (
          !room ||
          !socketInfo ||
          room.host.toString() !== socketInfo.playerId
        ) {
          return socket.emit("error", {
            message: "Only the host can start the game.",
          });
        }
        
        const allPlayersReady = room.players.every((p: IPlayer) => p.isReady);
        if (!allPlayersReady) {
            return socket.emit("error", {message: "Not all players are ready."})
        }

        // Create, shuffle, and deal cards
        const deck = createDeck();
        shuffleDeck(deck);
        const { hands } = dealCards(deck, room.players.length);

        for (let i = 0; i < room.players.length; i++) {
          const player = room.players[i] as IPlayer;
          const { hand, pairs } = removePairs(hands[i]);
          player.hand = hand;
          await player.save();
          // Here you could add pairs to discard pile in the room
        }

        room.status = 'in-progress';
        room.currentTurn = room.players[0]._id; // Start with the host or a random player
        await room.save();
        
        io.to(roomCode).emit('game-started', room);
        // Emit individual hands to each player
        for (const player of room.players) {
          const p = player as IPlayer;
          if (!p.isBot) {
            io.to(p.playerId).emit("your-hand", p.hand);
          }
        }

      } catch (error) {
        console.error("Error starting game:", error);
        socket.emit("error", "Could not start game.");
      }
    });

    socket.on('draw-card', async ({ roomCode, fromPlayerId }: { roomCode: string; fromPlayerId: string }) => {
      try {
        const room = await GameRoom.findOne({ roomCode }).populate<{players: IPlayer[]}>("players");
        const drawerId = playerSockets.get(socket.id)?.playerId;
        
        if (!room || room.status !== 'in-progress' || room.currentTurn.toString() !== drawerId) {
          return socket.emit('error', 'It is not your turn.');
        }

        const drawer = room.players.find(
          (p: IPlayer) => p.id === drawerId
        );
        const fromPlayer = room.players.find(
          (p: IPlayer) => p.id === fromPlayerId
        );

        if (!drawer || !fromPlayer || fromPlayer.hand.length === 0) {
          return socket.emit("error", "Invalid draw.");
        }

        const cardIndex = Math.floor(Math.random() * fromPlayer.hand.length);
        const drawnCard = fromPlayer.hand.splice(cardIndex, 1)[0];
        drawer.hand.push(drawnCard);

        // Check for new pairs
        const { hand: newHand } = removePairs(drawer.hand);
        drawer.hand = newHand;

        await fromPlayer.save();
        await drawer.save();
        
        // Determine next turn & check for win condition
        const activePlayers = room.players.filter((p:IPlayer) => p.hand.length > 0);
        
        if (activePlayers.length <= 1) {
            room.status = 'finished';
            if (activePlayers.length === 1) {
                room.loser = activePlayers[0]._id;
            }
            io.to(roomCode).emit('game-over', room);
        } else {
            const currentPlayerIndexInActive = activePlayers.findIndex(
              (p: IPlayer) => p.id === drawerId
            );
            const nextPlayerIndexInActive = (currentPlayerIndexInActive + 1) % activePlayers.length;
            room.currentTurn = activePlayers[nextPlayerIndexInActive]._id;
        }

        await room.save();
        io.to(roomCode).emit('game-state-update', room);

        // Emit individual hands
        if(drawer.playerId) io.to(drawer.playerId).emit('your-hand', drawer.hand);
        if(fromPlayer.playerId) io.to(fromPlayer.playerId).emit('your-hand', fromPlayer.hand);

      } catch (error) {
        console.error('Error drawing card:', error);
        socket.emit('error', 'Could not draw card.');
      }
    });

    socket.on("disconnect", async () => {
      console.log(`Player disconnected: ${socket.id}`);
      const socketInfo = playerSockets.get(socket.id);
      if (socketInfo) {
        const { playerId, roomCode } = socketInfo;
        try {
          await Player.findByIdAndDelete(playerId);
          const room = await GameRoom.findOne({ roomCode });
          if (room) {
            room.players = room.players.filter(
              (p: mongoose.Types.ObjectId) => p.toString() !== playerId
            );
            if (room.host.toString() === playerId && room.players.length > 0) {
              const newHost = await Player.findById(room.players[0]);
              if (newHost) {
                newHost.isHost = true;
                await newHost.save();
                room.host = newHost._id;
              }
            }
            await room.save();

            if(room.players.length === 0){
                await GameRoom.findByIdAndDelete(room._id);
            } else {
                emitRoomUpdate(roomCode);
            }
          }
        } catch (error) {
          console.error("Error on disconnect:", error);
        }
        playerSockets.delete(socket.id);
      }
    });
  });

  httpServer.on("error", (err: Error) => {
    console.error(err);
    process.exit(1);
  });

  httpServer.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});