import express from 'express'
import prisma from '../DB/db.config.js';
import { Router } from 'express'
import authMiddleware from '../middleware/Authenticate.js';

const routes  = Router();

routes.get('/store/v1/actions/:id',authMiddleware ,async (req,res)=>{

    try{

        const {id} = req.params;
        if(!id){
            res.status(200).json({
                error:"Product not found !"
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

export default routes;