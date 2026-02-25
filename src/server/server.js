import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', '..', 'db.json');
const PORT = 3001;

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

function readDb() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            console.log(`ℹ️ Database file not found, creating new one at: ${DB_PATH}`);
            fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2), 'utf-8');
            return {};
        }
        const content = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(content);
    } catch (err) {
        console.error('❌ Database read error:', err.message);
        return {};
    }
}

function writeDb(data) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`✅ Database updated at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
        console.error('❌ Database write error:', err.message);
    }
}

// GET /store/:key  — read a value
app.get('/store/:key', (req, res) => {
    const db = readDb();
    const value = db[req.params.key];
    res.json({ value: value !== undefined ? value : null });
});

// POST /store/:key  — write a value
app.post('/store/:key', (req, res) => {
    const db = readDb();
    db[req.params.key] = req.body.value;
    writeDb(db);
    res.json({ ok: true });
});

// DELETE /store/:key — delete a value
app.delete('/store/:key', (req, res) => {
    const db = readDb();
    delete db[req.params.key];
    writeDb(db);
    res.json({ ok: true });
});

app.listen(PORT, () => {
    console.log(`✅ Storage server running at http://localhost:${PORT}`);
    console.log(`📦 Database file: ${DB_PATH}`);
});
