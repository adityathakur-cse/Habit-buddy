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
const sessionRoutes = require('./routes/sessionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reviews', reviewRoutes);

// Basic Route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the HabitBuddy API' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
