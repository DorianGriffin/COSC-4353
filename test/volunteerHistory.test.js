const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server/server');
chai.use(chaiHttp);
const { expect } = chai;

describe('Volunteer History API', () => {
    it('should return volunteer history for a valid user ID', done => {
        chai.request(app)
            .get('/api/volunteer-history/1')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                expect(res.body.length).to.be.above(0);
                done();
            });
    });

    it('should return 400 for invalid user ID', done => {
        chai.request(app)
            .get('/api/volunteer-history/abc')
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('error');
                done();
            });
    });
});
