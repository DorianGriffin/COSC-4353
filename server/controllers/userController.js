const users = [
  {
    id: 1,
    username: "erin1",
    email: "erin1@example.com",
    password: "hashedpassword123",
    firstName: "Erin",
    lastName: "",
    profile_completed: true
  },
]


const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email)
const isStrongPassword = (pwd) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd)

const registerUser = (req, res) => {
  const { username, email, password, firstName, lastName } = req.body

  if (!username || !email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: "Missing required fields" })
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" })
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      message: "Password must be at least 8 characters, include one uppercase letter and one number",
    })
  }

  if (users.find((u) => u.username === username || u.email === email)) {
    return res.status(409).json({ message: "Username or email already exists" })
  }

  const newUser = {
    id: users.length + 1,
    username,
    email,
    password,
    firstName,
    lastName,
    profile_completed: false,
  }

  users.push(newUser)
  res.status(201).json({ message: "User registered successfully" })
}

const loginUser = (req, res) => {
  const { username, password } = req.body
  if (!username || !password)
    return res.status(400).json({ message: "Missing username or password" })

  const user = users.find((u) =>
    (u.username === username || u.email === username) && u.password === password
  )
  if (!user)
    return res.status(401).json({ message: "Invalid credentials" })

  const { password: _, ...userWithoutPassword } = user
  res.status(200).json({ message: "Login successful", user: userWithoutPassword })
}

const completeProfile = (req, res) => {
  const { username } = req.body
  const user = users.find((u) => u.username === username)
  if (!user)
    return res.status(404).json({ message: "User not found" })

  user.profile_completed = true
  res.json({ message: "Profile marked as completed", success: true })
}

module.exports = {
  registerUser,
  loginUser,
  completeProfile,
  users
}
