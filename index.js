require('dotenv').config();
const express = require("express");
const app = express();
const port = 6060; // You can change the port if needed

const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('todos-server');

// Sample todo data (You'd likely use a database in a real application)
let todos = [
  { id: 1, task: "Learn Node.js", completed: false },
  { id: 2, task: "Build a REST API", completed: true }
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function fetchAllToDoesFromDB() {
  await delay(16);
  return todos;
}

async function fetchToDoFromDB(id) {
  await delay(15);
  return todos.find((t) => t.id === parseInt(id));
}

async function addToDoToDB(task) {
  const newTodo = {
    id: todos.length + 1,
    task: task,
    completed: false
  };

  await delay(20);
  todos.push(newTodo);
  return newTodo;
}

// Enable parsing JSON in request bodies
app.use(express.json());

// GET /todos - Get all todos
app.get("/todos", (req, res) => {
  return tracer.startActiveSpan("load-data", (span) => {
    // Be sure to end the span!
    span.addEvent('start-loading', { you: 'cool'});
    res.json(todos);
    span.addEvent('finished-responding', { foo: 'bar'});
    span.end();
  });
});

// GET /todos/:id -  Get a single todo
app.get("/todos/:id", async (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) {
    return res.status(404).send("Todo not found");
  }
  res.json(todo);
});

// POST /todos - Create a new todo
app.post("/todos", (req, res) => {
  return tracer.startActiveSpan("add-todo", (span) => {
    // Be sure to end the span!

    const newTodo = {
      id: todos.length + 1,
      task: req.body.task,
      completed: false
    };

    todos.push(newTodo);
    res.status(201).json(newTodo);
    span.end();
  });
});

// PUT /todos/:id - Update a todo
app.put("/todos/:id", (req, res) => {
  const todoIndex = todos.findIndex((t) => t.id === parseInt(req.params.id));
  if (todoIndex === -1) {
    return res.status(404).send("Todo not found");
  }
  todos[todoIndex].task = req.body.task;
  todos[todoIndex].completed = req.body.completed;
  res.json(todos[todoIndex]);
});

// DELETE /todos/:id - Delete a todo
app.delete("/todos/:id", (req, res) => {
  todos = todos.filter((t) => t.id !== parseInt(req.params.id));
  res.status(204).send(); // 204 No Content
});

app.listen(port, () => {
  console.log(`Todo API server listening on port ${port}`);
});
