/*import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-multi-date-picker";
import "./Login.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    skills: [],
    preferences: "",
    availability: [],
  });

  const states = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS",
    "KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY",
    "NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
  ];

  const Skills = [
    "Teamwork", "Communication", "Problem-solving", "Empathy", 
    "Adaptability", "Critical thinking", "Conflict resolution", "Positive attitude"
  ];

  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === "select-multiple") {
      const values = Array.from(selectedOptions, opt => opt.value);
      setFormData(prev => ({ ...prev, [name]: values }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (dates) => {
    setFormData(prev => ({
      ...prev,
      availability: dates
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.username) {
      setMessage("Session error — please log in again.");
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/users/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          ...formData,
          availability: formData.availability.map((d) => d.format("YYYY-MM-DD"))
        })
      });

      const data = await res.json();
      console.log("Profile completion response", data);

      if (data.success) {
        user.profile_completed = 1;
        localStorage.setItem("user", JSON.stringify(user));
        setMessage("Profile completed successfully!");
        setTimeout(() => navigate("/volunteer-dashboard"), 1500);
      } else {
        setMessage(data.message || "Could not mark profile complete.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server error trying to complete profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const RequiredLabel = ({ children }) => (
    <label>
      {children} <span style={{ color: "red" }}>*</span>
    </label>
  );

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-card register-card">
          <button className="back-home-button" onClick={() => navigate("/")}>← Back to Home</button>
          <div className="auth-header">
            <div className="logo">VolunteerApp</div>
            <h1 className="auth-title">Complete Your Profile</h1>
            <p className="auth-subtitle">This form shows once, to set up your preferences.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <RequiredLabel>Full Name</RequiredLabel>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <RequiredLabel>Address 1</RequiredLabel>
              <input
                name="address1"
                value={formData.address1}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Address 2</label>
              <input
                name="address2"
                value={formData.address2}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <RequiredLabel>City</RequiredLabel>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <RequiredLabel>State</RequiredLabel>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select state</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <RequiredLabel>Zip</RequiredLabel>
              <input
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                maxLength={9}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <RequiredLabel>Skills (multiple select)</RequiredLabel>
              <select
                multiple
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="form-input"
              >
                {Skills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Preferences</label>
              <textarea
                name="preferences"
                value={formData.preferences}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <RequiredLabel>Availability (multiple dates)</RequiredLabel>
              <DatePicker
                multiple
                value={formData.availability}
                onChange={handleDateChange}
                format="MMM D, YYYY"
                className="form-input"
              />
            </div>
            <button type="submit" disabled={isSaving} className="auth-button">
              {isSaving ? "Saving..." : "Complete Profile"}
            </button>
            {message && (
              <div className={`message ${message.includes("success") ? "success" : "error"}`}>
                {message}
              </div>
            )}
          </form>
        </div>

       
        <div className="auth-side-panel">
          <div className="side-content">
            <h2>Make an Impact</h2>
            <p>Join thousands of volunteers making a difference worldwide.</p>
            <div className="features">
              <div className="feature">
                <div className="feature-icon">🤝</div>
                <div>
                  <h3>Connect</h3>
                  <p>Find opportunities that match your passion</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">🌍</div>
                <div>
                  <h3>Impact</h3>
                  <p>Make a difference locally and globally</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">📈</div>
                <div>
                  <h3>Grow</h3>
                  <p>Develop skills while helping others</p>
                </div>
              </div>
            </div>
          </div>
        </div>
       
      </div>
    </div>
  );
};

export default ProfilePage;
*/

// ProfilePage.jsx
import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import DatePicker from "react-multi-date-picker";
import "./Login.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    skills: [],
    preferences: "",
    availability: [],
  });

  const states = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS",
    "KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY",
    "NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
  ];

  const Skills = [
    { id: 1, name: "Teamwork" },
    { id: 2, name: "Communication" },
    { id: 3, name: "Problem-solving" },
    { id: 4, name: "Empathy" },
    { id: 5, name: "Adaptability" },
    { id: 6, name: "Critical thinking" },
    { id: 7, name: "Conflict resolution" },
    { id: 8, name: "Positive attitude" }
  ];

  //  Pre-fill profile on mount
  useEffect(() => {
    const fetchExistingProfile = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/profile/me", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setFormData({
            name: data.profile.fullname || "",
            address1: data.profile.adrlineone || "",
            address2: data.profile.adrlinetwo || "",
            city: data.profile.City || "",
            state: data.profile.State || "",
            zip: data.profile.zipcode || "",
            preferences: data.profile.preferences || "",
            skills: data.skills?.map(s => s.skill_id) || [],
            availability: data.availability?.map(d => new Date(d)) || [],
          });
        }
      } catch (err) {
        console.error("Failed to fetch existing profile", err);
      }
    };
    fetchExistingProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === "select-multiple") {
      const values = Array.from(selectedOptions, opt =>
        name === "skills" ? Number(opt.value) : opt.value
      );
      setFormData(prev => ({ ...prev, [name]: values }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (dates) => {
    setFormData(prev => ({
      ...prev,
      availability: dates
    }));
  };

  // Fixed handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      console.log("Formatted availability dates:", formData.availability.map(d => d.format("YYYY-MM-DD")));
      
      const res = await fetch("http://localhost:8080/api/users/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullname: formData.name,
          adrlineone: formData.address1,
          adrlinetwo: formData.address2,
          City: formData.city,
          State: formData.state,
          zipcode: formData.zip,
          preferences: formData.preferences,
          skills: formData.skills,
          availability: formData.availability.map(d => d.format("YYYY-MM-DD")),
        }),
      });

      const data = await res.json();
      console.log("Profile completion response", data);

      if (data.success) {
        setMessage("Profile completed successfully!");
        setTimeout(() => navigate("/volunteer-dashboard"), 1500);
      } else {
        setMessage(data.message || "Could not mark profile complete.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server error trying to complete profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const RequiredLabel = ({ children }) => (
    <label>
      {children} <span style={{ color: "red" }}>*</span>
    </label>
  );

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-card register-card">
          <button className="back-home-button" onClick={() => navigate("/")}>← Back to Home</button>
          <div className="auth-header">
            <div className="logo">VolunteerApp</div>
            <h1 className="auth-title">Complete Your Profile</h1>
            <p className="auth-subtitle">This form shows once, to set up your preferences.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <RequiredLabel>Full Name</RequiredLabel>
              <input name="name" value={formData.name} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <RequiredLabel>Address 1</RequiredLabel>
              <input name="address1" value={formData.address1} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label>Address 2</label>
              <input name="address2" value={formData.address2} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <RequiredLabel>City</RequiredLabel>
                <input name="city" value={formData.city} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <RequiredLabel>State</RequiredLabel>
                <select name="state" value={formData.state} onChange={handleChange} className="form-input">
                  <option value="">Select state</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <RequiredLabel>Zip</RequiredLabel>
              <input name="zip" value={formData.zip} onChange={handleChange} maxLength={9} className="form-input" />
            </div>
            <div className="form-group">
              <RequiredLabel>Skills (multiple select)</RequiredLabel>
              <select multiple name="skills" value={formData.skills} onChange={handleChange} className="form-input">
                {Skills.map(skill => (
                  <option key={skill.id} value={skill.id}>{skill.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Preferences</label>
              <textarea name="preferences" value={formData.preferences} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <RequiredLabel>Availability (multiple dates)</RequiredLabel>
              <DatePicker
                multiple
                value={formData.availability}
                onChange={handleDateChange}
                format="MMM D, YYYY"
                className="form-input"
              />
            </div>
            <button type="submit" disabled={isSaving} className="auth-button">
              {isSaving ? "Saving..." : "Complete Profile"}
            </button>
            {message && (
              <div className={`message ${message.includes("success") ? "success" : "error"}`}>
                {message}
              </div>
            )}
          </form>
        </div>

        <div className="auth-side-panel">
          <div className="side-content">
            <h2>Make an Impact</h2>
            <p>Join thousands of volunteers making a difference worldwide.</p>
            <div className="features">
              <div className="feature">
                <div className="feature-icon">🤝</div>
                <div>
                  <h3>Connect</h3>
                  <p>Find opportunities that match your passion</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">🌍</div>
                <div>
                  <h3>Impact</h3>
                  <p>Make a difference locally and globally</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">📈</div>
                <div>
                  <h3>Grow</h3>
                  <p>Develop skills while helping others</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
