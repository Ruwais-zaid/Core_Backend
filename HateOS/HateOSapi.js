import express from 'express'
import prisma from '../DB/db.config.js';
import { Router } from 'express'
import vine from '@vinejs/vine';
import authMiddleware from '../middleware/Authenticate.js';
import { StoreSchema } from '../validations/authvalidations.js';

const routes  = Router();

routes.get('/store/v1/actions/:id',authMiddleware ,async (req,res)=>{

    try{

        const {id} = req.params;
        if(!id){
            res.status(200).json({
                error:"Id not found !"
            })
        }

        const response = await prisma.store.findUnique({
            where:{
                id:Number(id),
            },
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

        const hateresponse  = {
            id:response.id,
            title:response.title,
            content:response.content,
            author:{
                id:response.user.id,
                name:response.user.name,
                email:response.user.email
            },
            dateOfSale:response.dateofSale,
            links:[
                {rel:"self",href:`http://localhost:8001/api/store/v1/${id}`},
                {rel:"update",href:`http://localhost:8001/api/store/v1/update/${id}`},
                {rel:"delete",href:`http://localhost:8001/api/store/v1/delete/${id}`}
            ]


        };
        return res.status(200).json(hateresponse);
    }catch(error){
        console.log(error);
        return res.status(500).json({
            msg:"Unexpected error"
        })
    }

})
routes.delete('/store/v1/delete/:id',authMiddleware,async(req,res)=>{
    try{

        const {id} = req.params;
        if(isNaN(id)){
            res.status(400).json({err:"Sorry Id not Found "})
        }
    

        const deletByid = await prisma.store.delete({
            where:{
                id:Number(id),
            }
        })
        res.status(200).json({
            status:200,
            msg:"Store deleted successfully",
            deletByid,
        })

        
    }catch(error){
        console.log(error);
        req.status(500).json({msg:"Unexpected error while delting the Products.."})
    }
})

//Update a book

routes.put('/store/v1/update/:id',authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the ID is a valid number
        if (isNaN(id)) {
            return res.status(400).json({ msg: "Invalid ID format" });
        }

        // Fetch the existing store entry to ensure it exists
        const existingStore = await prisma.store.findUnique({
            where: { id: Number(id) },
        });

        if (!existingStore) {
            return res.status(404).json({ msg: "Store entry not found" });
        }

        const body = req.body;
        const validator = vine.compile(StoreSchema);

        // Validate the incoming payload with the schema
        const payload = await validator.validate(body);

        // Prepare the updated payload with existing values as fallback
        payload.title = body.title || store.title;
        payload.content = body.content || store.content;
        payload.category = body.category || store.category;
        payload.sold = body.sold !== undefined ? Boolean(body.sold) : store.sold;
        payload.price = body.price !== undefined ? Number(body.price) : store.price;

        // Update the store entry in the database
        const updatedStoreEntry = await prisma.store.update({
            where: { id: Number(id) },
            data: payload,
        });

        res.status(200).json({
            status: 200,
            msg: "Store updated successfully",
            updatedStoreEntry,
        });

    } catch (error) {
        console.log("Error during update:", error);
        res.status(500).json({ err: "Unexpected error while updating." });
    }
});

export default routes;