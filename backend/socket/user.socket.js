export const userSocket = function(io){
    io.on("connection",async function(socket){
       console.log("user connected",socket.user)
    })
}