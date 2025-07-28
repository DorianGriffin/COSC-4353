// server/controllers/profileController.js
const userProfiles = {}; 


function validateProfile(data) {
  const { name, address1, city, state, zip, skills, availability } = data;

  if (!name || name.length > 50) 
  return "Name is required and must be at most 50 characters.";
  if (!address1 || address1.length > 100) 
  return "Address1 is required and must be at most 100 characters.";
  if (!city || city.length > 100) 
  return "City is required and must be at most 100 characters.";
  if (!state || state.length !== 2) 
  return "State is required.";
  if (!zip || zip.length < 5 || zip.length > 9) 
  return "Zip must be between 5 and 9 characters.";
  if (!Array.isArray(skills) || skills.length === 0) 
  return "At least one skill is required.";
  if (!Array.isArray(availability) || availability.length === 0) 
  return "At least one availability date is required.";

  return null;
}


exports.completeProfile = (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ success: false, message: "Username is required." });

  const error = validateProfile(req.body);
  if (error) return res.status(400).json({ success: false, message: error });

  userProfiles[username] = req.body;

  return res.json({ success: true, message: "Profile saved successfully." });
};


exports.getProfile = (req, res) => {
  const { username } = req.params;
  const profile = userProfiles[username];

  if (!profile) {
    return res.status(404).json({ success: false, message: "Profile not found." });
  }

  return res.json({ success: true, data: profile });
};

