const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS and JSON
app.use(cors());
app.use(express.json());

// Data storage
let users = [];
let transactions = [];

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MATURE Backend is LIVE! 🚀',
    time: new Date().toISOString()
  });
});

// User registration
app.post('/api/register', (req, res) => {
  const user = {
    id: Date.now(),
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    ip: req.ip,
    timestamp: new Date().toISOString()
  };
  users.push(user);
  res.json({ success: true, message: 'User registered' });
});

// User login
app.post('/api/login', (req, res) => {
  res.json({ success: true, message: 'Login successful' });
});

// Transaction
app.post('/api/transaction', (req, res) => {
  const transaction = {
    id: Date.now(),
    userId: req.body.userId,
    amount: req.body.amount,
    country: req.body.country,
    bankDetails: req.body.bankDetails,
    paymentMethod: req.body.paymentMethod,
    ip: req.ip,
    timestamp: new Date().toISOString(),
    status: 'pending'
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 MATURE Backend running on port ${PORT}`);
});
