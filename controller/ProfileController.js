import prisma from "../DB/db.config.js";
import vine from "@vinejs/vine";
import { registerSchema } from "../validations/authvalidations.js";

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
    static async update(req, res) {
        try {
            const { id } = req.params; // Use req.params to get the user ID from the URL
            const body = req.body;
            const loggedInUser = req.user;
    
            // Validate the incoming data using the Vine validator
            const validator = vine.compile(registerSchema);
            const payload = validator.validate(body);
    
            // Fetch the profile of the user to be updated
            const profile = await prisma.user.findUnique({
                where: {
                    id: Number(id),
                },
            });

    
            // Update the payload conditionally based on provided fields
            payload.name = body.name || user.name;
            payload.email = body.email || user.email;
            payload.image = body.image || user.image;
    
            // Perform the update operation
            const updatedProfile = await prisma.user.update({
                where: {
                    id: Number(id),
                },
                data: payload,
            });
    
            // Send a successful response with the updated profile
            res.status(200).json({
                message: "Profile updated successfully",
                updatedProfile,
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

export default ProfileController;