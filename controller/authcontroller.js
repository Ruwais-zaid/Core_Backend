import prisma from "../DB/db.config.js";
import vine, { errors } from '@vinejs/vine';
import { registerSchema, loginSchema } from "../validations/authvalidations.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class AuthController {
    // User Registration
    static async register(req, res) {
        try {
            const body = req.body;
            const validator = vine.compile(registerSchema);
            const payload = await validator.validate(body);

            // Check if email already exists
            const findUser = await prisma.user.findUnique({
                where: { email: payload.email }
            });

            if (findUser) {
                return res.status(409).json({  // Use 409 Conflict status code for duplicate entries
                    error: "Email is already taken. Choose another one.",
                });
            }

            // Hash the password asynchronously
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(payload.password, salt);

            // Create new user
            const newUser = await prisma.user.create({
                data: {
                    ...payload,
                    password: hashedPassword
                }
            });

            return res.status(201).json({  // Use 201 Created status code for successful creation
                message: "User created successfully",
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email
                }
            });

        } catch (error) {
            if (error instanceof errors.E_VALIDATION_ERROR) {
                return res.status(400).json({ error: error.messages });
            } else {
                // Handle other unexpected errors
                console.error("An unexpected error occurred:", error);
                return res.status(500).json({ error: "Internal server error" });
            }
        }
    }

    // User Login
    static async Login(req, res) {
        try {
            const body = req.body;
            const validator = vine.compile(loginSchema);
            const payload = await validator.validate(body);

            const user = await prisma.user.findUnique({
                where: { email: payload.email }
            });

            if (!user) {
                return res.status(404).json({  // Use 404 Not Found for user not found
                    error: "No user found with this email"
                });
            }

            // Check if the password is valid
            const isPasswordValid = await bcrypt.compare(payload.password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({  // Use 401 Unauthorized for invalid credentials
                    error: "Invalid credentials"
                });
            }

            const payloadData = {
                id: user.id,
                name: user.name,
                email: user.email
            };

            const token = jwt.sign(payloadData, process.env.JWT_SECRET, { expiresIn: '120d' });

            return res.status(200).json({
                message: "User logged in successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                access_token: `Bearer ${token}`  // Corrected typo from `acess_token` to `access_token`
            });

        } catch (error) {
            console.log("Login error:", error);
            return res.status(500).json({
                error: "Internal server error"
            });
        }
    }
}

export default AuthController;
