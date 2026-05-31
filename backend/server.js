const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/elements', (req, res) => {
  const level = parseInt(req.query.level) || 1;
  const elements = db.getElements(level);
  res.json(elements);
});

app.get('/api/elements/:id', (req, res) => {
  const element = db.getElementById(req.params.id);
  if (element) {
    res.json(element);
  } else {
    res.status(404).json({ error: 'Element not found' });
  }
});

app.get('/api/levels', (req, res) => {
  const levels = [];
  for (let i = 1; i <= 10; i++) {
    levels.push({
      level: i,
      timeLimit: Math.max(60 - (i - 1) * 5, 20),
      targetScore: i * 100
    });
  }
  res.json(levels);
});

app.post('/api/scores', (req, res) => {
  const { player_name, score, level } = req.body;
  
  if (!player_name || score === undefined || !level) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const result = db.addScore(player_name, score, level);
  
  res.status(201).json(result);
});

app.get('/api/scores', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const scores = db.getScores(limit);
  res.json(scores);
});

app.post('/api/check-synthesis', (req, res) => {
  const { element_id, protons, neutrons, electrons } = req.body;
  
  if (!element_id || protons === undefined || neutrons === undefined || electrons === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const result = db.checkSynthesis(element_id, protons, neutrons, electrons);
  
  if (result === null) {
    return res.status(404).json({ error: 'Element not found' });
  }
  
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
