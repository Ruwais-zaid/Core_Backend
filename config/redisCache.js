/*
REDIS:
What is : (Remote Dictionary Server) is an in-memory, key-value data store that is widely used as a database,
 cache, and message broker. It supports various data structures like strings, lists, sets, hashes, and more, making it versatile for different types of applications. Redis is known for its high performance, low latency, and scalability, which make it suitable for real-time applications.

 
*/
import redis from 'express-redis-cache'

export const redisCache = redis({
    port:6379,
    host:"localhost",
    prefix:"master_backend",
    expire:60*60,
})
export default redisCache;