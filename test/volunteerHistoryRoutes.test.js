
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require('../server/server');
const { expect } = chai;

chai.use(chaiHttp);

describe("Volunteer History Routes", () => {
    it("should return status 200 and volunteer history", async () => {
        const res = await chai.request(app).get("/api/volunteer-history/123");

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array").that.is.not.empty;
        expect(res.body[0]).to.have.property("event_name");
        expect(res.body[0]).to.have.property("status");
    });

    it("should return 500 for server error", async () => {
        const res = await chai.request(app).get("/api/volunteer-history/123");

        expect(res).to.have.status(500);
        expect(res.body).to.have.property("error");
    });
});

