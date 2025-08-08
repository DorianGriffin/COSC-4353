const request = require('supertest');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server/server');
const expect = chai.expect;
const should = chai.should();

describe('GET /volunteer-participation/csv', function () {
    it('should return a CSV file with volunteer data', function (done) {
        request(app)
            .get('/volunteerHistoryReport/volunteer-participation/csv')
            .expect('Content-Type', /text\/csv/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                res.text.should.contain('email');
                res.text.should.contain('event_name');
                done();
            });
    });

    it('should apply filters correctly (status filter)', function (done) {
        request(app)
            .get('/volunteerHistoryReport/volunteer-participation/csv')
            .query({ status: 'completed' })
            .expect('Content-Type', /text\/csv/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                res.text.should.contain('completed');
                done();
            });
    });

    it('should apply filters correctly (date range)', function (done) {
        request(app)
            .get('/volunteerHistoryReport/volunteer-participation/csv')
            .query({ startDate: '2023-01-01', endDate: '2023-12-31' })
            .expect('Content-Type', /text\/csv/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                res.text.should.contain('2023');
                done();
            });
    });

    it('should apply multiple filters correctly (status, date range)', function (done) {
        request(app)
            .get('/volunteerHistoryReport/volunteer-participation/csv')
            .query({ status: 'completed', startDate: '2023-01-01', endDate: '2023-12-31' })
            .expect('Content-Type', /text\/csv/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                res.text.should.contain('completed');
                res.text.should.contain('2023');
                done();
            });
    });

    it('should return all volunteer data without filters', function (done) {
        request(app)
            .get('/volunteerHistoryReport/volunteer-participation/csv')
            .expect('Content-Type', /text\/csv/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                res.text.should.contain('email');
                res.text.should.contain('event_name');
                done();
            });
    });

    it('should return an empty CSV for an invalid filter combination', function (done) {
        request(app)
            .get('/volunteerHistoryReport/volunteer-participation/csv')
            .query({ status: 'nonexistent_status', startDate: '2023-01-01', endDate: '2023-12-31' })
            .expect('Content-Type', /text\/csv/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                res.text.should.equal('');
                done();
            });
    });

    it('should handle invalid date format gracefully', function (done) {
        request(app)
            .get('/volunteerHistoryReport/volunteer-participation/csv')
            .query({ startDate: 'invalid_date', endDate: '2023-12-31' })
            .expect(400)  // Assuming 400 for bad request due to invalid date
            .end(done);
    });

    it('should handle no data in the database', function (done) {
        request(app)
            .get('/volunteerHistoryReport/volunteer-participation/csv')
            .query({ status: 'completed', startDate: '2025-01-01', endDate: '2025-12-31' })
            .expect('Content-Type', /text\/csv/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                res.text.should.equal('');
                done();
            });
    });
});

describe('GET /volunteer-participation/pdf', function () {
    it('should return a PDF file with volunteer data', function (done) {
        request(app)
            .get('/volunteerHistoryReport/volunteer-participation/pdf')
            .expect('Content-Type', /pdf/)
            .expect(200)
            .end(done);
    });

    it('should handle no data in the database for PDF', function (done) {
        request(app)
            .get('/volunteerHistoryReport/volunteer-participation/pdf')
            .query({ status: 'nonexistent_status', startDate: '2025-01-01', endDate: '2025-12-31' })
            .expect('Content-Type', /pdf/)
            .expect(200)
            .end(done);
    });
});

describe('Error Handling', function () {
    it('should handle server errors gracefully (internal errors)', function (done) {
        // Force an error by passing invalid parameters or simulating a DB error
        request(app)
            .get('/volunteerHistoryReport/volunteer-participation/csv')
            .query({ status: 'invalid_status' })
            .expect(500)  // Assuming your API returns 500 on server errors
            .end(done);
    });

    it('should handle missing query parameters gracefully', function (done) {
        request(app)
            .get('/volunteerHistoryReport/volunteer-participation/csv')
            .query({})  // Missing necessary filters
            .expect('Content-Type', /text\/csv/)
            .expect(200)  // Expecting a valid response even if parameters are missing
            .end(done);
    });
});

describe('Database Query Logic Tests', function () {
    it('should return no data when no volunteer data matches the filters', function (done) {
        request(app)
            .get('/volunteerHistoryReport/volunteer-participation/csv')
            .query({ status: 'pending', startDate: '2025-01-01', endDate: '2025-12-31' })
            .expect('Content-Type', /text\/csv/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                res.text.should.equal('');  // Expect no data for the future date range
                done();
            });
    });

    it('should return filtered data when combining status and date range', function (done) {
        request(app)
            .get('/volunteerHistoryReport/volunteer-participation/csv')
            .query({ status: 'completed', startDate: '2023-01-01', endDate: '2023-12-31' })
            .expect('Content-Type', /text\/csv/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                res.text.should.contain('completed');
                res.text.should.contain('2023');
                done();
            });
    });
});