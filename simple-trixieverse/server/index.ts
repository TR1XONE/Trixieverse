import express from 'express';
import cors from 'cors';
import { counterpickData, getChampionNames } from './data/counterpickData.js';
import { championBuilds } from './data/championBuilds.js';
import { championRunes } from './data/championRunes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Get all champion names for autocomplete
app.get('/api/counterpick/champions', (_req, res) => {
    res.json(getChampionNames());
});

// Get counterpick data for a specific champion
app.get('/api/counterpick/:champion', (req, res) => {
    const name = req.params.champion.toLowerCase();
    const champ = counterpickData.find(c => c.name.toLowerCase() === name);
    if (!champ) {
        return res.status(404).json({ error: 'Champion not found' });
    }
    // Enrich counters with build + rune data
    const enriched = {
        ...champ,
        counters: champ.counters.map(counter => ({
            ...counter,
            build: championBuilds[counter.name] || null,
            runes: championRunes[counter.name] || null
        }))
    };
    res.json(enriched);
});

app.listen(PORT, () => {
    console.log(`⚔️  Counterpick API running on http://localhost:${PORT}`);
});
