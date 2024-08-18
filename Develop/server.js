const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// HTML Routes
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/notes.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// API Routes
app.get('/api/notes', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Failed to read notes' });
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;
  const newNote = { title, text, id: uuidv4() };

  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Failed to read notes' });
    }
    let notes;
    try {
      notes = JSON.parse(data);
    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
      return res.status(500).json({ error: 'Failed to parse notes' });
    }

    notes.push(newNote);
    fs.writeFile('./db/db.json', JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).json({ error: 'Failed to save note' });
      }
      res.json(newNote);
    });
  });
});

// Optional: DELETE Route for Deleting Notes
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;

  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Failed to read notes' });
    }
    const notes = JSON.parse(data);
    const filteredNotes = notes.filter(note => note.id !== noteId);

    fs.writeFile('./db/db.json', JSON.stringify(filteredNotes, null, 2), (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).json({ error: 'Failed to delete note' });
      }
      res.json({ ok: true });
    });
  });
});

app.listen(PORT, () => console.log(`App listening on PORT ${PORT}`));
