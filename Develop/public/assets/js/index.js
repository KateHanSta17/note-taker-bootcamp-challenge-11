// Declare variables for various DOM elements
let noteForm;
let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;

// Check if the current page is the notes page
if (window.location.pathname === '/notes') {
  noteForm = document.querySelector('.note-form');
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  clearBtn = document.querySelector('.clear-btn');
  noteList = document.querySelectorAll('.list-container .list-group');
}

// Show an element by setting its display style to 'inline'
const show = (elem) => {
  elem.style.display = 'inline';
};

// Hide an element by setting its display style to 'none'
const hide = (elem) => {
  elem.style.display = 'none';
};

// Object to keep track of the currently active note in the textarea
let activeNote = {};

// Fetch all notes from the server
const getNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(response => response.json());

// Save a new note to the server
const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  })
  .then(response => response.json())
  .then(data => console.log('Note saved:', data)) // Log saved note for debugging
  .catch(error => console.error('Error:', error)); // Log any errors

// Delete a note from the server using its ID
const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(response => response.json());

// Render the currently active note in the textarea
const renderActiveNote = () => {
  hide(saveNoteBtn); // Hide save button
  hide(clearBtn); // Hide clear button

  // If there is an active note, display it in read-only mode
  if (activeNote.id) {
    show(newNoteBtn); // Show the new note button
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    // If no active note, allow the user to create a new note
    hide(newNoteBtn);
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
  }
};

// Handle saving a new note
const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value,
  };
  saveNote(newNote).then(() => {
    getAndRenderNotes(); // Re-fetch and render notes after saving
    renderActiveNote(); // Re-render active note
  });
};

// Handle deleting a note
const handleNoteDelete = (e) => {
  e.stopPropagation();

  const note = e.target;
  const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;

  // If the active note is the one being deleted, reset activeNote
  if (activeNote.id === noteId) {
    activeNote = {};
  }

  deleteNote(noteId).then(() => {
    getAndRenderNotes(); // Re-fetch and render notes after deletion
    renderActiveNote(); // Re-render active note
  });
};

// Handle viewing a specific note
const handleNoteView = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  renderActiveNote(); // Display the selected note
};

// Handle creating a new note by clearing the active note
const handleNewNoteView = (e) => {
  activeNote = {};
  show(clearBtn); // Show the clear button
  renderActiveNote(); // Render the empty note form
};

// Handle rendering buttons based on note form content
const handleRenderBtns = () => {
  show(clearBtn);
  if (!noteTitle.value.trim() && !noteText.value.trim()) {
    hide(clearBtn); // Hide clear button if form is empty
  } else if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn); // Hide save button if any field is empty
  } else {
    show(saveNoteBtn); // Show save button if both fields have content
  }
};

// Render the list of note titles in the sidebar
const renderNoteList = async (notes) => {
  let jsonNotes = await notes.json();
  console.log('Received notes:', jsonNotes); // Log received notes for debugging

  // Clear the existing note list if on the notes page
  if (window.location.pathname === '/notes') {
    noteList.forEach((el) => (el.innerHTML = ''));
  }

  let noteListItems = [];

  // Create a list item for each note with an optional delete button
  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');

    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.innerText = text;
    spanEl.addEventListener('click', handleNoteView);

    liEl.append(spanEl);

    if (delBtn) {
      const delBtnEl = document.createElement('i');
      delBtnEl.classList.add(
        'fas',
        'fa-trash-alt',
        'float-right',
        'text-danger',
        'delete-note'
      );
      delBtnEl.addEventListener('click', handleNoteDelete);

      liEl.append(delBtnEl);
    }

    return liEl;
  };

  // If there are no notes, show a placeholder message
  if (jsonNotes.length === 0) {
    noteListItems.push(createLi('No saved Notes', false));
  }

  // Create a list item for each note and attach data attributes
  jsonNotes.forEach((note) => {
    const li = createLi(note.title);
    li.dataset.note = JSON.stringify(note);

    noteListItems.push(li);
  });

  // Append all list items to the note list container
  if (window.location.pathname === '/notes') {
    noteListItems.forEach((note) => noteList[0].append(note));
  }
};

// Fetch and render the list of notes from the server
const getAndRenderNotes = () => getNotes().then(renderNoteList);

// If on the notes page, add event listeners to buttons
if (window.location.pathname === '/notes') {
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  clearBtn.addEventListener('click', renderActiveNote);
  noteForm.addEventListener('input', handleRenderBtns);
}

// Initial fetching and rendering of notes
getAndRenderNotes();
