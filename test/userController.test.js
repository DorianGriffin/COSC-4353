const request = require('supertest')
const express = require('express')
const { registerUser, loginUser, completeProfile } = require('../server/controllers/userController')

const app = express()
app.use(express.json())

// Inject the handlers manually
app.post('/api/users/register', registerUser)
app.post('/api/users/login', loginUser)
app.post('/api/users/complete-profile', completeProfile)

describe('User Registration', () => {
  beforeEach(() => {
    const userController = require('../server/controllers/userController') 
    userController.users.length = 0                                 

    userController.users.push({
      id: 1,
      username: "erin1",
      email: "erin1@example.com",
      password: "Test1234", 
      firstName: "Erin",
      lastName: "",
      profile_completed: true
    })
  })

  test('should register a new user with valid data', async () => {
    const res = await request(app).post('/api/users/register').send({
      username: "newuser",
      email: "newuser@example.com",
      password: "StrongPass1",
      firstName: "New",
      lastName: "User"
    })

    expect(res.statusCode).toBe(201)
    expect(res.body.message).toBe("User registered successfully")
  })

  test('should fail if email is already taken', async () => {
    const res = await request(app).post('/api/users/register').send({
      username: "another",
      email: "erin1@example.com",
      password: "StrongPass1",
      firstName: "A",
      lastName: "B"
    })

    expect(res.statusCode).toBe(409)
    expect(res.body.message).toMatch(/already exists/)
  })

  test('should fail if password is weak', async () => {
    const res = await request(app).post('/api/users/register').send({
      username: "weakuser",
      email: "weak@example.com",
      password: "weak",
      firstName: "Weak",
      lastName: "Guy"
    })

    expect(res.statusCode).toBe(400)
    expect(res.body.message).toMatch(/Password must be at least/)
  })
})

describe('User Login', () => {
  test('should login with correct credentials', async () => {
    const res = await request(app).post('/api/users/login').send({
      username: "erin1",
      password: "Test1234"
    })

    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe("Login successful")
    expect(res.body.user.username).toBe("erin1")
  })

  test('should reject invalid login', async () => {
    const res = await request(app).post('/api/users/login').send({
      username: "erin1",
      password: "WrongPass"
    })

    expect(res.statusCode).toBe(401)
    expect(res.body.message).toBe("Invalid credentials")
  })
})

describe('Complete Profile', () => {
  beforeEach(() => {
    const userController = require('../server/controllers/userController')
    userController.users.length = 0
    userController.users.push({
      id: 1,
      username: "erin1",
      email: "erin1@example.com",
      password: "Test1234",
      firstName: "Erin",
      lastName: "",
      profile_completed: false
    })
  })

  test('should mark profile as completed for a valid user', async () => {
    const res = await request(app).post('/api/users/complete-profile').send({
      username: "erin1"
    })

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.message).toBe("Profile marked as completed")
  })

  test('should return 404 if user not found', async () => {
    const res = await request(app).post('/api/users/complete-profile').send({
      username: "ghost"
    })

    expect(res.statusCode).toBe(404)
    expect(res.body.message).toBe("User not found")
  })
})
