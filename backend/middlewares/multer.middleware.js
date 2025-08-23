import multer from "multer"


// we will be storing the images in a temp folder locally , this is the configuration for the multer storage
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./temp/')
    },
    filename:function(req,file,cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random()*1E9)
        cb(null,file.fieldname+'-'+uniqueSuffix)
    }
})

const upload = multer({
    storage,
    limits:{
        fileSize:5242880, //file size limit of 5mb
        files:1 // max no. of file field is 1
    }
})

// we only require a single file field called avatar
const uploadMiddleware = upload.single('avatar')


export default uploadMiddleware