const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sdlc-ai-platform');
    console.log('Connected to MongoDB');

    // Find the demo user
    const user = await User.findOne({ email: 'demo@example.com' });
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User found:', user.email);
    console.log('Stored password hash:', user.password);

    // Test password comparison
    const isValid = await user.comparePassword('demo123');
    console.log('Password comparison result:', isValid);

    // Test direct bcrypt comparison
    const directComparison = await bcrypt.compare('demo123', user.password);
    console.log('Direct bcrypt comparison:', directComparison);

    // Test with wrong password
    const wrongPassword = await user.comparePassword('wrongpassword');
    console.log('Wrong password test:', wrongPassword);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testLogin();
