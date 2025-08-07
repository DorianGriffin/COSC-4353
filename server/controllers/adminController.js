const db = require('../models/db');
const bcrypt = require('bcrypt');
const loginAdmin = async (req, res) => {
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

    const admin = rows[0];

    // ✅ Reject non-admins
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can log in here." });
    }

    const match = await bcrypt.compare(password, admin.password_hash);

    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    // ✅ Store admin session
    req.session.user = {
      user_id: admin.user_id,
      username: admin.username,
      role: admin.role,
      is_super_admin: admin.is_super_admin
    };

    const { password_hash, ...adminWithoutPassword } = admin;
    res.status(200).json({ message: "Admin login successful", user: adminWithoutPassword });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const createAdmin = async (req, res) => {
  const { username, email, password } = req.body;
  const creator = req.session.user;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [creator.username]);
    const creatorRecord = rows[0];

    if (!creatorRecord || creatorRecord.role !== 'admin' || !creatorRecord.is_super_admin) {
      return res.status(403).json({ message: "Only head admins can create other admins." });
    }

    const [existing] = await db.query("SELECT * FROM users WHERE username = ? OR email = ?", [username, email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Username or email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO users (username, email, password_hash, role, is_super_admin) VALUES (?, ?, ?, 'admin', false)`,
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: "New admin created successfully." });
  } catch (err) {
    console.error("Create admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteAdmin = async (req, res) => {
  const { adminId } = req.params;
  const requester = req.session.user;

  try {
    // Make sure requester is a head admin
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [requester.username]);
    const requesterRecord = rows[0];

    if (!requesterRecord || requesterRecord.role !== 'admin' || !requesterRecord.is_super_admin) {
      return res.status(403).json({ message: "Only head admins can delete admins." });
    }

    // Prevent deleting themselves
    if (requesterRecord.user_id === parseInt(adminId)) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    // Delete the admin
    const [result] = await db.query("DELETE FROM users WHERE user_id = ? AND role = 'admin'", [adminId]);


    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Admin not found or not an admin account." });
    }

    res.status(200).json({ message: "Admin deleted successfully." });
  } catch (err) {
    console.error("Delete admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const listAdmins = async (req, res) => {
  const requester = req.session?.user;

  if (!requester || !requester.username) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [requester.username]);
    const requesterRecord = rows[0];

    if (!requesterRecord || requesterRecord.role !== 'admin' || !requesterRecord.is_super_admin) {
      return res.status(403).json({ message: "Only head admins can view admin list." });
    }

    const [admins] = await db.query(
      "SELECT user_id, username, email, role, is_super_admin, created_at FROM users WHERE role = 'admin' ORDER BY created_at DESC"
    );

    // ✅ Only send needed fields (sanitized)
    const sanitizedAdmins = admins.map(admin => ({
      user_id: admin.user_id,
      username: admin.username,
      email: admin.email,
      is_super_admin: admin.is_super_admin
    }));

    res.status(200).json({ admins: sanitizedAdmins }); // ✅ send only clean data
  } catch (err) {
    console.error("List admins error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  createAdmin,
  deleteAdmin,
  listAdmins,
  loginAdmin
};