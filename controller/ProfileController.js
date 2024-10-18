import prisma from "../DB/db.config.js";

class ProfileController{
    static async index(req,res){
        try{
            const user = req.user;
            return res.status(200).json({
                status:200,
                user:{
                    id:user.id,
                    name:user.name,
                    email:user.email
                }
            })
        }catch(error){
            console.log("Error Fetching user profile",error)
            return res.status(500).json({ message: "Something went wrong!" });
        }
    }
}

export default ProfileController;