import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminVolunteerMatching.css';

const AdminVolunteerMatching = () => {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ date: '', city: '', state: '', eventName: '' });
  const [sortBy, setSortBy] = useState('');
  const [clickedBtn, setClickedBtn] = useState('');
  const navigate = useNavigate();

  const fetchMatches = (query = '') => {
    fetch(`http://localhost:8080/api/matching/admin/matches${query}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch matched events");
        return res.json();
      })
      .then((data) => {
        setMatches(data.matches);
        setError('');
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch matched events.");
      });
  };

  const applyFilters = () => {
    setClickedBtn('apply');
    setTimeout(() => setClickedBtn(''), 300);

    const queryObj = { ...filters };
    if (sortBy) queryObj.sortBy = sortBy;
    const query = '?' + new URLSearchParams(queryObj).toString();
    fetchMatches(query);
  };

  const clearFilters = () => {
    setClickedBtn('clear');
    setTimeout(() => setClickedBtn(''), 300);

    setFilters({ date: '', city: '', state: '', eventName: '' });
    setSortBy('');
    fetchMatches(); // reset to default fetch
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('user');
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  return (
    <div className="admin-container">
      <nav className="admin-navbar">
        <div className="admin-logo">VolunteerApp Admin</div>
        <div className="admin-nav-links">
          <button className="nav-btn" onClick={() => navigate("/events")}>Manage Events</button>
          <button className="nav-btn active">Volunteer Matching</button>
          <button className="nav-btn" onClick={() => navigate("/")}>Back to Home</button>
          <button className="nav-btn logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="admin-content">
        <h2>All Volunteer Matches</h2>
        <p className="subtitle">
          Below is the list of matched volunteers and events based on their skills, availability, and location.
        </p>

        <div style={styles.filterRow}>
          <input
            style={styles.input}
            placeholder="Date (YYYY-MM-DD)"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="City"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="State"
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Event Name"
            value={filters.eventName}
            onChange={(e) => setFilters({ ...filters, eventName: e.target.value })}
          />
          <select
            style={styles.select}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="date">Date</option>
            <option value="urgency">Urgency</option>
          </select>
          <button
            style={styles.filterBtn}
            onClick={applyFilters}
            className={clickedBtn === 'apply' ? 'button-clicked' : ''}
          >
            Apply Filters
          </button>
          <button
            style={styles.clearBtn}
            onClick={clearFilters}
            className={clickedBtn === 'clear' ? 'button-clicked' : ''}
          >
            Clear
          </button>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {matches.length > 0 ? (
          matches.map((match, index) => (
            <div key={index} style={styles.card}>
              <p><strong>Volunteer:</strong> {match.userName}</p>
              <p><strong>Event:</strong> {match.eventName}</p>
              <p><strong>Date:</strong> {match.eventDate}</p>
              <p><strong>Description:</strong> {match.eventDescription}</p>
              <p><strong>Location:</strong> {match.eventLocation}</p>
              <p><strong>Status:</strong> <span style={statusColor(match.status)}>{match.status}</span></p>
              <p><strong>Urgency Level:</strong> {match.urgency_level}</p>
            </div>
          ))
        ) : (
          <p style={{ color: 'gray' }}>No volunteer matches found.</p>
        )}
      </div>
    </div>
  );
};

const statusColor = (status) => ({
  color:
    status === 'assigned' ? 'green' :
    status === 'cancelled' ? 'red' :
    status === 'completed' ? 'blue' : 'gray'
});

const styles = {
  card: {
    border: '1px solid #ccc',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: '#f9f9f9',
  },
  input: {
    padding: '0.5rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
    flex: '1 1 180px',
    minWidth: '150px'
  },
  select: {
    padding: '0.5rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
    minWidth: '150px'
  },
  filterBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  clearBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  filterRow: {
    marginBottom: '1rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    alignItems: 'center'
  }
};

export default AdminVolunteerMatching;

