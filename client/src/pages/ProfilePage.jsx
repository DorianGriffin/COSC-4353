import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import DatePicker from "react-multi-date-picker";
import "./Login.css";
import "./ProfilePage.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    skills: [],
    preferences: "",
    availability: [],
    showSkills: false,
  });

  const states = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS",
    "KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY",
    "NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
  ];

  const Skills = [
    { id: 1, name: "First Aid" },
    { id: 2, name: "Communication" },
    { id: 3, name: "CPR" },
    { id: 4, name: "Leadership" },
    { id: 5, name: "Organization" },
    { id: 6, name: "Physical Labor" },
    { id: 7, name: "Teaching" },
    { id: 8, name: "Cooking" },
    { id: 9, name: "Driving" },
    { id: 10, name: "Technology" },
    { id: 12, name: "Medical" },
    { id: 13, name: "Construction" },
    { id: 14, name: "Event Planning" },
    { id: 15, name: "Fundraising" }
  ];

  useEffect(() => {
    const fetchExistingProfile = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/profile/me", {
          credentials: "include",
        });
        const data = await res.json();
          if (data.success && data.profile) {
          setFormData(prev => ({
            ...prev,
            fullName: data.profile.fullName || "",
            address1: data.profile.adrlineone || "",
            address2: data.profile.adrlinetwo || "",
            city: data.profile.City || "",
            state: data.profile.State || "",
            zip: data.profile.zipcode || "",
            preferences: data.profile.preferences || "",
            skills: data.skills?.map(s => s.skill_id) || [],
            availability: data.availability?.map(d => new Date(d)) || [],
          }));
          
        } else {
            console.warn("No existing profile data found.");
        }
      } catch (err) {
        console.error("Failed to fetch existing profile", err);
      }
    };
    fetchExistingProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    try {
      const formattedAvailability = Array.isArray(formData.availability) && formData.availability.length > 0
        ? formData.availability.map(d => {
          if (typeof d === "object" && typeof d.format === "function") {
            return d.format("YYYY-MM-DD");
          } else if (d instanceof Date) {
            return d.toISOString().split("T")[0];
          } else if (typeof d === "string") {
            return new Date(d).toISOString().split("T")[0];
          }
          return d;
        })
        : undefined;

      const res = await fetch("http://localhost:8080/api/profile/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: formData.fullName,
          adrlineone: formData.address1,
          adrlinetwo: formData.address2,
          City: formData.city,
          State: formData.state,
          zipcode: formData.zip,
          preferences: formData.preferences,
          skills: formData.skills,
          ...(formattedAvailability !== undefined && { availability: formattedAvailability }),
        }),
      });

      const data = await res.json();
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

       
        <div className="form-wrapper">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <RequiredLabel>Full Name</RequiredLabel>
              <input name="fullName" value={formData.fullName} onChange={handleChange} className="form-input" />
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
              <div className="custom-multiselect">
                <button
                  type="button"
                  className="dropdown-toggle"
                  onClick={() =>
                    setFormData(prev => ({ ...prev, showSkills: !prev.showSkills }))
                  }
                >
                  Select your skills
                  <span className={`chevron-icon ${formData.showSkills ? "open" : ""}`}>▼</span>
                </button>
                {formData.showSkills && (
                  <div className="dropdown-menu">
                    {Skills.map(skill => (
                      <label key={skill.id} className="dropdown-item">
                        <input
                          type="checkbox"
                          value={skill.id}
                          checked={formData.skills.includes(skill.id)}
                          onChange={e => {
                            const skillId = Number(e.target.value);
                            setFormData(prev => ({
                              ...prev,
                              skills: e.target.checked
                                ? [...prev.skills, skillId]
                                : prev.skills.filter(id => id !== skillId)
                            }));
                          }}
                        />
                        {skill.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
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
                minDate={new Date()}
                render={(value, openCalendar) => (
                  <input
                    readOnly
                    onClick={openCalendar}
                    className="form-input"
                    value={
                      Array.isArray(formData.availability) && formData.availability.length > 0
                        ? "Selected dates"
                        : "Choose availability"
                    }
                  />
                )}
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


