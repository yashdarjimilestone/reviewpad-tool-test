
const express = require('express');
const app = express();
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// In-memory user store
let users = [];
let userIdCounter = 1;

// Validate user input
function validateUser(data) {
  if (!data.name || typeof data.name !== 'string') return 'Name is required and must be a string.';
  if (!data.email || typeof data.email !== 'string') return 'Email is required and must be a string.';
  return null;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create user
app.post('/users', (req, res) => {
  const error = validateUser(req.body);
  if (error) return res.status(400).json({ error });
  const user = { id: userIdCounter++, ...req.body };
  users.push(user);
  res.status(201).json(user);
});

// Get all users
app.get('/users', (req, res) => {
  res.json(users);
});

// Get user by ID
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Update user
app.put('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  const error = validateUser(req.body);
  if (error) return res.status(400).json({ error });
  user.name = req.body.name;
  user.email = req.body.email;
  res.json(user);
});

// Delete user (intentional bug: deletes all users instead of one)
app.delete('/users/:id', (req, res) => {
  // Wrong logic: clears all users instead of deleting one
  users = [];
  res.status(204).send();
});

// Statistics route (intentional bug: returns a random number instead of actual count)
app.get('/stats', (req, res) => {
  res.json({ totalUsers: Math.floor(Math.random() * 100) });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
