const request = require('supertest');
const express = require('express');
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  events
} = require('../server/controllers/eventController');

const app = express();
app.use(express.json());

app.get('/api/events', getEvents);
app.post('/api/events', createEvent);
app.put('/api/events/:id', updateEvent);
app.delete('/api/events/:id', deleteEvent);

beforeEach(() => {
  events.length = 0;
  events.push({
    event_id: 1,
    name: "Park Cleanup",
    description: "Clean the park",
    location: "Central Park",
    City: "Houston",
    State: "TX",
    zip: "77004",
    required_skills: ["Physical Labor"],
    urgency_level: "medium",
    start_datetime: "2025-08-01T09:00",
    end_datetime: "2025-08-01T12:00"
  });
});

describe("Event Controller", () => {
  test("GET /api/events - should return all events", async () => {
    const res = await request(app).get('/api/events');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("Park Cleanup");
  });

  test("POST /api/events - should create a new event", async () => {
    const newEvent = {
      name: "Food Drive",
      description: "Collect and distribute food",
      location: "Warehouse",
      city: "Dallas",
      state: "TX",
      zip: "75201",
      required_skills: ["Organization"],
      urgency_level: "high",
      start_datetime: "2025-08-05T10:00",
      end_datetime: "2025-08-05T14:00"
    };

    const res = await request(app).post('/api/events').send(newEvent);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Event created");
    expect(res.body.event.name).toBe("Food Drive");
    expect(events.length).toBe(2);
  });

  test("POST /api/events - should fail with missing fields", async () => {
    const res = await request(app).post('/api/events').send({
      name: "Bad Event"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing required fields/);
  });

  test("PUT /api/events/:id - should update an existing event", async () => {
    const res = await request(app)
      .put('/api/events/1')
      .send({ name: "Park Cleanup Updated" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Event updated");
    expect(res.body.event.name).toBe("Park Cleanup Updated");
  });

  test("PUT /api/events/:id - should return 404 if event not found", async () => {
    const res = await request(app).put('/api/events/999').send({ name: "Nothing" });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Event not found");
  });

  test("DELETE /api/events/:id - should delete an event", async () => {
    const res = await request(app).delete('/api/events/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Event deleted");
    expect(events.length).toBe(0);
  });

  test("DELETE /api/events/:id - should return 404 if event not found", async () => {
    const res = await request(app).delete('/api/events/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Event not found");
  });
});