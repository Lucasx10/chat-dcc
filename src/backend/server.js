const http = require("http");
const { Server } = require("socket.io");

const httpServer = http.createServer();

const PORT = process.env.PORT || 3001;

let users = [];
let typingUsers = [];

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

io.on("connection", async (socket) => {
  console.log("Usuario conectado: ", socket.id);
  io.emit("updateUsers", users);

  // Ouça por mensagens privadas
  socket.on("private-message", ({ to, message }) => {
    // Encontre o socket do usuário alvo
    const targetSocket = io.sockets.sockets.get(to);

    if (targetSocket) {
      // Emita a mensagem privada para o usuário alvo
      targetSocket.emit("private-message", message);
    }
  });

  socket.on("start-private-chat", (targetUserId) => {
    // Encontrar o socket do usuário alvo
    const targetSocket = io.sockets.sockets.get(targetUserId);

    if (targetSocket) {
      // Emitir evento para notificar o início do chat privado
      targetSocket.emit("private-chat-started", socket.id);
    }
  });

  socket.on("join_room", (userName) => {
    users.push({ id: socket.id, name: userName });
    console.log(`username: ${userName} - Socket: ${socket.id}`);
    io.emit("updateUsers", users);
    io.emit("userConnected", userName); // Emita evento quando um usuário se conectar
  });

  socket.on("send-message", (msg) => {
    console.log(msg, "MSG");
    io.emit("receive-msg", msg);
  });

  socket.on("userTyping", (isTyping, userName) => {
    if (isTyping) {
      typingUsers.push(userName);
    } else {
      const index = typingUsers.indexOf(userName);
      if (index !== -1) {
        typingUsers.splice(index, 1);
      }
    }
    io.emit("updateTypingUsers", typingUsers);
  });

  // Trata o evento de desconexão
  socket.on("disconnect", () => {
    const index = users.findIndex((user) => user.id === socket.id);
    if (index !== -1) {
      const disconnectedUserName = users[index].name;
      users.splice(index, 1);
      io.emit("userDisconnected", disconnectedUserName); // Emita evento quando um usuário se desconectar
      io.emit("updateUsers", users); // Emita a lista atualizada de usuários
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
