const userSocket = async(socket)=>{
    if(!socket) return

    socket.on("connect",()=>{
        console.log("socket connected",socket)
    })
}

export default userSocket