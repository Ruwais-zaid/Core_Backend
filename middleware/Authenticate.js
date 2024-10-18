import jwt from 'jsonwebtoken'

const authMiddleware = (req,res,next)=>{
    const authHeader =  req.headers.authorization;
    if(!authHeader){
        return res.status(400).json({error:"Unauthorized no token provided"})

    }
    const token = authHeader.split(" ")[1];
    if(!token){
        return res.status(400).json({error:"Unauthorized tokens missing"})

    }

    console.log("Token recieved" , token)

    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
        if(err){
            console.log("JWT Verificaton error:" , err);
            return res.status(400).json({msg:"Unauthorized invalid token"})
        }

        req.user = user;
        next();
    })
}

export default authMiddleware;