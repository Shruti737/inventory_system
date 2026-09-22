const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Generate a JWT containing the user ID.
 */
const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * POST /api/auth/register
 * Creates a new user. Password is hashed automatically by a model hook.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check whether the email is already registered.
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.',
      });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user);

    // user.toJSON() removes the password automatically.
    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/auth/login
 * Verifies credentials and returns a JWT.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { register, login };