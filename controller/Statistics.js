import prisma from "../DB/db.config.js";
import axios from 'axios'


class StatisticsApi{
    static async search(req, res) {
        let page = Number(req.query.page) || 1; 
        let limit = Number(req.query.limit) || 10;
        const month_name = req.query.month || '';
        const search = req.query.search || '';
    
        if (page <= 0) {
            page = 1;
        }
        if (limit <= 0 || limit > 100) {
            limit = 10;
        }
    
        const month_list = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    
        const month = month_list.indexOf(month_name) + 1;
    
        // Validate month
        if (!month || month < 1 || month > 12) {
            return res.status(400).json({
                error: "Invalid month, please check the input."
            });
        }
    
        const skip = (page - 1) * limit;
    
        try {
            const searchConditions = [];
    
            if (search.trim()) {
                searchConditions.push(
                    {
                        title: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        content: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                );
    
                const searchNumber = parseInt(search);
                if (!isNaN(searchNumber)) {
                    searchConditions.push(
                        {
                            price: {
                                equals: searchNumber
                            }
                        }
                    );
                }
            }
    
            const queryOptions = {
                where: {
                    Month: month,
                    OR: searchConditions.length > 0 ? searchConditions : undefined
                }
            };
    
            const transactions = await prisma.store.findMany({
                ...queryOptions,
                skip: skip,
                take: limit,
                orderBy:{
                    created_at:'asc'
                }
            });
    
            const totalRecords = await prisma.store.count(queryOptions);
    
            const totalPages = Math.ceil(totalRecords / limit);
    
            res.status(200).json({
                data: transactions,
                metaData: {
                    totalRecords: totalRecords,
                    totalPages: totalPages,
                    currentPage: page,
                    currentLimit: limit
                }
            });
    
        } catch (error) {
            console.log("Error while searching: ", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
    
    static async getmonth (res){
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
    static async getPriceRange(req, res) {
        const month = req.query.month;
    
        const month_list = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    
        // Get month index (1-12)
        const month_ind = month_list.indexOf(month) + 1;
    
        if (month_ind < 1 || month_ind > 12) {
            return res.status(400).json({ error: "Invalid month parameter. Please provide a valid month." });
        }
    
        const priceRanges = [
            { range: "0-100", min: 0, max: 100 },
            { range: '201-300', min: 201, max: 300 },
            { range: '301-400', min: 301, max: 400 },
            { range: '401-500', min: 401, max: 500 },
            { range: '501-600', min: 501, max: 600 },
            { range: '601-700', min: 601, max: 700 },
            { range: '701-800', min: 701, max: 800 },
            { range: '801-900', min: 801, max: 900 },
            { range: '901-above', min: 901, max: Infinity }
        ];
    
        try {
            const result = await Promise.all(priceRanges.map(async (range) => {
                const itemCount = await prisma.store.aggregate({
                    where: {
                        Month: month_ind,
                        price: {
                            gte: range.min,
                            lte: range.max === Infinity ? undefined : range.max
                        }
                    },
                    _count: {
                        price: true 
                    }
                });
    
                return {
                    range: range.range,
                    count: itemCount._count.price
                };
            }));
    
            res.status(200).json({ data: result });
    
        } catch (error) {
            console.error("Error fetching price range:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    static async getUniqueCategory(req, res) {
        const month = req.query.month;
        const month_list = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const month_int = month_list.indexOf(month) + 1; 
        if (month_int < 1 || month_int > 12) {
            return res.status(400).json({ error: "Invalid month parameter. Please provide a valid month." });
        }
    
        try {
            const result = await prisma.store.groupBy({
                by: ['category'],
                where: {
                    Month: month_int
                },
                _count: {
                    price: true,
                },
                _avg: {
                    price: true,
                },
                _sum: {
                    price: true
                }
            });

            const formattedData = result.map(item => ({
                Category: item.category,
                Total_Count: item._count.price,
                Total_Sum: item._sum.price,
                Average: item._avg.price
            }));
    
            res.status(200).json({ data: formattedData });
        } catch (error) {
            console.error("Error fetching unique categories:", error); 
            res.status(500).json({ error: "Internal server error" });
        }
    }
    static async totalStatistics(req,res){
        const month = req.query.month;
        const month_list = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const month_int = month_list.indexOf(month) + 1; 
        if (month_int < 1 || month_int > 12) {
            return res.status(400).json({ error: "Invalid month parameter. Please provide a valid month." });
        }

        try{
            const ToatlSoldItem = await prisma.store.count({
                where:{
                    Month:month_int,
                    sold:true,
                }
            })
            const TotalNotSoldItem = await prisma.store.count({
                where:{
                    Month:month_int,
                    sold:false
                }
            })

            const TotalSoldAmount =  await prisma.store.aggregate({
                where:{
                    Month:month_int,
                },
                _sum:{
                    price:true
                }
            })

            return res.status(200).json({
                data:[
                    {
                    TotalSoldItem:ToatlSoldItem,
                    TotalNotSoldItem:TotalNotSoldItem,
                    TotalSoldAmount:TotalSoldAmount._sum.price
                    }

                ]
            })
        }catch(eror){
            res.status(500).json({
                msg:"Error finding the Item from Store"
            })
        }
    }

    static async allStats(req, res) {
        const month = req.query.month;
        const month_list = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const month_int = month_list.indexOf(month) + 1; 
        if (month_int < 1 || month_int > 12) {
            return res.status(400).json({ error: "Invalid month parameter. Please provide a valid month." });
        }
    
        try {
            // Fetch unique categories
            const uniqueCategories = await prisma.store.groupBy({
                by: ['category'],
                where: { Month: month_int },
                _count: { price: true },
                _avg: { price: true },
                _sum: { price: true }
            });
    
            const formattedCategories = uniqueCategories.map(item => ({
                Category: item.category,
                Total_Count: item._count.price,
                Total_Sum: item._sum.price,
                Average: item._avg.price
            }));
    
            // Fetch total statistics
            const totalSoldItems = await prisma.store.count({
                where: { Month: month_int, sold: true }
            });
    
            const totalNotSoldItems = await prisma.store.count({
                where: { Month: month_int, sold: false }
            });
    
            const totalSoldAmount = await prisma.store.aggregate({
                where: { Month: month_int },
                _sum: { price: true }
            });
    
            // Fetch price ranges
            const priceRanges = [
                { range: "0-100", min: 0, max: 100 },
                { range: '101-200', min: 101, max: 200 },
                { range: '201-300', min: 201, max: 300 },
                { range: '301-400', min: 301, max: 400 },
                { range: '401-500', min: 401, max: 500 },
                { range: '501-600', min: 501, max: 600 },
                { range: '601-700', min: 601, max: 700 },
                { range: '701-800', min: 701, max: 800 },
                { range: '801-900', min: 801, max: 900 },
                { range: '901-above', min: 901, max: Infinity }
            ];
    
            const priceRangeCounts = await Promise.all(priceRanges.map(async (range) => {
                const itemCount = await prisma.store.aggregate({
                    where: {
                        Month: month_int,
                        price: {
                            gte: range.min,
                            lte: range.max === Infinity ? undefined : range.max
                        }
                    },
                    _count: { price: true }
                });
    
                return {
                    range: range.range,
                    count: itemCount._count.price
                };
            }));
    
            // Combine all results
            res.status(200).json({
                uniqueCategories: formattedCategories,
                totalStatistics: {
                    TotalSoldItems: totalSoldItems,
                    TotalNotSoldItems: totalNotSoldItems,
                    TotalSoldAmount: totalSoldAmount._sum.price
                },
                priceRangeCounts: priceRangeCounts
            });
        } catch (error) {
            console.error("Error fetching all statistics:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
    


    
    
}
export default  StatisticsApi;