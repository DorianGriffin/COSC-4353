const express = require('express');
const router = express.Router();
const db = require("../models/db");
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

function buildFilters(query) {
    const conditions = [`u.role = 'volunteer'`]; 

    if (query.status) {
        conditions.push(`LOWER(ea.status) = LOWER(?)`);
    }

    if (query.startDate && query.endDate) {
        conditions.push(`e.start_datetime BETWEEN ? AND ?`);
    }

    return conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
}

router.get('/volunteer-participation/csv', async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;

        let whereClause = `WHERE u.role = 'volunteer'`;
        const params = [];

        if (status) {
            whereClause += ` AND LOWER(ea.status) = LOWER(?)`;
            params.push(status);
        }

        if (startDate && endDate) {
            whereClause += ` AND e.start_datetime BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        }

        const query = `
      SELECT 
        u.user_id,
        u.email,
        COALESCE(up.fullName, CONCAT(u.first_name, ' ', u.last_name)) AS fullName,
        e.name AS event_name,
        e.start_datetime,
        e.end_datetime,
        ea.status
      FROM Users u
      LEFT JOIN UserProfiles up ON u.user_id = up.user_id
      LEFT JOIN EventAssignments ea ON u.user_id = ea.user_id
      LEFT JOIN Events e ON ea.event_id = e.event_id
      ${whereClause}
      ORDER BY 
        CASE WHEN up.profile_id IS NULL THEN 1 ELSE 0 END,
        u.user_id,
        e.start_datetime
    `;

        const [rows] = await db.query(query, params);

        const fields = ['fullName', 'email', 'event_name', 'start_datetime', 'end_datetime', 'status'];
        const json2csv = new Parser({ fields });
        const csv = json2csv.parse(rows);

        res.header('Content-Type', 'text/csv');
        res.attachment('volunteer_report.csv');
        return res.send(csv);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


router.get('/volunteer-participation/pdf', async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;

        let whereClause = `WHERE u.role = 'volunteer'`;
        const params = [];

        if (status) {
            whereClause += ` AND LOWER(ea.status) = LOWER(?)`;
            params.push(status);
        }

        if (startDate && endDate) {
            whereClause += ` AND e.start_datetime BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        }

        const query = `
      SELECT 
        u.user_id,
        u.email,
        COALESCE(up.fullName, CONCAT(u.first_name, ' ', u.last_name)) AS fullName,
        e.name AS event_name,
        e.start_datetime,
        e.end_datetime,
        ea.status
      FROM Users u
      LEFT JOIN UserProfiles up ON u.user_id = up.user_id
      LEFT JOIN EventAssignments ea ON u.user_id = ea.user_id
      LEFT JOIN Events e ON ea.event_id = e.event_id
      ${whereClause}
      ORDER BY 
        CASE WHEN up.profile_id IS NULL THEN 1 ELSE 0 END,
        u.user_id,
        e.start_datetime
    `;

        const [rows] = await db.query(query, params);

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=volunteer_report.pdf');
        doc.pipe(res);

        doc.fontSize(18).text('Volunteer Participation Report', { align: 'center' });
        doc.moveDown();

        rows.forEach(row => {
            doc.fontSize(12).text(`Name: ${row.fullName}`);
            doc.text(`Email: ${row.email}`);
            doc.text(`Event: ${row.event_name || 'N/A'}`);
            doc.text(`Start: ${row.start_datetime || 'N/A'}`);
            doc.text(`End: ${row.end_datetime || 'N/A'}`);
            doc.text(`Status: ${row.status || 'N/A'}`);
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;

