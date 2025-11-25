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

/// User registration - FIXED: Store password
app.post('/api/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.json({ 
      success: false, 
      error: 'User already exists with this email' 
    });
  }
  
  const user = {
    id: Date.now(),
    name: name,
    email: email,
    phone: phone,
    password: password, // ✅ STORE PASSWORD
    ip: req.ip,
    timestamp: new Date().toISOString()
  };
  users.push(user);
  
  console.log('✅ New user registered:', email);
  res.json({ success: true, message: 'User registered successfully' });
});

// User login - FIXED: Validate password
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt:', email);
  
  // Find user by email
  const user = users.find(u => u.email === email);
  
  if (!user) {
    console.log('❌ User not found:', email);
    return res.json({ 
      success: false, 
      error: 'User not found. Please register first.' 
    });
  }
  
  // Check password
  if (user.password !== password) {
    console.log('❌ Invalid password for:', email);
    return res.json({ 
      success: false, 
      error: 'Invalid password' 
    });
  }
  
  console.log('✅ Login successful:', email);
  res.json({ 
    success: true, 
    message: 'Login successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
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


// ========== ADD THESE NEW ROUTES ==========

// Update transaction status (SUCCESS/FAILED)
app.put('/api/admin/transactions/:id/status', (req, res) => {
  const transactionId = parseInt(req.params.id);
  const { status } = req.body;
  
  console.log('🔄 Updating transaction status:', { transactionId, status });
  
  // Find the transaction
  const transaction = transactions.find(t => t.id === transactionId);
  
  if (!transaction) {
    console.log('❌ Transaction not found:', transactionId);
    return res.status(404).json({ 
      success: false, 
      error: 'Transaction not found' 
    });
  }
  
  // Validate status
  if (!['pending', 'completed', 'failed'].includes(status)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid status. Use: pending, completed, or failed' 
    });
  }

  // Debug route to see registered users
app.get('/api/debug/users', (req, res) => {
  res.json({
    totalUsers: users.length,
    users: users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      hasPassword: !!u.password
    }))
  });
});
  
  // Update the status
  transaction.status = status;
  transaction.updatedAt = new Date().toISOString();
  
  console.log('✅ Transaction status updated:', { 
    id: transaction.id, 
    oldStatus: transaction.status, 
    newStatus: status 
  });
  
  res.json({ 
    success: true, 
    message: `Transaction status updated to ${status}`,
    transaction: transaction
  });
});

// Get user details
app.get('/api/admin/users/:id/details', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      error: 'User not found' 
    });
  }
  
  // Get user's transactions
  const userTransactions = transactions.filter(t => t.userId === userId);
  
  const userDetails = {
    ...user,
    totalTransactions: userTransactions.length,
    totalVolume: userTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
    recentTransactions: userTransactions.slice(-5).reverse()
  };
  
  res.json(userDetails);
});

// Delete user
app.delete('/api/admin/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      error: 'User not found' 
    });
  }
  
  // Remove user
  users.splice(userIndex, 1);
  
  // Remove user's transactions
  const initialTransactionCount = transactions.length;
  transactions = transactions.filter(t => t.userId !== userId);
  const deletedTransactions = initialTransactionCount - transactions.length;
  
  res.json({ 
    success: true, 
    message: 'User deleted successfully',
    deletedTransactions: deletedTransactions
  });
});

// ========== EXISTING ROUTES ==========

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
    totalVolume: transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
    pendingTransactions: transactions.filter(t => t.status === 'pending').length,
    completedTransactions: transactions.filter(t => t.status === 'completed').length,
    failedTransactions: transactions.filter(t => t.status === 'failed').length
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

// Debug endpoint to see all data
app.get('/api/admin/debug', (req, res) => {
  res.json({
    users: users,
    transactions: transactions,
    stats: {
      totalUsers: users.length,
      totalTransactions: transactions.length,
      transactionsByStatus: {
        pending: transactions.filter(t => t.status === 'pending').length,
        completed: transactions.filter(t => t.status === 'completed').length,
        failed: transactions.filter(t => t.status === 'failed').length
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 MATURE Backend running on port ${PORT}`);
  console.log(`📍 API Base: http://localhost:${PORT}`);
  console.log(`📊 Admin Panel Data: http://localhost:${PORT}/api/admin/debug`);
  console.log(`🛡️ Admin Login: username="admin", password="admin123"`);
  console.log(`✅ Transaction Status Update: PUT /api/admin/transactions/:id/status`);
});



