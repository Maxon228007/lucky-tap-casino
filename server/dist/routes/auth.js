"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.post('/register', (req, res) => {
    const { telegramId, username, firstName } = req.body;
    if (!telegramId) {
        res.status(400).json({ error: 'telegramId is required' });
        return;
    }
    let user = (0, db_1.queryOne)('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);
    if (!user) {
        const result = (0, db_1.runQuery)('INSERT INTO users (telegram_id, username, first_name, balance, spins_remaining) VALUES (?, ?, ?, 500, 3)', [telegramId, username || '', firstName || '']);
        user = (0, db_1.queryOne)('SELECT * FROM users WHERE id = ?', [result.lastInsertRowid]);
    }
    else {
        (0, db_1.runQuery)('UPDATE users SET username = ?, first_name = ? WHERE telegram_id = ?', [username || '', firstName || '', telegramId]);
        user = (0, db_1.queryOne)('SELECT * FROM users WHERE id = ?', [user.id]);
    }
    res.json({ user });
});
router.get('/user/:telegramId', (req, res) => {
    const { telegramId } = req.params;
    const user = (0, db_1.queryOne)('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);
    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    resetSpinsIfNeeded(user);
    const freshUser = (0, db_1.queryOne)('SELECT * FROM users WHERE id = ?', [user.id]);
    res.json({ user: freshUser });
});
function resetSpinsIfNeeded(user) {
    const now = new Date();
    const lastReset = new Date(user.last_spin_reset + 'Z');
    const isNewDay = now.getUTCDate() !== lastReset.getUTCDate() ||
        now.getUTCMonth() !== lastReset.getUTCMonth() ||
        now.getUTCFullYear() !== lastReset.getUTCFullYear();
    if (isNewDay) {
        (0, db_1.runQuery)("UPDATE users SET spins_remaining = 3, last_spin_reset = datetime('now') WHERE id = ?", [user.id]);
    }
}
exports.default = router;
