import express from 'express';
import dotenv from 'dotenv';

import fileUpload from 'express-fileupload';

dotenv.config();
import Apiroutes from './routes/api.js'
const app = express();
const PORT = process.env.PORT || 8001;

// Middleware to parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload())
app.use(express.static('public/images'))
// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Hello, Server is Running' });
});


app.use('/api',Apiroutes);
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
