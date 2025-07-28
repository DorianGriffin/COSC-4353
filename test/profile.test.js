// test/profile.test.js
const { completeProfile, getProfile } = require('../server/controllers/profileController');

describe('Profile Controller', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    return res;
  };

  const validProfile = {
    username: "Israelmumay",
    name: "Israel Mumay",
    address1: "414 Milan St",
    city: "Houston",
    state: "TX",
    zip: "77002",
    skills: ["Statistic"],
    availability: ["2025-07-30"]
  };

  it('should return error if name is missing', () => {
    const req = { body: { ...validProfile, name: undefined } };
    const res = mockRes();
    completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Name is required and must be at most 50 characters."
    }));
  });

  it('should return error if address1 is missing', () => {
    const req = { body: { ...validProfile, address1: undefined } };
    const res = mockRes();
    completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Address1 is required and must be at most 100 characters."
    }));
  });

  it('should return error if city is missing', () => {
    const req = { body: { ...validProfile, city: undefined } };
    const res = mockRes();
    completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "City is required and must be at most 100 characters."
    }));
  });

  it('should return error if state is invalid', () => {
    const req = { body: { ...validProfile, state: "Texas" } }; 
    const res = mockRes();
    completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "State is required."
    }));
  });

  it('should return error if zip is invalid', () => {
    const req = { body: { ...validProfile, zip: "12" } }; 
    const res = mockRes();
    completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Zip must be between 5 and 9 characters."
    }));
  });

  it('should return error if skills is missing', () => {
    const req = { body: { ...validProfile, skills: undefined } };
    const res = mockRes();
    completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "At least one skill is required."
    }));
  });

  it('should return error if availability is missing', () => {
    const req = { body: { ...validProfile, availability: undefined } };
    const res = mockRes();
    completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "At least one availability date is required."
    }));
  });

 
  it('should save a valid profile', () => {
    const req = { body: validProfile };
    const res = mockRes();
    completeProfile(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: "Profile saved successfully."
    }));
  });

  it('should return profile data if username exists', () => {
    const reqSave = { body: validProfile };
    const resSave = mockRes();
    completeProfile(reqSave, resSave);

    const reqGet = { params: { username: validProfile.username } };
    const resGet = mockRes();

    getProfile(reqGet, resGet);
    expect(resGet.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({ name: "Israel Mumay" })
    }));
  });

  it('should return 404 if profile not found', () => {
    const req = { params: { username: "ghost" } };
    const res = mockRes();
    getProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Profile not found."
    }));
  });
});
