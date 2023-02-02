const io = require("socket.io")(process.env.PORT, {
  cors: {
    origin: process.env.CLIENT_URL ,
  },
});

let activeUsers = [];

io.on("connection", (socket) => {
  // add new User
  socket.on("new-user-add", (newUserId) => {
    // if user is not added previously
    if (newUserId && !activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
      
    }
    // send all active users to new user
    io.emit("get-users", activeUsers);
  });
  

  // send message to a specific user
  socket.on("send-message", (data) => {
    const { receiverId } = data;
    
    const user = activeUsers.find((user) => user.userId === receiverId);
    
    
    
    if (user) {
      
      io.to(user.socketId).emit("receive-message", data);
      
    }
  }); 

  // remove user from active users when they disconnect
  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    
    // send all active users to all users
    io.emit("get-users", activeUsers);
  });
});
