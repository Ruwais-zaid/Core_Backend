/*
API Rate Limiter: An API rate limiter is a mechanism used to control 
the number of requests a client can make to an API within a specified 
time period. It is commonly implemented to prevent abuse, manage 
server load, and ensure fair usage among clients.

Throttling is a technique used to control the rate at which user van make request to an Api services . It is typically implementated to prevent abuse from the overloading or misuse of server by limiting the number of requests.
Why?
1.Prevent abuse from hacker who might try to overload the server by Dos attack
2.Cost control:Helps to manages the server efficentlty.
3.Performances:Maintain the overall performances from the sever and reduce the risk of sever crashes
4.Fair : No single user can can consume too many request if it show it will show an error of to many request 429.

*/

import rateLimit from 'express-rate-limit'

export const limiter=rateLimit({
    windowMs:1*60*1000,
    limit:10,
    standardHeaders:'draft-7',
    legacyHeaders:false
})