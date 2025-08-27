import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"

const verifyJwt = async function (req,res,next){
   try {
    const accessToken = req.cookies?.accessToken
    if(!accessToken)
      throw new ApiError(401,"no access token found in request")

    let decodedToken 
    // this try catch block's purpose is only to send more meaningful error messages we can do without it but then a general error message would have to be sent
    try {
       decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
       console.log("decoded token",decodedToken)
    } catch (error) {
      console.log(error)
      throw new ApiError(403,"invalid or expired token")
    }

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

    if(!user)
      throw new ApiError(404,"user not found")

    req.user = user
    next()
   } catch (error) {
     res.status(error.statusCode || 500 ).json({
            success:false,
            message:error.message
        })
   }
}

export default verifyJwt