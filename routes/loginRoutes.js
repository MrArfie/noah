// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    // Check if the required fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }
  
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Compare the provided password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Generate a JWT token
      const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', {
        expiresIn: '1h',
      });
  
      // Send response with the token
      res.status(200).json({
        message: 'Login successful',
        token,
        user: { name: user.name, email: user.email },
      });
    } catch (err) {
      console.error('❌ Login failed:', err.message);
      res.status(500).json({ message: 'Server error during login' });
    }
  });
  