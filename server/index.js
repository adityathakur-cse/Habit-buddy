const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);

// Basic Route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the HabitBuddy API' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
