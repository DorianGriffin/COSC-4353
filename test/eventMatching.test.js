const request = require('supertest');
const express = require('express');
jest.mock('../server/models/db', () => ({ query: jest.fn() }));

const db = require('../server/models/db');
const matchingController = require('../server/controllers/matchingController');

const app = express();
app.use(express.json());
app.get('/api/matching/match-volunteer/:userId', matchingController.ismatched);

describe('Volunteer Matching Logic', () => {
  it('matches events based on location, skills, and availability', async () => {
    const userId = 1;
    
    db.query
      .mockResolvedValueOnce([[{ City: 'Austin', State: 'TX' }]])
      .mockResolvedValueOnce([[{ skill_id: 1 }, { skill_id: 2 }]])
      .mockResolvedValueOnce([[{ available_date: '2025-08-03' }]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{
        event_id: 101,
        name: 'Food Drive',
        description: 'Helping package meals',
        location: 'Community Center',
        City: 'Austin',
        State: 'TX',
        start_datetime: '2025-08-03T10:00:00Z',
        end_datetime: '2025-08-03T14:00:00Z',
        urgency_level: 'medium'
      }]])
      .mockResolvedValueOnce([[{ skill_id: 1 }, { skill_id: 2 }]]); // matches
      

    const res = await request(app).get(`/api/matching/match-volunteer/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.matchedEvents).toHaveLength(1);
    expect(res.body.matchedEvents[0].name).toBe('Food Drive');
  });

  it('returns 404 if no matching events are found', async () => {
    db.query
      .mockResolvedValueOnce([[{ City: 'Dallas', State: 'TX' }]])
      .mockResolvedValueOnce([[{ skill_id: 1 }]])               
      .mockResolvedValueOnce([[{ available_date: '2025-08-01' }]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{
        event_id: 999,
        name: 'Cleanup',
        description: 'Park cleanup',
        location: 'City Park',
        City: 'Dallas',
        State: 'TX',
        start_datetime: '2025-08-05T08:00:00Z',
        end_datetime: '2025-08-05T12:00:00Z',
        urgency_level: 'low'
      }]])
      .mockResolvedValueOnce([[{ skill_id: 3 }]]);
      
    const res = await request(app).get('/api/matching/match-volunteer/2');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('No matching events found');
  });

  it('returns 404 if no events match both skills and availability', async () => {
    db.query
      .mockResolvedValueOnce([[{ City: 'Austin', State: 'TX' }]])     
      .mockResolvedValueOnce([[{ skill_id: 1000 }]])                   
      .mockResolvedValueOnce([[{ available_date: '2025-08-01' }]]) 
      .mockResolvedValueOnce([[]])   
      .mockResolvedValueOnce([[                                       // events in same location
        {
          event_id: 201,
          name: 'Unrelated Event',
          location: 'Library',
          City: 'Austin',
          State: 'TX',
          start_datetime: '2025-08-01T10:00:00Z',
          end_datetime: '2025-08-01T14:00:00Z',
          urgency_level: 'low'
        }
      ]])
      .mockResolvedValueOnce([[{ skill_id: 1 }]]);  // event requires skill not in user's list
      
    const res = await request(app).get('/api/matching/match-volunteer/3');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('No matching events found');
  });

   it('returns 500 if an internal error occurs', async () => {
    db.query.mockRejectedValueOnce(new Error('Simulated DB failure'));
  
    const res = await request(app).get('/api/matching/match-volunteer/4');
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Internal server error');
  });
   
});