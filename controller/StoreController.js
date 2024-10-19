import prisma from "../DB/db.config.js";
import { validateImage } from "../utils/helper.js";
import { removeImage } from "../utils/removeImage.js";
import StoreApiTransform from "../utils/StoreApitransform.js";
import { StoreSchema } from "../validations/authvalidations.js";
import vine from "@vinejs/vine";

class StoreController {
    // Method to fetch store list with pagination
    static async index(req, res) {
      try{

        const page  = Number(req.query.page) || 1;
        const limit  = Number(req.query.limit) || 10
        if(page<=0){
            page=1;
        }
        if(limit<=0 || limit>=100){
            limit= 10;
        }
        const skip = (page-1)*limit;

        const storeList = await prisma.store.findMany({
            skip:skip,
            take:limit,
            include:{
                user:{
                    select:{
                        id:true,
                        name:true,
                        email:true,
                    }
                }
            }
        })

        const storeEntry = storeList.map((item)=> StoreApiTransform.transform(item));
        const totalProduct  = await prisma.store.count();
        const totalPage = Math.ceil(totalProduct/limit);
        res.status(200).json({
            status:200,
            data:storeEntry,
            metadata:{
                totalProducts:totalProduct,
                totalPage:totalPage

            }
        })

      }catch(error){
        console.log(error)
        res.status(500).json({
            err:"Error while fetching the products"
        })

      }
    }

    // Method to create a new store entry
    static async store(req, res) {
        try {
            const { body } = req;
            const { user } = req; // Ensure user is available from the auth middleware
    
            // Validate the request body with StoreSchema
            const validator = vine.compile(StoreSchema);
            const payload = await validator.validate(body);
    
            // Validate the uploaded image
            const profileImage = req.files?.image;
            if (!profileImage) {
                return res.status(400).json({ error: "Image file is required" });
            }
    
            const isImageValid = validateImage(profileImage.size, profileImage.mimetype);
            if (isImageValid) {
                return res.status(400).json({ error: "Invalid image format or size" });
            }
    
            // Prepare image name and upload path
            const imageExt = profileImage.name.split(".").pop();
            const imageName = `${Math.floor(Math.random() * 10000)}.${imageExt}`;
            const uploadPath = `${process.cwd()}/public/images/${imageName}`;
    
            // Upload the image to the server
            await new Promise((resolve, reject) => {
                profileImage.mv(uploadPath, (err) => {
                    if (err) {
                        console.error("File upload error:", err);
                        reject(new Error("File upload failed"));
                    } else {
                        resolve();
                    }
                });
            });
    
            // Add image and user details to the payload
            payload.image = imageName;
    
            // Ensure the user ID is included when creating the store
            if (!user || !user.email) {
                return res.status(400).json({ error: "User email is required" });
            }
    
            // Create a new store entry in the database, connecting it to the user
            const storeEntry = await prisma.store.create({
                data: {
                    ...payload,
                    sold:Boolean(payload.sold) !==undefined ? Boolean(payload.sold):false,
                    user: {
                        connect: { email: user.email } // Connect the store entry to the user
                    }
                },
            });
    
            return res.status(201).json({
                status: 201,
                message: "Store entry created successfully",
                data: storeEntry,
                imageDetails: {
                    image: profileImage.name,
                    size: profileImage.size,
                    mime: profileImage.mimetype,
                },
            });
        } catch (error) {
            console.error("Error while creating store entry:", error);
            return res.status(500).json({ message: "An error occurred while creating the store entry." });
        }
    }
    

    static async storefromApi(req,res){

        try {
            const { user } = req;
            const response = await fetch(`https://s3.amazonaws.com/roxiler.com/product_transaction.json`);
        
            // Parse the JSON data from the response
            const data = await response.json();
        
            // Prepare the data for bulk insertion
            const storeEntries = data.map(product => ({
                user_id: user.id,
                title: product.title,
                content: product.description,
                image: product.image,
                category: product.category,
                sold: product.sold,
                dateofSale: new Date(product.dateOfSale), // Ensure the date is properly formatted
                price: product.price,
            }));
        
            // Perform bulk insertion using Prisma
            await prisma.store.createMany({
                data: storeEntries,
            });
        
            res.status(200).json({ msg: "Database created successfully" });
        } catch (error) {
            console.error("Error while creating store entry:", error);
            return res.status(500).json({ message: "An error occurred while creating the store entry." });
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const { user } = req;
    
            // Find the store entry by ID
            const storeEntry = await prisma.store.findUnique({
                where: {
                    id: Number(id),
                },
            });
    
            // Check if the store entry exists and if the user is authorized to delete it
            if (!storeEntry || user.id !== storeEntry.user_id) {
                return res.status(403).json({
                    msg: "Unauthorized user to delete the product...",
                });
            }
    
            // Delete the store entry
            const deleteEntry = await prisma.store.delete({
                where: {
                    id: Number(id),
                },
            });
    
            // Return a success response
            res.status(200).json({
                msg: "Product deleted successfully",
                deleteEntry,
            });
        } catch (err) {
            console.error("Error while deleting store entry:", err);
            return res.status(500).json({ message: "An error occurred while deleting the store entry" });
        }
    }
    
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { user } = req;
            const body = req.body;
    
            const store = await prisma.store.findUnique({
                where: {
                    id: Number(id),
                },
            });

            if (!store || user.id !== store.user_id) {
                return res.status(400).json({ msg: "Unauthorized user" });
            }
    
            const validator = vine.compile(StoreSchema);
            const payload = await validator.validate(body);
    
            const image = req?.files?.image;
    
            if (image) {
                // Validate the uploaded image
                const isImageValid = validateImage(image.size, image.mimetype);
                if (isImageValid !== null) {
                    return res.status(400).json({
                        err: isImageValid,
                    });
                }
    
                // Prepare image name and upload path
                const imageExt = image.name.split(".").pop();
                const imageName = `${Math.floor(Math.random() * 1000)}.${imageExt}`;
                const path = `${process.cwd()}/public/images/${imageName}`;
    
                // Upload the image to the server
                await new Promise((resolve, reject) => {
                    image.mv(path, (err) => {
                        if (err) {
                            reject(new Error("Upload Failed"));
                        } else {
                            resolve();
                        }
                    });
                });
    
                // Remove the old image from the server if a new image is uploaded
                removeImage(store.image);
    
                // Update the payload with the new image
                payload.image = imageName;
            }
    
           // Update other fields conditionally if they are present
payload.title = body.title || store.title;
payload.content = body.content || store.content;

// Ensure price is converted to a number if it's present, otherwise fallback to the existing value
payload.price = body.price !== undefined ? Number(body.price) : store.price;

// Ensure sold is converted to a boolean if it's present, otherwise fallback to the existing value
payload.sold = body.sold !== undefined ? Boolean(body.sold) : store.sold;

payload.category = body.category || store.category;

            // Update the store entry in the database
            const updatedStore = await prisma.store.update({
                data: payload,
                where: {
                    id: Number(id),
                },
            });
    
            res.status(200).json({
                msg: "Store Updated Successfully",
                data: updatedStore,
            });
        } catch (error) {
            console.error("Error while updating store entry:", error);
            res.status(500).json({ msg: "An error occurred while updating the store entry." });
        }
    }
    static async indexatApi(req,res){
        try {
            const { id } = req.params;
        
            // Ensure the ID is treated as a number if your database uses numeric IDs
            const storeEntryById = await prisma.store.findUnique({
                where: { id: Number(id) } // Wrap id in an object
            });
        
            // Check if the store entry exists
            if (!storeEntryById) {
                return res.status(404).json({
                    status: 404,
                    msg: "Store entry not found"
                });
            }
        
            res.status(200).json({
                status: 200, // Fixed typo
                storeEntryById,
                msg: "Product fetched successfully" // Fixed typo
            });
        
        } catch (error) {
            console.log("Error:", error);
            res.status(500).json({ message: "An error occurred while fetching the unique record" }); // Changed to JSON object
        }
        
    }
    
}

export default StoreController;
