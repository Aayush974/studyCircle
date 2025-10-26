import cookie from "cookie";
import jwt from "jsonwebtoken";

const verifySocket = async (socket, next) => {
  const raw = socket.handshake.headers.cookie || "";
  const cookies = cookie.parse(raw); 
  const token = cookies.accessToken;

  if (!token) {
    next(new Error("no access token"));
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.user = decodedToken; // attaching user in the subsequent socket requests
    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
};

export default verifySocket