// test/notifications.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server/server');
const expect = chai.expect;

chai.use(chaiHttp);

describe('GET /api/notifications/:userId', () => {
    it('should return mock notifications for valid userId and matching query param', (done) => {
        const userId = 1;

        chai.request(app)
            .get(`/api/notifications/${userId}`)
            .query({ userId })  // must match param for access
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                expect(res.body.length).to.be.greaterThan(0);

                const notif = res.body[0];
                expect(notif).to.have.property('notification_id');
                expect(notif).to.have.property('message');
                expect(notif).to.have.property('created_at');
                expect(notif).to.have.property('read_status');
                done();
            });
    });

    it('should return 403 if userId param and query/body userId mismatch', (done) => {
        chai.request(app)
            .get('/api/notifications/123')
            .query({ userId: 999 }) // mismatch
            .end((err, res) => {
                expect(res).to.have.status(403);
                expect(res.body).to.have.property('error');
                done();
            });
    });
});
