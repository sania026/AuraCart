import jwt from 'jsonwebtoken';

const generateToken = (userId, role) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const payload = {
      userId,
      role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return token;
  } catch (error) {
    console.error('Error generating token:', error.message);
    throw new Error('Could not generate authentication token');
  }
};

export default generateToken;
