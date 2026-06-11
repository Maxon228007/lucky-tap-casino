"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
const auth_1 = __importDefault(require("./routes/auth"));
const spin_1 = __importDefault(require("./routes/spin"));
const slots_1 = __importDefault(require("./routes/slots"));
const auth_2 = require("./middleware/auth");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/spin', auth_2.authMiddleware, spin_1.default);
app.use('/api/slots', auth_2.authMiddleware, slots_1.default);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});
const distPath = path_1.default.join(__dirname, '..', '..', 'client', 'dist');
app.use(express_1.default.static(distPath));
app.get('*', (_req, res) => {
    res.sendFile(path_1.default.join(distPath, 'index.html'));
});
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
async function start() {
    try {
        await (0, db_1.initDb)();
        console.log('Database initialized successfully');
        app.listen(PORT, () => {
            console.log(`LuckyTap Casino server running on http://localhost:${PORT}`);
        });
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}
process.on('SIGINT', () => {
    (0, db_1.closeDb)();
    process.exit(0);
});
process.on('SIGTERM', () => {
    (0, db_1.closeDb)();
    process.exit(0);
});
start();
exports.default = app;
