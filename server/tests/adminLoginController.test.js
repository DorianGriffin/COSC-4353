const request = require('supertest');
const express = require('express');
const { adminLogin } = require('../controllers/adminLoginController');

const app = express();
app.use(express.json());
app.post('/api/admin/login', adminLogin);

describe('Admin Login', () => {
  test('should login with correct credentials', async () => {
    const res = await request(app).post('/api/admin/login').send({
      username: 'admin@volunteer.com',
      password: 'admin123'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.admin.role).toBe('admin');
  });

  test('should reject invalid credentials', async () => {
    const res = await request(app).post('/api/admin/login').send({
      username: 'wrong@admin.com',
      password: 'wrongpass'
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  test('should return 400 if fields missing', async () => {
    const res = await request(app).post('/api/admin/login').send({
      username: ''
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Missing username or password');
  });
});