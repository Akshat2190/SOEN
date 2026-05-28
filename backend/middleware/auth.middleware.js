import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.service.js';

export const getAuthToken = (req) => {
    const authHeader = req.headers.authorization;

    return req.cookies?.token || authHeader?.split(' ')[1] || null;
};

export const authUser = async (req, res, next) => {
    try {
        const token = getAuthToken(req);

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized User' });
        }

        const isBlacklisted = await redisClient.get(token);

        if (isBlacklisted) {

            res.cookie('token', '');

            return res.status(401).json({ error: 'Unauthorized User' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        // console.log(error);
        res.status(401).json({ error: 'Unauthorized User' });
    }
}
