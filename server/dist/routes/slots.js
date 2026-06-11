"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
const SLOT_SYMBOLS = [
    { id: 0, name: '🍒', value: 2, weight: 0.3 },
    { id: 1, name: '🍋', value: 3, weight: 0.25 },
    { id: 2, name: '🍊', value: 5, weight: 0.18 },
    { id: 3, name: '🍇', value: 8, weight: 0.12 },
    { id: 4, name: '💎', value: 15, weight: 0.08 },
    { id: 5, name: '7️⃣', value: 25, weight: 0.04 },
    { id: 6, name: '⭐', value: 50, weight: 0.02 },
    { id: 7, name: '👑', value: 100, weight: 0.01 },
];
function getWeightedSymbol() {
    const rand = Math.random();
    let cumulative = 0;
    for (const sym of SLOT_SYMBOLS) {
        cumulative += sym.weight;
        if (rand < cumulative)
            return sym;
    }
    return SLOT_SYMBOLS[SLOT_SYMBOLS.length - 1];
}
function calculateWin(reels, bet) {
    const [r1, r2, r3] = reels;
    if (r1.id === r2.id && r2.id === r3.id) {
        return bet * r1.value * 3;
    }
    if (r1.id === r2.id || r2.id === r3.id || r1.id === r3.id) {
        const matchedSymbol = r1.id === r2.id ? r1 : r3;
        return Math.floor(bet * matchedSymbol.value * 0.5);
    }
    return 0;
}
router.post('/spin', (req, res) => {
    const telegramId = req.telegramId;
    const { bet } = req.body;
    if (!bet || bet < 10) {
        res.status(400).json({ error: 'Minimum bet is 10 coins' });
        return;
    }
    const user = (0, db_1.queryOne)('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);
    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    if (user.balance < bet) {
        res.status(400).json({ error: 'Insufficient balance' });
        return;
    }
    const reels = [
        getWeightedSymbol(),
        getWeightedSymbol(),
        getWeightedSymbol(),
    ];
    const winAmount = calculateWin(reels, bet);
    const netChange = winAmount - bet;
    (0, db_1.runQuery)('UPDATE users SET balance = balance + ?, total_wagered = total_wagered + ? WHERE id = ?', [netChange, bet, user.id]);
    const resultSymbols = reels.map(r => r.name).join('|');
    (0, db_1.runQuery)('INSERT INTO slots_history (user_id, bet, result, win_amount) VALUES (?, ?, ?, ?)', [user.id, bet, resultSymbols, winAmount]);
    const updatedUser = (0, db_1.queryOne)('SELECT * FROM users WHERE id = ?', [user.id]);
    res.json({
        reels: reels.map(r => ({ name: r.name, id: r.id })),
        winAmount,
        balance: updatedUser.balance,
    });
});
router.get('/history', (req, res) => {
    const telegramId = req.telegramId;
    const user = (0, db_1.queryOne)('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);
    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    const history = (0, db_1.queryAll)('SELECT * FROM slots_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20', [user.id]);
    res.json({ history });
});
exports.default = router;
