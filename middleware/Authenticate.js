import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized: No token provided or incorrect format" });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: Token is missing" });
    }

    console.log("Token received:", token);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log("JWT Verification error:", err);
            return res.status(401).json({ msg: "Unauthorized: Invalid or expired token" });
        }
        req.user=user;
        next();
    });
};

export default authMiddleware;
