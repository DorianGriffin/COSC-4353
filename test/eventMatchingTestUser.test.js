const request = require('supertest');
const express = require('express');
const app = express();
app.use(express.json());

const matchingController = require('../server/controllers/matchingController');
const db = require('../server/models/db'); 

app.get('/api/matching/match-volunteer/:userId', matchingController.ismatched);

describe('Volunteer Matching Logic (Real DB)', () => {
  let testUserId;
  let testEventId;
  let unmatchedUserId;

  beforeAll(async () => {
    const hashedPw = 'e78f3d32f2cbb58214b986b73e399fa23d568f25529fc74d398b908a'; 
    // MATCHING USER 
    const [userResult] = await db.execute(
      `INSERT INTO users (username, password_hash, email, role, first_name, last_name, profile_completed)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['test_user_jest', hashedPw, 'jest@test.com', 'volunteer', 'Test', 'User', 1]
    );
    testUserId = userResult.insertId;

    await db.execute(
      `INSERT INTO userprofiles (user_id, fullName, City, State, adrlineone, adrlinetwo, zipcode, preferences)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [testUserId, 'Test Jest', 'Austin', 'TX', '123 Jest Ln', '', '78701', 'Flexible']
    );

    await db.execute(`INSERT INTO UserSkills (user_id, skill_id) VALUES (?, ?)`, [testUserId, 1]);
    await db.execute(`INSERT INTO UserAvailability (user_id, available_date) VALUES (?, ?)`, [
      testUserId, '2025-08-03'
    ]);

    const [eventResult] = await db.execute(
      `INSERT INTO Events (name, description, location, City, State, start_datetime, end_datetime, urgency_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['test_event_jest', 'Jest match event', 'Community Hall', 'Austin', 'TX',
       '2025-08-03 10:00:00', '2025-08-03 14:00:00', 'medium']
    );
    testEventId = eventResult.insertId;

    await db.execute(`INSERT INTO EventSkills (event_id, skill_id) VALUES (?, ?)`, [testEventId, 1]);

    // UNMATCHED USER SETUP 
    const [unmatchedUser] = await db.execute(
      `INSERT INTO users (username, password_hash, email, role, first_name, last_name, profile_completed)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['no_match_user', hashedPw, '404@test.com', 'volunteer', 'No', 'Match', 1]
    );
    unmatchedUserId = unmatchedUser.insertId;

    await db.execute(
      `INSERT INTO userprofiles (user_id, fullName, City, State, adrlineone, adrlinetwo, zipcode, preferences)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [unmatchedUserId, 'No Match', 'Austin', 'TX', '404 Ave', '', '78702', 'None']
    );

  });

  afterAll(async () => {
    // Clean up matching 
    await db.execute(`DELETE FROM EventSkills WHERE event_id = ?`, [testEventId]);
    await db.execute(`DELETE FROM Events WHERE event_id = ?`, [testEventId]);
    await db.execute(`DELETE FROM UserAvailability WHERE user_id = ?`, [testUserId]);
    await db.execute(`DELETE FROM UserSkills WHERE user_id = ?`, [testUserId]);
    await db.execute(`DELETE FROM userprofiles WHERE user_id = ?`, [testUserId]);
    await db.execute(`DELETE FROM users WHERE user_id = ?`, [testUserId]);

    // Clean up unmatched 
    await db.execute(`DELETE FROM userprofiles WHERE user_id = ?`, [unmatchedUserId]);
    await db.execute(`DELETE FROM users WHERE user_id = ?`, [unmatchedUserId]);

    if (db.end) {
      await db.end(); 
    }
  });

  it('matches test event to test user in real DB', async () => {
    const res = await request(app).get(`/api/matching/match-volunteer/${testUserId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.matchedEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'test_event_jest',
          location: 'Community Hall'
        })
      ])
    );
  });

  it('returns 404 when no matching events are found for the test user', async () => {
    const res = await request(app).get(`/api/matching/match-volunteer/${unmatchedUserId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('No skills found for user');
  });
});