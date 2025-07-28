const express = require('express');
const supertest = require('supertest');

const matching = require('../server/controllers/matchingController');
//use user profile next

const app = express();
app.use(express.json());

app.get('/api/matching/match/:volunteerId', matching.ismatched);

describe('Matched Event ', () => {
  it('Returns Matched event', async () => {
    const response = await supertest(app).get('/api/matching/match/v1');
    expect(response.statusCode).toBe(200);
    expect(response.body.volunteer.name).toBe('Dorian');
    expect(response.body.matchedEvents.length).toBe(2);
    const titles = response.body.matchedEvents.map(e => e.title);
    expect(titles).toContain('Community Kitchen');
    expect(titles).toContain('First Aid Training');
  });
});