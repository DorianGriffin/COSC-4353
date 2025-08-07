const db = require('../models/db');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

const STATUS_ENUM = ['assigned', 'accepted', 'cancelled', 'completed'];

//  GET matched events for one user
exports.ismatched = async (req, res) => {
  const userId = req.params.userId;
  const now = new Date();

  try {
    const [profiles] = await db.query(
      `SELECT City, State FROM UserProfiles WHERE user_id = ?`,
      [userId]
    );
    if (!profiles.length) return res.status(404).json({ error: 'User profile not found' });

    const { City, State } = profiles[0];

    const [userSkillsRows] = await db.query(
      `SELECT skill_id FROM UserSkills WHERE user_id = ?`,
      [userId]
    );
    const userSkillIds = userSkillsRows.map(row => row.skill_id);
    if (!userSkillIds.length) return res.status(404).json({ error: 'No skills found for user' });

    const [userDates] = await db.query(
      `SELECT available_date FROM UserAvailability WHERE user_id = ?`,
      [userId]
    );
    const availableDates = userDates.map(row => new Date(row.available_date).toISOString().split('T')[0]);
    if (!availableDates.length) return res.status(404).json({ error: 'No availability found for user' });

    const [assignmentRows] = await db.query(
      `SELECT event_id, status FROM eventassignments WHERE user_id = ?`,
      [userId]
    );
    const eventStatusMap = {};
    assignmentRows.forEach(row => {
      eventStatusMap[row.event_id] = row.status;
    });

    const [events] = await db.query(
      `SELECT * FROM Events WHERE City = ? AND State = ?`,
      [City, State]
    );

    const matchedEvents = [];

    for (const event of events) {
      const [eventSkillsRows] = await db.query(
        `SELECT skill_id FROM EventSkills WHERE event_id = ?`,
        [event.event_id]
      );
      const eventSkillIds = eventSkillsRows.map(row => row.skill_id);

      const hasAllSkills = eventSkillIds.every(skillId => userSkillIds.includes(skillId));
      const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
      const endDate = new Date(event.end_datetime);
      const isAvailable = availableDates.includes(eventDate);

      if (hasAllSkills && isAvailable) {
        const currentStatus = eventStatusMap[event.event_id] || null;

        // Automatically mark past assigned events as completed
        if (currentStatus === 'accepted' && endDate < now) {
          await db.query(
            `UPDATE eventassignments SET status = 'completed' WHERE event_id = ? AND user_id = ?`,
            [event.event_id, userId]
          );
          continue;
        }

        if (!currentStatus) {
          await db.query(
            `INSERT INTO eventassignments (event_id, user_id, assigned_at, status) VALUES (?, ?, NOW(), 'assigned')`,
            [event.event_id, userId]
          );
          matchedEvents.push({ ...event, status: 'assigned' });
        } else if (currentStatus !== 'completed') {
            if (currentStatus === 'cancelled' && endDate < now) {
              continue;
            }
            matchedEvents.push({ ...event, status: currentStatus });
        }
      }
    }

    if (!matchedEvents.length) {
      return res.status(404).json({ error: 'No matching events found' });
    }

    res.status(200).json({ matchedEvents });

  } catch (error) {
    console.error('Error matching volunteer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//  Accept event 
exports.acceptEvent = async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req.body;

  try {
    const [existing] = await db.query(
      `SELECT assignment_id FROM eventassignments WHERE event_id = ? AND user_id = ?`,
      [eventId, userId]
    );

    if (!STATUS_ENUM.includes('accepted')) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    if (existing.length) {
      await db.query(
        "UPDATE eventassignments SET status = 'accepted' WHERE event_id = ? AND user_id = ?",
        [eventId, userId]
      );
    } else {
      await db.query(
        "INSERT INTO eventassignments (event_id, user_id, assigned_at, status) VALUES (?, ?, NOW(), 'accepted')",
        [eventId, userId]
      );
    }

    res.status(200).json({ success: true, message: 'Event accepted.' });
  } catch (err) {
    console.error('Error accepting event:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

//  Cancel event 
exports.cancelEvent = async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req.body;

  try {
    const [existing] = await db.query(
      `SELECT assignment_id FROM eventassignments WHERE event_id = ? AND user_id = ?`,
      [eventId, userId]
    );

    if (!STATUS_ENUM.includes('cancelled')) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    if (existing.length) {
      await db.query(
        `UPDATE eventassignments SET status = 'cancelled', assigned_at = NOW() WHERE event_id = ? AND user_id = ?`,
        [eventId, userId]
      );
    } else {
      await db.query(
        `INSERT INTO eventassignments (event_id, user_id, assigned_at, status) VALUES (?, ?, NOW(), 'cancelled')`,
        [eventId, userId]
      );
    }

    res.status(200).json({ success: true, message: 'Event cancelled.' });
  } catch (err) {
    console.error('Error cancelling event:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Mark event as completed by user
exports.markCompleted = async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req.body;

  try {
    const [existing] = await db.query(
      `SELECT assignment_id FROM eventassignments WHERE event_id = ? AND user_id = ?`,
      [eventId, userId]
    );

    if (existing.length) {
      await db.query(
        `UPDATE eventassignments SET status = 'completed' WHERE event_id = ? AND user_id = ?`,
        [eventId, userId]
      );
    } else {
      await db.query(
        `INSERT INTO eventassignments (event_id, user_id, assigned_at, status) VALUES (?, ?, NOW(), 'completed')`,
        [eventId, userId]
      );
    }

    res.status(200).json({ success: true, message: 'Event marked as completed.' });
  } catch (err) {
    console.error('Error marking event as completed:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Admin: Get all volunteer-event matches
exports.getAllMatches = async (req, res) => {
  const { date, city, state, eventName, sortBy } = req.query;

  try {
    const [users] = await db.query(`SELECT user_id FROM users`);
    const allMatches = [];

    for (const { user_id } of users) {
      const [profiles] = await db.query(
        `SELECT fullName, City, State FROM UserProfiles WHERE user_id = ?`,
        [user_id]
      );
      if (!profiles.length) continue;

      const { fullName, City, State } = profiles[0];

      const [userSkillsRows] = await db.query(
        `SELECT skill_id FROM UserSkills WHERE user_id = ?`,
        [user_id]
      );
      const userSkillIds = userSkillsRows.map(row => row.skill_id);
      if (!userSkillIds.length) continue;

      const [userDates] = await db.query(
        `SELECT available_date FROM UserAvailability WHERE user_id = ?`,
        [user_id]
      );
      const availableDates = userDates.map(row =>
        new Date(row.available_date).toISOString().split('T')[0]
      );
      if (!availableDates.length) continue;

      let [events] = await db.query(
        `SELECT * FROM Events WHERE City = ? AND State = ?`,
        [City, State]
      );

      if (city) {
        events = events.filter(ev =>
          ev.City.toLowerCase().includes(city.toLowerCase())
        );
      }
      if (state) {
        events = events.filter(ev =>
          ev.State.toLowerCase().includes(state.toLowerCase())
        );
      }
      if (eventName) {
        events = events.filter(ev =>
          ev.name.toLowerCase().includes(eventName.toLowerCase())
        );
      }

      for (const event of events) {
        const [eventSkillsRows] = await db.query(
          `SELECT skill_id FROM EventSkills WHERE event_id = ?`,
          [event.event_id]
        );
        const eventSkillIds = eventSkillsRows.map(row => row.skill_id);

        const hasAllSkills = eventSkillIds.every(skillId =>
          userSkillIds.includes(skillId)
        );
        const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
        const isAvailable = availableDates.includes(eventDate);
        const matchDateFilter = !date || eventDate === date;

        if (hasAllSkills && isAvailable && matchDateFilter) {
          const [statusRows] = await db.query(
            `SELECT status FROM eventassignments WHERE event_id = ? AND user_id = ?`,
            [event.event_id, user_id]
          );
          if (!statusRows.length) continue;

          const status = statusRows[0].status;

          allMatches.push({
            userName: fullName,
            eventName: event.name,
            eventDate: eventDate,
            eventDescription: event.description,
            eventLocation: `${event.City}, ${event.State}`,
            status,
            urgency_level: event.urgency_level
          });
        }
      }
    }

    if (sortBy === 'date') {
      allMatches.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
    } else if (sortBy === 'urgency') {
      const urgencyRank = { high: 3, medium: 2, low: 1 };
      allMatches.sort((a, b) =>
        (urgencyRank[b.urgency_level?.toLowerCase()] || 0) -
        (urgencyRank[a.urgency_level?.toLowerCase()] || 0)
      );
    }

    if (!allMatches.length) return res.status(404).json({ error: 'No matches found' });

    res.status(200).json({ matches: allMatches });
  } catch (err) {
    console.error('Error fetching all matches:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const fetchMatchesForExport = async (query) => {
  return new Promise((resolve, reject) => {
    const mockReq = { query };
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          if (code === 200) resolve(data.matches);
          else reject(data);
        },
      }),
    };
    exports.getAllMatches(mockReq, mockRes).catch(reject);
  });
};

// Admin: Download as CSV
exports.downloadMatchesCSV = async (req, res) => {
  try {
    const matches = await fetchMatchesForExport(req.query);
    const fields = [
      { label: 'Volunteer Name', value: 'userName' },
      { label: 'Event Name', value: 'eventName' },
      { label: 'Event Date', value: 'eventDate' },
      { label: 'Event Description', value: 'eventDescription' },
      { label: 'Event Location', value: 'eventLocation' },
      { label: 'Status', value: 'status' },
      { label: 'Urgency Level', value: 'urgency_level' }
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(matches);

    res.header('Content-Type', 'text/csv');
    res.attachment('volunteer_matches_report.csv');
    res.send(csv);
  } catch (error) {
    console.error('CSV download error:', error);
    res.status(500).send('Error generating CSV');
  }
};

exports.downloadMatchesPDF = async (req, res) => {
  try {
    const matches = await fetchMatchesForExport(req.query);
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

    res.setHeader('Content-Disposition', 'attachment; filename=volunteer_matches_report.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    
    doc.fontSize(18).text('Volunteer Event Matches Report', { align: 'center' });
    doc.moveDown(1.5);

    
    const headers = ['#', 'Volunteer', 'Event', 'Date', 'Location', 'Status', 'Urgency', 'Description'];
    const columnWidths = [25, 80, 90, 60, 100, 60, 60, 180]; 
    const startX = doc.x;
    let y = doc.y;

    doc.font('Helvetica-Bold').fontSize(10);

    headers.forEach((header, i) => {
      const x = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.rect(x, y, columnWidths[i], 30).stroke();
      doc.text(header, x + 4, y + 8, {
        width: columnWidths[i] - 8,
        align: 'left',
        continued: false
      });
    });

    y += 30;
    doc.font('Helvetica').fontSize(9);

    matches.forEach((match, index) => {
      const row = [
        index + 1,
        match.userName,
        match.eventName,
        match.eventDate,
        match.eventLocation,
        match.status,
        match.urgency_level,
        match.eventDescription || ''
      ];

      let rowHeight = 30;

      
      row.forEach((text, i) => {
        const textHeight = doc.heightOfString(String(text), {
          width: columnWidths[i] - 8,
          align: 'left'
        });
        rowHeight = Math.max(rowHeight, textHeight + 10); 
      });

      
      if (y + rowHeight > doc.page.height - 40) {
        doc.addPage({ size: 'A4', layout: 'landscape' });
        y = doc.y;
      }

      
      row.forEach((cell, i) => {
        const x = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.rect(x, y, columnWidths[i], rowHeight).stroke();
        doc.text(String(cell), x + 4, y + 5, {
          width: columnWidths[i] - 8,
          align: 'left'
        });
      });

      y += rowHeight;
    });

    doc.end();
  } catch (error) {
    console.error('PDF download error:', error);
    res.status(500).send('Error generating PDF');
  }
};




