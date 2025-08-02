const db = require('../models/db.js');
const bcrypt = require('bcrypt');

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
const isStrongPassword = (pwd) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd);
const resetTokens = new Map()

const registerUser = async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;

  if (!username || !email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      message: "Password must be at least 8 characters, include one uppercase letter and one number",
    });
  }

  try {
    const [existing] = await db.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users 
      (username, email, password_hash, first_name, last_name, profile_completed, email_verified) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, firstName, lastName, 0, 1] // email_verified = 1
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Missing username or password" });

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, username]
    );

    if (rows.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    req.session.user = { username: user.username };

    const { password_hash, ...userWithoutPassword } = user;
    res.status(200).json({ message: "Login successful", user: userWithoutPassword });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const crypto = require("crypto")

const forgotPassword = async (req, res) => {
  const { email } = req.body

  if (!email) return res.status(400).json({ message: "Email is required" })

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email])
    if (rows.length === 0)
      return res.status(404).json({ message: "No account with that email" })

    const resetToken = crypto.randomBytes(32).toString("hex")

    // Store in memory (key = token, value = email)
    resetTokens.set(resetToken, email)

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`
    console.log(`Reset link for ${email}: ${resetLink}`)

    return res.status(200).json({
      message: "Reset link generated (check console for dev version)",
      resetLink,
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return res.status(500).json({ message: "Server error" })
  }
}

const resetPassword = async (req, res) => {
  const { token } = req.params
  const { password } = req.body

  if (!token || !password) {
    return res.status(400).json({ message: "Missing token or password" })
  }

  const email = resetTokens.get(token)
  if (!email) {
    return res.status(400).json({ message: "Invalid or expired reset token" })
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    await db.query("UPDATE users SET password_hash = ? WHERE email = ?", [hashedPassword, email])

    resetTokens.delete(token) // Invalidate token after use

    return res.status(200).json({ message: "Password reset successful" })
  } catch (err) {
    console.error("Reset password error:", err)
    return res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};