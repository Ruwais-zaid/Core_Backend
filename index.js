import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import helmet from 'helmet'
import fileUpload from 'express-fileupload';

dotenv.config();
import Apiroutes from './routes/api.js'
import ApiHateOs from './HateOS/HateOSapi.js'
const app = express();
const PORT = process.env.PORT || 8001;

// Middleware to parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload())
app.use(express.static('public/images'))

//* Use Cors so that my server is host any other origin (Cross Origin Resourse Sharing)
app.use(cors({}))

//* Using helmet for security headers that help to protect helps from Cross-Site-Scripting(XSS) and other vulnerablities

app.use(helmet({}))
// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Hello, Server is Running' });
});


app.use('/api',Apiroutes);
app.use('/api',ApiHateOs);
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
