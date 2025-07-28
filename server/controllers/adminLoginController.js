const ADMIN_CREDENTIALS = {
    username: 'admin@volunteer.com',
    password: 'admin123'
  };
  
  const adminLogin = (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: 'Missing username or password' });
    }
  
    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      return res.status(200).json({
        message: 'Login successful',
        admin: {
          username,
          role: 'admin',
          loginTime: new Date().toISOString()
        }
      });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  };
  
  module.exports = { adminLogin };  