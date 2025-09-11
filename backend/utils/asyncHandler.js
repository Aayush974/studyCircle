// this is an async wrapper for the controller functions
const asyncHandler = (fn) => async function(req,res,next){
    try {
        await fn(req,res,next)
    } catch (error) {
         console.log(error)
        res.status(error.statusCode || 500 ).json({
            success:false,
            message:error.message
        })
    }
}

export default asyncHandler