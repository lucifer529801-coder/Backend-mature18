const express = require('express');
const app = express();

// Enable CORS and JSON
app.use(require('cors')());
app.use(express.json());

// Data storage
let users = [];
let transactions = [];

// ==================== ROUTES ====================

// Root route - SIMPLE
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MATURE Backend is LIVE!',
    time: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// User registration
app.post('/api/register', (req, res) => {
  const user = {
    id: Date.now(),
    ...req.body,
    ip: req.ip,
    timestamp: new Date().toISOString()
  };
  users.push(user);
  res.json({ success: true, message: 'Registered' });
});

// User login
app.post('/api/login', (req, res) => {
  res.json({ success: true, message: 'Login successful' });
});

// Transaction
app.post('/api/transaction', (req, res) => {
  const transaction = {
    id: Date.now(),
    ...req.body,
    ip: req.ip,
    timestamp: new Date().toISOString()
  };
  transactions.push(transaction);
  res.json({ success: true, message: 'Transaction submitted' });
});

// Admin routes
app.get('/api/admin/users', (req, res) => {
  res.json(users);
});

app.get('/api/admin/transactions', (req, res) => {
  res.json(transactions);
});

app.get('/api/admin/stats', (req, res) => {
  res.json({
    totalUsers: users.length,
    totalTransactions: transactions.length,
    totalVolume: transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
  });
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  if (req.body.username === 'admin' && req.body.password === 'admin123') {
    res.json({ success: true, message: 'Admin login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Catch-all route
app.get('*', (req, res) => {
  res.json({ 
    error: 'Route not found: ' + req.path,
    try: '/',
    available: ['/', '/health', '/api/register', '/api/admin/users']
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});