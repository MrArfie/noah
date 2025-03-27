require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Ensure MONGO_URI is available in .env file
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is missing in .env file');
  process.exit(1); // Exit if MONGO_URI is missing
}

// ✅ Middleware Setup
app.use(express.json({ limit: '10mb' })); // Set limit for incoming JSON payloads
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Set limit for URL-encoded data
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(helmet()); // Helps secure the app by setting various HTTP headers
app.use(morgan('dev')); // HTTP request logger (logs in 'dev' format)

// ✅ Rate Limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Allow 100 requests per windowMs
    message: '⚠️ Too many requests, please try again later.',
  })
);

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1); // Exit if MongoDB connection fails
  });

// ✅ Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const petRoutes = require('./routes/petRoutes');
const userRoutes = require('./routes/users');
const volunteerRoutes = require('./routes/volunteers');
const donationRoutes = require('./routes/donations');

// ✅ Use Routes
app.use('/api/auth', authRoutes); // Authentication-related routes (login, register)
app.use('/api/admin', adminRoutes); // Admin routes (manage users, pets, etc.)
app.use('/api/pets', petRoutes); // Pet-related routes (view, add, update pets)
app.use('/api/users', userRoutes); // User-related routes (user data, management)
app.use('/api/volunteers', volunteerRoutes); // Volunteer-related routes (volunteer form)
app.use('/api/donations', donationRoutes); // Donation-related routes (making donations)

// ✅ Default Route (Optional: for testing if server is running)
app.get('/', (req, res) => {
  res.send('🚀 Welcome to the Noah’s Ark Shelter API!');
});

// ✅ Fallback for 404 errors (unknown routes)
app.use('*', (req, res) => {
  res.status(404).json({ msg: '❌ Route not found' });
});

// ✅ Global Error Handler (for any unhandled errors)
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack); // Log error stack trace
  res.status(500).json({ msg: 'Internal Server Error' }); // Return 500 for internal errors
});

// ✅ Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
