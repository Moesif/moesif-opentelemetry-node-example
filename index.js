require('dotenv').config();
const express = require("express");
const app = express();
const port = 6060; // You can change the port if needed
const axios = require('axios');
const { trace, context } = require('@opentelemetry/api');
const { logs } = require('@opentelemetry/api-logs');

const tracer = trace.getTracer('todos-server');
const logger = logs.getLogger('todos-server');

// Sample todo data (You'd likely use a database in a real application)
let todos = [
  { id: 1, task: "Learn Node.js", completed: false },
  { id: 2, task: "Build a REST API", completed: true }
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// fake database calls
async function fetchAllToDoesFromDB() {
  const currentSpan = trace.getSpan(context.active());
  // display traceid in the terminal
  console.log(`starting fetchingAllToDoesFromDB: traceid: ${currentSpan.spanContext().traceId} spanId: ${currentSpan.spanContext().spanId}`);

  const span = tracer.startSpan('fetching-todos');

  console.log(`starting new span fetchingAllToDoesFromDB: traceid: ${span.spanContext().traceId} spanId: ${span.spanContext().spanId}`);

  await delay(16);
  span.end();
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

async function deleteFromDb(id) {
  await delay(5);
  todos = todos.filter((t) => t.id !== parseInt(req.params.id));
  return;
}

// Enable parsing JSON in request bodies
app.use(express.json());

async function getRemoteTodos() {
  const response = await axios.get('https://jsonplaceholder.typicode.com/todos');
  return response.data;
}

async function getRemotePosts() {
  const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
  return response.data;
}

// GET /todos - Get all todos
app.get("/todos", async (req, res) => {
  const currentSpan = trace.getSpan(context.active());
  // set attributes to identify user or company
  currentSpan.setAttribute('user.id', 'abcdefg');
  currentSpan.setAttribute('company.id', 'company1');
  // can also add additional field value here.
  currentSpan.setAttribute('additional_metadata_field', 'foobar');

  logger.emit({
    body: 'initiating GET /todos request',
    severityText: 'INFO',
    attributes: {
      'user.id': 'abcdefg',
      'company.id': 'company1',
      'http.route': '/todos',
      'http.status_code': 200,
      'traceId': currentSpan.spanContext().traceId,
    },
  });

  const posts = await getRemotePosts();
  console.log('got posts remotely : ' + posts?.length);

  // display traceid in the terminal
  console.log(`staring api call: traceid: ${currentSpan.spanContext().traceId} spanId: ${currentSpan.spanContext().spanId}`);
  return tracer.startActiveSpan("load-data", async (span) => {
    span.setAttribute('data', 'foobar');
    console.log(`starting span in api hanlder: traceid: ${span.spanContext().traceId} spanId: ${span.spanContext().spanId}`);
    const data2 = await getRemoteTodos();
    console.log('got todos from data2: ' + data2?.length);
    span.addEvent('start-loading', { you: 'cool' });
    const data = await fetchAllToDoesFromDB();
    res.json(data);
    span.addEvent('finished-responding', { foo: 'bar' });
    span.end();

    logger.emit({
      body: 'successfully completed GET /todos request',
      severityText: 'INFO',
      attributes: {
        'user.id': 'abcdefg',
        'company.id': 'company1',
        'http.route': '/todos',
        'http.status_code': 200,
        'traceId': currentSpan.spanContext().traceId,
      },
    });
  });
});

// GET /todos/:id -  Get a single todo
app.get("/todos/:id", async (req, res) => {
  const currentSpan = trace.getSpan(context.active());
  // set attributes to identify user or company
  currentSpan.setAttribute('user.id', 'userstuff');
  currentSpan.setAttribute('company.id', 'company2');
  // can also add additional field value here.
  currentSpan.setAttribute('additional_metadata_field', 'foobar');

  const comments = await axios.get('https://jsonplaceholder.typicode.com/comments/1');
  console.log(comments?.data);
  const comments1 = await axios.get('https://jsonplaceholder.typicode.com/comments/2');
  console.log(comments1?.data);

  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) {
    logger.emit({
      body: 'no todo found for GET /todos/:id request',
      severityText: 'ERROR',
      severityNumber: 17,
      attributes: {
        'user.id': 'userstuff',
        'company.id': 'company2',
        'http.route': '/todos',
        'http.status_code': 404,
        'traceId': currentSpan.spanContext().traceId,
      },
    });
    return res.status(404).send("Todo not found");
  }
  logger.emit({
    body: 'successfully completed GET /todos/:id request',
    severityText: 'INFO',
    attributes: {
      'user.id': 'userstuff',
      'company.id': 'company2',
      'http.route': '/todos',
      'http.status_code': 200,
      'traceId': currentSpan.spanContext().traceId,
    },
  });
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
app.put("/todos/:id", async (req, res) => {
  const todoIndex = todos.findIndex((t) => t.id === parseInt(req.params.id));
  if (todoIndex === -1) {
    return res.status(404).send("Todo not found");
  }
  todos[todoIndex].task = req.body.task;
  todos[todoIndex].completed = req.body.completed;
  res.json(todos[todoIndex]);
});

// DELETE /todos/:id - Delete a todo
app.delete("/todos/:id", async (req, res) => {
  await deleteFromDb(parseInt(req.params.id));
  res.status(204).send(); // 204 No Content
});

app.listen(port, () => {
  console.log(`Todo API server listening on port ${port}`);
});
