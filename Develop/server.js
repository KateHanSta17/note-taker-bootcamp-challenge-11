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
  