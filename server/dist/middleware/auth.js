"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
function authMiddleware(req, res, next) {
    const telegramId = req.headers['x-telegram-id'];
    if (!telegramId) {
        res.status(401).json({ error: 'Unauthorized: missing telegram id' });
        return;
    }
    req.telegramId = telegramId;
    next();
}
