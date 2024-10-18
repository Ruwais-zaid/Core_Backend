import prisma from "../DB/db.config.js";
import { validateImage } from "../utils/helper.js";
import { removeImage } from "../utils/removeImage.js";
import StoreApiTransform from "../utils/StoreApitransform.js";
import { StoreSchema } from "../validations/authvalidations.js";
import vine from "@vinejs/vine";

class StoreController {
    // Method to fetch store list with pagination
    static async index(req, res) {
        try {
            // Parse query parameters for pagination with default values and bounds checking
            const page = Math.max(Number(req.query.page) || 1, 1); // Ensure page is at least 1
            const limit = Math.min(Math.max(Number(req.query.limit) || 2, 1), 10); // Limit is between 1 and 10
            const skip = (page - 1) * limit;

            // Fetch the list of stores with pagination and user details
            const storeList = await prisma.store.findMany({
                take: limit,
                skip: skip,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
            });

            // Transform the store list data
            const transformedStores = storeList?.map((item) => StoreApiTransform.transform(item));
            const totalStores = await prisma.store.count();
            const totalPages = Math.ceil(totalStores / limit);

            return res.status(200).json({
                status: 200,
                stores: transformedStores,
                metaData: {
                    totalPages,
                    currentPage: page,
                    currentLimit: limit,
                },
            });
        } catch (error) {
            console.error("Error fetching store list:", error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // Method to create a new store entry
    static async store(req, res) {
        try {
            const { body } = req;
            const { user } = req;

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
            payload.user_id = user.id;

            // Create a new store entry in the database
            const storeEntry = await prisma.store.create({
                data: payload,
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
    static async update(req,res){
        try{

            const {id} = req.params;
            const {user}= req
            const body = req.body;

            const store = await prisma.store.findUnique({
                where:{
                    id:Number(id)
                }
            })

            if(!store || user.id!==id){
                res.status(400).json({msg:"Unauthorise user"})
            }

            const validator  = vine.compile(StoreSchema);
            const  payload  = validator.validate(body);

            const image  = req?.files?.image;
            const title  = req?.body.title;
            const content = req?.body.content;
            const price = req?.body.price;
            const category = req?.body.category;
            const sold = req?.body.sold;

            if(image){
                const isImageValidate = validateImage(image.size,image.mimetype);
                if(isImageValidate !==null){
                    res.status(400).json({
                        err:isImageValidate
                    })

                }
            }

            const imageExt = image.name.split(".").pop();
            const imageName = `${Math.floor(Math.random()*1000)}.${imageExt}`
            const path =  `${process.cwd()}/public/images/${imageName}`

            await new Promise((resolve,reject)=>{
                image.mv(path,(err)=>{
                    if(err){
                        reject(new Error("Upload Failed"))
                    }
                    else{
                        resolve();
                    }
                })
            })
            
            if(image){
                removeImage(store.image);
            }
            payload.image = imageName;
            if(title){
                payload.title = title;
            }
            else{
                payload.title = store.title;
            }
            if(content){
                payload.content = content;
            }
            else{
                payload.content = store.content;
            }
            if(price){
                payload.price=  price;
            }
            else{
                payload.price =  content.price;
            }
            if(sold){
                payload.sold = sold;
            }
            else{
                payload.sold = store.sold;
            }
            if(category){
                payload.category = category;
            }
            else{
                payload.category = store.category;
            }
            await prisma.store.update({
                data:payload,
                where:{
                    id:Number(id)
                }
            })
            res.status(200).json(
                {
                    msg:"Store Updated Sucessfully",
                    payload
                }
            )

        }catch(error){
            console.error("Error while updating store entry:", error);
        }
    }
}

export default StoreController;
