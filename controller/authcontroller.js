import prisma from "../DB/db.config.js";
import vine, { errors } from '@vinejs/vine';
import { registerSchema, loginSchema } from "../validations/authvalidations.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class AuthController {
    static async register(req, res) {
        try {
            const body = req.body;
            const validator = vine.compile(registerSchema);
            const payload = await validator.validate(body);

            //* Check if email already exists
            const findUser = await prisma.user.findUnique({
                where: { email: payload.email }
            });

            if (findUser) {
                return res.status(400).json({
                    error: "Email is already taken. Choose another one",
                });
            }

            //* Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = bcrypt.hashSync(payload.password, salt);

            //* Create new user
            const new_user = await prisma.user.create({
                data: {
                    ...payload,
                    password: hashedPassword
                }
            });

            return res.status(200).json({
                status: 200,
                message: "User created successfully",
                new_user
            });

        } catch (error) {
            if (error instanceof errors.E_VALIDATION_ERROR) {
                return res.status(400).json({ error: error.messages });
            } else {
                // Handle other errors, or log them for debugging
                console.error("An unexpected error occurred:", error);
                return res.status(500).json({ error: "Internal server error" });
            }
        }
    }

    static async Login(req, res) {
        try {
            const body = req.body;
            const validator = vine.compile(loginSchema);
            const payload = await validator.validate(body);

            const user = await prisma.user.findUnique({
                where: {
                    email: payload.email
                }
            });

            if (!user) {
                return res.status(400).json({
                    error: "No user found with this email"
                });
            }

            //* Check if the password is valid
            const isPasswordValid = bcrypt.compareSync(payload.password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({
                    error: "Invalid credentials"
                });
            }

            //* Create JWT payload
            const payloadData = {
                id: user.Id,
                name: user.name,
                email: user.email
            };

            const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
                expiresIn: '120d'
            });

            return res.status(200).json({
                message: "User logged in successfully",
                user:{
                    id:user.id,
                    name:user.name,
                    email:user.email

                },
                acess_token:`Bearer ${token}`
                
            });

        } catch (error) {
            console.log("Login error", error);
            return res.status(500).json({
                error: "Internal server error"
            });
        }
    }
}

export default AuthController;
