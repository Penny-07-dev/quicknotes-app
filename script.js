
"use strict";

// Select the page elements
const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const noteCategory = document.querySelector("#note-category");
const searchInput = document.querySelector("#search-input");
const notesList = document.querySelector("#notes-list");
const noteCount = document.querySelector("#note-count");
const errorMessage = document.querySelector("#error-message");

// Load saved notes, or start with an empty array
let notes = [];

try {
    const savedNotes = localStorage.getItem("quicknotes");

    if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);

        if (Array.isArray(parsedNotes)) {
            notes = parsedNotes.filter(note =>
                note &&
                typeof note.id === "string" &&
                typeof note.text === "string" &&
                typeof note.category === "string" &&
                typeof note.createdAt === "string" &&
                ["Personal", "Work", "Study"].includes(note.category)
            );
        }
    }
} catch (error) {
    notes = [];
}

// Save notes in the browser
function saveNotes() {
    try {
        localStorage.setItem("quicknotes", JSON.stringify(notes));
    } catch (error) {
        errorMessage.textContent =
            "Unable to save notes in this browser.";
    }
}

// Update the note count
function updateCount() {
    if (notes.length === 0) {
        noteCount.textContent = "You have no notes yet.";
    } else if (notes.length === 1) {
        noteCount.textContent = "You have 1 note.";
    } else {
        noteCount.textContent = `You have ${notes.length} notes.`;
    }
}

// Display notes on the page
function render() {
    notesList.replaceChildren();

    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredNotes = notes.filter(note =>
        note.text.toLowerCase().includes(searchTerm)
    );

    if (filteredNotes.length === 0 && searchTerm !== "") {
        const message = document.createElement("li");
        message.className = "empty-message";
        message.textContent = "No notes match your search.";
        notesList.appendChild(message);
    } else if (filteredNotes.length === 0) {
        const message = document.createElement("li");
        message.className = "empty-message";
        message.textContent = "No notes to display yet.";
        notesList.appendChild(message);
    }

    filteredNotes.forEach(note => {
        const listItem = document.createElement("li");
        listItem.classList.add("note-card");
        listItem.classList.add(
            `category-${note.category.toLowerCase()}`
        );

        const noteText = document.createElement("p");
        noteText.className = "note-text";
        noteText.textContent = note.text;

        const categoryLabel = document.createElement("span");
        categoryLabel.className = "note-category";
        categoryLabel.textContent = note.category;

        const dateLabel = document.createElement("time");
        dateLabel.className = "note-date";
        dateLabel.textContent = note.createdAt;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            `Delete note: ${note.text.slice(0, 40)}`
        );

        deleteButton.addEventListener("click", () => {
            deleteNote(note.id);
        });

        listItem.append(
            noteText,
            categoryLabel,
            dateLabel,
            deleteButton
        );

        notesList.appendChild(listItem);
    });

    updateCount();
}

// Add a new note
noteForm.addEventListener("submit", event => {
    event.preventDefault();

    const text = noteInput.value.trim();
    const category = noteCategory.value;

    if (text.length === 0) {
        errorMessage.textContent = "Please type a note first.";
        return;
    }

    if (text.length > 200) {
        errorMessage.textContent =
            "Notes must be 200 characters or fewer.";
        return;
    }

    if (!["Personal", "Work", "Study"].includes(category)) {
        errorMessage.textContent = "Please choose a valid category.";
        return;
    }

    const newNote = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text: text,
        category: category,
        createdAt: new Date().toLocaleString()
    };

    notes.unshift(newNote);
    saveNotes();

    errorMessage.textContent = "";
    noteInput.value = "";

    render();
});

// Delete an individual note
function deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    saveNotes();
    render();
}

// Search notes as the user types
searchInput.addEventListener("input", render);

// Display saved notes when the page opens
render();
