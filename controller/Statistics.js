import prisma from "../DB/db.config.js";
import axios from 'axios'


class StatisticsApi{
    static async search(req,res){

        const page = Number(req.query.page) || 1;
        const limit  = Number(req.query.limit) || 10;
        const month_name = req.query.month;
        if(page<=0){
            page=1;
        }
        if(limit<=0 || limit>=100){
            limit =10;
        }

        const month_list  = [
            'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
        ]
        const month = month_list.indexOf(month_name)+1;

        //month will be from [1-12]
        if(!month || month<1 || month>12){
            res.status(400).json({
                err:"Invalid month check it.. "
            })


        }
        const search = req.query.search || ' ';
        const skip = (page-1)*limit;

        try{

            const searchresult=[];
            if(search.trim()){
                searchresult.push(
                    {
                        title:{
                            contains:search,
                            mode:'insensitive'
                        },
                        content:{
                            contains:search,
                            mode:'insensitive'
                        }
                    }
                )
                const searchNumber = parseInt(search);
                if(!isNaN(searchNumber)){
                    searchresult.push(
                        {
                            price:{
                                equals:searchNumber
                            }
                        }
                    )
                }
            }

            const queryOptions =  {
                where:{
                    Month:month,
                    OR:searchresult.length>0 ? searchresult : undefined
                }
            }
             
            const transactions =  await prisma.store.findMany({
                ...queryOptions,
                skip:skip,
                take:limit
            })

            const totalRecords = await prisma.store.count({
                ...queryOptions
            })

            const totalPage = Math.ceil(totalRecords/limit);

            res.status(200).json({
                data:transactions,
                metadData:{
                totalRecords:totalRecords,
                totalPage:totalPage,
                currentPage : page,
                currentLimit:limit

                }
            })


        }catch(error){
            console.log("Error while searching ", error);
            res.status(500).json({message:"Internal Server Error"})

        }

    }
    static async getmonth (req,res){
        try{

            const response  =await axios(`https://s3.amazonaws.com/roxiler.com/product_transaction.json`)
            const data = response.data;

            for(const product of data){
                const date = new Date(product.dateOfSale);
                const month  = date.getMonth()+1;
                const year = date.getFullYear();

                await prisma.store.updateMany({
                    where:{
                        id:product.id
                    },
                    data:{
                         Month:month,
                         Year:year,
                         id:product.id
                    }
                })

            }
            res.status(200).json({
                msg:"Month and Year added Sucessfully",
            })

        }catch(error){
            console.log("Error while getting month ", error);
            res.status(500).json({message:"Internal Server Error"})

        }
    }
}

export default  StatisticsApi;