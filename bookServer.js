const { NodeSDK } = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require('@opentelemetry/sdk-metrics');

const express = require('express');
const app = express();
const port = 7070; // You can change the port if needed



// Sample book data (You'd likely use a database in a real application)
let books = [
    { id: 1, task: 'Learn Node.js', completed: false },
    { id: 2, task: 'Build a REST API', completed: true }
];

// Enable parsing JSON in request bodies
app.use(express.json());

// GET /books - Get all books
app.get('/books', (req, res) => {
    res.json(books);
});

// GET /books/:id -  Get a single book
app.get('/books/:id', (req, res) => {
    const book = books.find(t => t.id === parseInt(req.params.id));
    if (!book) {
        return res.status(404).send('book not found');
    }
    res.json(book);
});

// POST /books - Create a new book
app.post('/books', (req, res) => {
    const newbook = {
        id: books.length + 1,
        task: req.body.task,
        completed: false
    };
    books.push(newbook);
    res.status(201).json(newbook);
});

// PUT /books/:id - Update a book
app.put('/books/:id', (req, res) => {
    const bookIndex = books.findIndex(t => t.id === parseInt(req.params.id));
    if (bookIndex === -1) {
        return res.status(404).send('book not found');
    }
    books[bookIndex].task = req.body.task;
    books[bookIndex].completed = req.body.completed;
    res.json(books[bookIndex]);
});

// DELETE /books/:id - Delete a book
app.delete('/books/:id', (req, res) => {
    books = books.filter(t => t.id !== parseInt(req.params.id));
    res.status(204).send(); // 204 No Content
});

app.listen(port, () => {
    console.log(`book API server listening on port ${port}`);
});
