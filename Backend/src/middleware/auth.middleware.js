const jwt = require('jsonwebtoken')
require('dotenv').config();

async function authMiddleware(req, res, next) {
    try{
        const token = req.cookies.token
    
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized. Please login first."
            })
        }
    
        const decoded = jwt.verify(token , process.env.JWT_SECRET)
        req.user = decoded

        next();

    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token. Please login again."
        })
    }
}

module.exports = authMiddleware;
