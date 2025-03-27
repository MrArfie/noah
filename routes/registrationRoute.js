const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');  // Assuming you have a User model

const router = express.Router();

// 📌 REGISTER USER
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Assign role based on email (admin if the email matches the predefined admin email)
      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase() || 'admin@example.com'; // Default admin email
      const role = email.toLowerCase() === adminEmail ? 'admin' : 'user';

      // Create a new user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role,
      });

      await user.save();

      // Create a JWT token for the user
      const payload = { id: user.id, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Send the response with the token and user info
      return res.status(201).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error('❌ Registration Error:', err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

module.exports = router;
