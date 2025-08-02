const { completeProfile, getProfile, getLoggedInProfile } = require('../server/controllers/profileController');
const db = require('../server/models/db');

describe('Profile Controller – Validations + DB + Session Tests', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    return res;
  };

  const testUsername = "test_IsraelMumay";
  const testUserIdQuery = `SELECT user_id, profile_completed FROM users WHERE username = ?`;

  const validProfile = {
    fullName: "Israel Mumay",
    adrlineone: "414 Milan St",
    adrlinetwo: "",
    City: "Houston",
    State: "TX",
    zipcode: "77002",
    preferences: "Flexible",
    skills: [1],
    availability: ["2025-08-01", "2025-08-05"]
  };

  beforeAll(async () => {
    await db.execute(`INSERT IGNORE INTO users (username, password_hash) VALUES (?, ?)`, [
      testUsername,
      "israelmumay123"
    ]);
    await db.execute(`INSERT IGNORE INTO skills (skill_id, skill_name) VALUES (?, ?)`, [1, "First Aid"]);
  });

  afterAll(async () => {
    const [[user]] = await db.execute(testUserIdQuery, [testUsername]);
    if (user && testUsername.startsWith("test_")) {
      await db.execute(`DELETE FROM userskills WHERE user_id = ?`, [user.user_id]);
      await db.execute(`DELETE FROM useravailability WHERE user_id = ?`, [user.user_id]);
      await db.execute(`DELETE FROM userprofiles WHERE user_id = ?`, [user.user_id]);
      await db.execute(`DELETE FROM users WHERE user_id = ?`, [user.user_id]);
    }
    db.end();
  });

  // VALIDATIONS
  it('should return error if fullName is missing', async () => {
    const req = { session: { user: { username: testUsername } }, body: { ...validProfile, fullName: undefined } };
    const res = mockRes();
    await completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return error if zipcode is too short', async () => {
    const req = { session: { user: { username: testUsername } }, body: { ...validProfile, zipcode: "12" } };
    const res = mockRes();
    await completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return error if state is not 2 characters', async () => {
    const req = { session: { user: { username: testUsername } }, body: { ...validProfile, State: "Texas" } };
    const res = mockRes();
    await completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return error if skills is empty', async () => {
    const req = { session: { user: { username: testUsername } }, body: { ...validProfile, skills: [] } };
    const res = mockRes();
    await completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return error if availability is empty', async () => {
    const req = { session: { user: { username: testUsername } }, body: { ...validProfile, availability: [] } };
    const res = mockRes();
    await completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return error if adrlineone is missing or too long', async () => {
    const res = mockRes();

    const reqMissing = {
      session: { user: { username: testUsername } },
      body: { ...validProfile, adrlineone: undefined }
    };
    await completeProfile(reqMissing, res);
    expect(res.status).toHaveBeenCalledWith(400);

    const reqTooLong = {
      session: { user: { username: testUsername } },
      body: { ...validProfile, adrlineone: 'a'.repeat(101) }
    };
    await completeProfile(reqTooLong, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return error if adrlinetwo exceeds 100 characters', async () => {
    const req = {
      session: { user: { username: testUsername } },
      body: { ...validProfile, adrlinetwo: 'a'.repeat(101) }
    };
    const res = mockRes();
    await completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Address line 2 must be ≤ 100 characters."
    }));
  });

  it('should return error if City is missing or too long', async () => {
    const res = mockRes();

    const reqMissing = {
      session: { user: { username: testUsername } },
      body: { ...validProfile, City: undefined }
    };
    await completeProfile(reqMissing, res);
    expect(res.status).toHaveBeenCalledWith(400);

    const reqTooLong = {
      session: { user: { username: testUsername } },
      body: { ...validProfile, City: 'a'.repeat(101) }
    };
    await completeProfile(reqTooLong, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // DB INTEGRATION
  it('should return 401 if session is missing for completeProfile', async () => {
    const req = { session: null, body: validProfile };
    const res = mockRes();
  
    await completeProfile(req, res);
  
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Not logged in. Missing session username."
    }));
  });

  it('should return 404 if user is not found in DB for completeProfile', async () => {
    const req = {
      session: { user: { username: "ghost_user_not_exist_123" } },
      body: validProfile
    };
    const res = mockRes();
  
    await completeProfile(req, res);
  
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "User not found."
    }));
  });
  

  it('should save valid profile and return 200', async () => {
    const req = { session: { user: { username: testUsername } }, body: validProfile };
    const res = mockRes();
    await completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: "Profile completed."
    }));
  });

  it('should mark profile_completed = 1 in the users table', async () => {
    const [[user]] = await db.execute(testUserIdQuery, [testUsername]);
    expect(user.profile_completed).toBe(1);
  });

  it('should not insert duplicate skills or availability entries', async () => {
    const [[user]] = await db.execute(testUserIdQuery, [testUsername]);

    await db.execute(`DELETE FROM userskills WHERE user_id = ?`, [user.user_id]);
    await db.execute(`DELETE FROM useravailability WHERE user_id = ?`, [user.user_id]);

    const duplicateProfile = {
      ...validProfile,
      skills: [1, 1],
      availability: ["2025-08-01", "2025-08-01"]
    };

    const req = { session: { user: { username: testUsername } }, body: duplicateProfile };
    const res = mockRes();

    await completeProfile(req, res);

    const [skills] = await db.execute(`SELECT * FROM userskills WHERE user_id = ?`, [user.user_id]);
    const [availability] = await db.execute(`SELECT available_date FROM useravailability WHERE user_id = ?`, [user.user_id]);

    const uniqueDates = new Set(
      availability.map(row =>
        new Date(row.available_date).toISOString().split('T')[0]
      )
    );

    expect(skills.length).toBe(1);
    expect(uniqueDates.size).toBe(1);
  });

  it('should save profile even if preferences is undefined (null in DB)', async () => {
    const profileWithoutPreferences = {
      ...validProfile,
      preferences: undefined
    };
    const req = { session: { user: { username: testUsername } }, body: profileWithoutPreferences };
    const res = mockRes();

    await completeProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: "Profile completed."
    }));
  });

  // PROFILE FETCHING
  it('should retrieve saved profile from database', async () => {
    const req = { params: { username: testUsername } };
    const res = mockRes();
    await getProfile(req, res);
    expect(res.status).not.toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      profile: expect.objectContaining({
        fullName: validProfile.fullName,
        City: validProfile.City
      }),
      skills: expect.any(Array),
      availability: expect.any(Array)
    }));
  });

  it('should return 404 if user does not exist', async () => {
    const req = { params: { username: "ghost_user_123" } };
    const res = mockRes();
    await getProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  // SESSION TESTS
  it('should return 401 if session is missing for getLoggedInProfile', async () => {
    const req = { session: null };
    const res = mockRes();
    await getLoggedInProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should retrieve profile using getLoggedInProfile if session is present', async () => {
    const req = {
      session: { user: { username: testUsername } },
      params: {}
    };
    const res = mockRes();
    await getLoggedInProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 401 if session.user.username is missing in getLoggedInProfile', async () => {
    const req = { session: { user: {} } }; // username missing
    const res = mockRes();
    await getLoggedInProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Not logged in"
    }));
  });
  
  
  it('should return 404 if session username is not found in DB in getLoggedInProfile', async () => {
    const req = { session: { user: { username: "ghost_user_123" } } }; // user doesn't exist
    const res = mockRes();
    await getLoggedInProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "User not found."
    }));
  });
  

  // ERROR HANDLING
  it('should return 500 if DB error occurs during profile completion', async () => {
    const spy = jest.spyOn(db, 'query').mockRejectedValueOnce(new Error("DB Fail"));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const req = { session: { user: { username: testUsername } }, body: validProfile };
    const res = mockRes();

    await completeProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Internal server error."
    }));

    spy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('should return 500 if DB error occurs in getProfile', async () => {
    const spy = jest.spyOn(db, 'query').mockRejectedValueOnce(new Error("DB Fail"));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const req = { params: { username: "test_fail" } };
    const res = mockRes();

    await getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Internal server error."
    }));

    spy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('should return 500 if DB error occurs in getLoggedInProfile', async () => {
    const spy = jest.spyOn(db, 'query').mockRejectedValueOnce(new Error("DB Fail"));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const req = { session: { user: { username: "test_fail_logged" } } };
    const res = mockRes();

    await getLoggedInProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Internal server error."
    }));

    spy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('should return 500 if session access throws error in getLoggedInProfile', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const req = {
      get session() {
        throw new Error("Simulated crash");
      }
    };
    const res = mockRes();

    await getLoggedInProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Internal server error."
    }));

    consoleSpy.mockRestore();
  });
});


/* const { completeProfile, getProfile, getLoggedInProfile } = require('../server/controllers/profileController');
const db = require('../server/models/db'); 

describe('Profile Controller – Validations + DB + Session Tests', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    return res;
  };

  const testUsername = "test_IsraelMumay";
  const testUserIdQuery = `SELECT user_id, profile_completed FROM users WHERE username = ?`;

  const validProfile = {
    username: testUsername,
    fullName: "Israel Mumay",
    adrlineone: "414 Milan St",
    adrlinetwo: "",
    City: "Houston",
    State: "TX",
    zipcode: "77002",
    preferences: "Flexible",
    skills: [1],
    availability: ["2025-08-01", "2025-08-05"]
  };

  beforeAll(async () => {
    await db.execute(`INSERT IGNORE INTO users (username, password_hash) VALUES (?, ?)`, [
      validProfile.username,
      "israelmumay123"
    ]);
    await db.execute(`INSERT IGNORE INTO skills (skill_id, skill_name) VALUES (?, ?)`, [1, "First Aid"]);
    
  });

  afterAll(async () => {
    const [[user]] = await db.execute(testUserIdQuery, [validProfile.username]);
    if (user && testUsername.startsWith("test_")) {
      await db.execute(`DELETE FROM userskills WHERE user_id = ?`, [user.user_id]);
      await db.execute(`DELETE FROM useravailability WHERE user_id = ?`, [user.user_id]);
      await db.execute(`DELETE FROM userprofiles WHERE user_id = ?`, [user.user_id]);
      await db.execute(`DELETE FROM users WHERE user_id = ?`, [user.user_id]);
    }
    db.end();
  });

  // VALIDATION 
  it('should return error if fullName is missing', async () => {
    const req = { body: { ...validProfile, fullName: undefined } };
    const res = mockRes();
    await completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return error if zipcode is too short', async () => {
    const req = { body: { ...validProfile, zipcode: "12" } };
    const res = mockRes();
    await completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return error if state is not 2 characters', async () => {
    const req = { body: { ...validProfile, State: "Texas" } };
    const res = mockRes();
    await completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return error if skills is empty', async () => {
    const req = { body: { ...validProfile, skills: [] } };
    const res = mockRes();
    await completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return error if availability is empty', async () => {
    const req = { body: { ...validProfile, availability: [] } };
    const res = mockRes();
    await completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return error if adrlineone is missing or too long', async () => {
    const res = mockRes();
  
    const reqMissing = { body: { ...validProfile, adrlineone: undefined } };
    await completeProfile(reqMissing, res);
    expect(res.status).toHaveBeenCalledWith(400);
  
    const reqTooLong = { body: { ...validProfile, adrlineone: 'a'.repeat(101) } };
    await completeProfile(reqTooLong, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  

  it('should return error if adrlinetwo exceeds 100 characters', async () => {
    const req = { body: { ...validProfile, adrlinetwo: 'a'.repeat(101) } };
    const res = mockRes();
    await completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Address line 2 must be ≤ 100 characters."
    }));
  });

  it('should return error if City is missing or too long', async () => {
    const res = mockRes();
  
    const reqMissing = { body: { ...validProfile, City: undefined } };
    await completeProfile(reqMissing, res);
    expect(res.status).toHaveBeenCalledWith(400);
  
    const reqTooLong = { body: { ...validProfile, City: 'a'.repeat(101) } };
    await completeProfile(reqTooLong, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  

  // DB INTEGRATION 
  it('should save valid profile and return 200', async () => {
    const req = { body: validProfile };
    const res = mockRes();
    await completeProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: "Profile completed."
    }));
  });

  it('should mark profile_completed = 1 in the users table', async () => {
    const [[user]] = await db.execute(testUserIdQuery, [validProfile.username]);
    expect(user.profile_completed).toBe(1);
  });

  it('should not insert duplicate skills or availability entries', async () => {
    // Fetch user_id
    const [[user]] = await db.execute(testUserIdQuery, [validProfile.username]);
  
    // Clean up duplicates if any exist
    await db.execute(`DELETE FROM userskills WHERE user_id = ?`, [user.user_id]);
    await db.execute(`DELETE FROM useravailability WHERE user_id = ?`, [user.user_id]);
  
    // Prepare duplicate data
    const duplicateProfile = {
      ...validProfile,
      skills: [1, 1],
      availability: ["2025-08-01", "2025-08-01"]
    };
    const req = { body: duplicateProfile };
    const res = mockRes();
  
    // Insert profile
    await completeProfile(req, res);
  
    //  Check inserted data
    const [skills] = await db.execute(`SELECT * FROM userskills WHERE user_id = ?`, [user.user_id]);
    const [availability] = await db.execute(`SELECT available_date FROM useravailability WHERE user_id = ?`, [user.user_id]);
  
    const uniqueDates = new Set(
      availability.map(row =>
        new Date(row.available_date).toISOString().split('T')[0]
      )
    );
  
    expect(skills.length).toBe(1);
    expect(uniqueDates.size).toBe(1);
  });
  
  it('should return 404 if username is valid format but user does not exist in DB', async () => {
    const req = { body: { ...validProfile, username: "non_existent_user_123" } };
    const res = mockRes();
  
    await completeProfile(req, res);
  
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "User not found."
    }));
  });
  
  it('should save profile even if preferences is undefined (null in DB)', async () => {
    const profileWithoutPreferences = {
      ...validProfile,
      preferences: undefined
    };
    const req = { body: profileWithoutPreferences };
    const res = mockRes();
  
    await completeProfile(req, res);
  
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: "Profile completed."
    }));
  });
  

  it('should retrieve saved profile from database', async () => {
    const req = { params: { username: validProfile.username } };
    const res = mockRes();
    await getProfile(req, res);
    expect(res.status).not.toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      profile: expect.objectContaining({
        fullName: validProfile.fullName,
        City: validProfile.City
      }),
      skills: expect.any(Array),
      availability: expect.any(Array)
    }));
  });

  it('should return 404 if user does not exist', async () => {
    const req = { params: { username: "ghost_user_123" } };
    const res = mockRes();
    await getProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  // SESSION-BASED 
  it('should return 401 if session is missing for getLoggedInProfile', async () => {
    const req = { session: null };
    const res = mockRes();
    await getLoggedInProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should retrieve profile using getLoggedInProfile if session is present', async () => {
    const req = {
      session: { user: { username: validProfile.username } },
      params: {}
    };
    const res = mockRes();
    await getLoggedInProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 500 if DB error occurs during profile completion', async () => {
    const spy = jest.spyOn(db, 'query').mockRejectedValueOnce(new Error("DB Fail"));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const req = { body: { ...validProfile, username: "non_existent_user" } };
    const res = mockRes();
  
    await completeProfile(req, res);
  
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Internal server error."
    }));
  
    spy.mockRestore();
    consoleSpy.mockRestore();
  });
  
  
  it('should return 500 if DB error occurs in getProfile', async () => {
    const spy = jest.spyOn(db, 'query').mockRejectedValueOnce(new Error("DB Fail"));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const req = { params: { username: "test_fail" } };
    const res = mockRes();
  
    await getProfile(req, res);
  
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Internal server error."
    }));
  
    spy.mockRestore();
    consoleSpy.mockRestore(); 
  });
  

  it('should return 500 if session throws or DB error occurs in getLoggedInProfile', async () => {
    const spy = jest.spyOn(db, 'query').mockRejectedValueOnce(new Error("DB Fail"));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const req = {
      session: { user: { username: "test_fail_logged" } }
    };
    const res = mockRes();
  
    await getLoggedInProfile(req, res);
  
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Internal server error."
    }));
  
    spy.mockRestore();
    consoleSpy.mockRestore();
  });
  
  it('should return 500 if exception occurs in getLoggedInProfile', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const req = {
      get session() {
        throw new Error("Simulated crash");
      }
    };
    const res = mockRes();
  
    await getLoggedInProfile(req, res);
  
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Internal server error."
    }));
  
    consoleSpy.mockRestore();
  });
  

});
 */
