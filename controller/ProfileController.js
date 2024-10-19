import prisma from "../DB/db.config.js";
import vine from "@vinejs/vine";
import { registerSchema } from "../validations/authvalidations.js";

class ProfileController{
    static async index(req,res){
        try{
            const user = req.user;
            console.log(user)
            return res.status(200).json({
                status:200,
                user:{
                    id:user.id,
                    name:user.name,
                    email:user.email,
                }
            })
        }catch(error){
            console.log("Error Fetching user profile",error)
            return res.status(500).json({ message: "Something went wrong!" });
        }
    }
    static async update(req, res) {
        try {
            const { email } = req.params; // Get the user name from the URL parameters
            const body = req.body;
            const loggedInUser = req.user;
    
            // Validate the incoming data using the Vine validator
            const validator = vine.compile(registerSchema);
            const payload = validator.validate(body);
    
            // Fetch the profile of the user to be updated
            const profile = await prisma.user.findUnique({
                where: {
                    email:email
                },
            });
    
            // Check if the profile exists and if the logged-in user is authorized to update it
            if (!profile || loggedInUser.email !== email) {
                return res.status(403).json({
                    message: 'Unauthorized: You cannot update this profile.',
                });
            }
    
            // Update the payload conditionally based on the provided fields
            const updatedData = {
                name: payload.name || profile.name,
                email: payload.email || profile.email,
                image: payload.image || profile.image,
            };
    
            // Perform the update operation
            const updatedProfile = await prisma.user.update({
                where: {
                    email:email
                },
                data: updatedData,
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
    
    static async delete(req, res) {
        try {
            const { id } = req.params;
    
            // Check if the user ID from the params is a valid number
            if (isNaN(id)) {
                return res.status(400).json({ error: "Invalid email Id" });
            }
    
            //Delete the related record of a Store table first

            await prisma.store.deleteMany({
                where:{
                    user_id:Number(id)
                }
            })            // Delete the user
            const deleteEntry = await prisma.user.delete({
                where: {
                    id: Number(id),
                },
            });
    
            return res.status(200).json({
                status: 200,
                message: "User deleted successfully",
                deletedUser: deleteEntry,
            });
        } catch (error) {
            console.error("Error deleting user:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
    
}

export default ProfileController;