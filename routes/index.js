var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

function loadNotes() {
    const filePath = path.join(__dirname, '../data/notes.json');
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath);
        return JSON.parse(data);
    }
    return [];
}

// Route to display notes
router.get('/', function(req, res) {
    let notes = loadNotes();

    notes.sort((a, b) => {
        if (b.starred !== a.starred) {
            return b.starred - a.starred; 
        }
        return new Date(b.createdAt) - new Date(a.createdAt); 
    });

    res.render('index', { notes, query: '' });
});

// Route for searching notes
router.get('/search', function(req, res) {
    const query = req.query.query.toLowerCase(); 
    let notes = loadNotes();

    
    const searchResults = notes.filter(note => 
        note.title.toLowerCase().includes(query) || note.body.toLowerCase().includes(query)
    );

 
    res.render('index', { notes: searchResults, query });
});

// Route to create a new note 
router.get('/new', function(req, res) {
    res.render('note-form', { note: null });
});

// Route to handle creating a new note
router.post('/', function(req, res) {
    const { title, body, color } = req.body;

    if (!title || !body) {
        return res.status(400).send('Title and body are required!');
    }

    const notes = loadNotes();
    const newNote = {
        id: notes.length + 1, 
        title,
        body,
        color: color || 'white',
        starred: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    notes.push(newNote);
    fs.writeFileSync(path.join(__dirname, '../data/notes.json'), JSON.stringify(notes, null, 2));

    res.redirect('/');  
});

// Route to edit a note
router.get('/:id/edit', function(req, res) {
    const noteId = parseInt(req.params.id); 
    const notes = loadNotes();
    const note = notes.find(n => n.id === noteId);

    if (!note) {
        return res.status(404).send('Note not found');
    }

    res.render('edit-note', { note });
});

// Route to handle editing a note
router.post('/:id/edit', function(req, res) {
    const noteId = parseInt(req.params.id);
    const { title, body, color } = req.body;

    const notes = loadNotes();
    const note = notes.find(n => n.id === noteId);

    if (!note) {
        return res.status(404).send('Note not found');
    }

    note.title = title;
    note.body = body;
    note.color = color || 'white'; 
    note.updatedAt = new Date().toISOString();

    fs.writeFileSync(path.join(__dirname, '../data/notes.json'), JSON.stringify(notes, null, 2));

    res.redirect('/');
});

// Route to handle deleting a note
router.post('/:id/delete', function(req, res) {
    const noteId = parseInt(req.params.id);
    const notes = loadNotes();
    const updatedNotes = notes.filter(note => note.id !== noteId);

    fs.writeFileSync(path.join(__dirname, '../data/notes.json'), JSON.stringify(updatedNotes, null, 2));

    res.redirect('/');
});

// Route to handle starring a note
router.post('/:id/star', function(req, res) {
    const noteId = parseInt(req.params.id);
    const notes = loadNotes();

    const note = notes.find(n => n.id === noteId);
    if (!note) {
        return res.status(404).send('Note not found');
    }

    note.starred = !note.starred;
    note.updatedAt = new Date().toISOString();

    fs.writeFileSync(path.join(__dirname, '../data/notes.json'), JSON.stringify(notes, null, 2));

    res.redirect('/');
});

module.exports = router;
