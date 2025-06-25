import React, { useEffect, useState } from 'react';
import axios from 'axios';

const thStyle = {
    padding: '10px',
    border: '1px solid #ccc',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '0.9rem',
    backgroundColor: '#aeb8ff',
};

const tdStyle = {
    padding: '8px',
    border: '1px solid #ccc',
    fontSize: '0.85rem',
};

const statusColor = (status) => {
    switch (status) {
        case 'completed': return 'green';
        case 'assigned': return 'blue';
        case 'cancelled': return 'red';
        default: return 'black';
    }
};

const VolunteerHistoryPage = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.user_id;

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        axios.get(`http://localhost:8080/api/volunteer-history/${userId}`)
            .then(res => {
                setAssignments(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch volunteer history:', err);
                setLoading(false);
            });
    }, [userId]);

    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto', backgroundColor: '#e0e6f8', borderRadius: '8px' }}>
            <h2>Volunteer History</h2>

            {loading ? (
                <p>Loading...</p>
            ) : assignments.length === 0 ? (
                <p>No past participation found.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Event Name</th>
                            <th style={thStyle}>Description</th>
                            <th style={thStyle}>Location</th>
                            <th style={thStyle}>Required Skills</th>
                            <th style={thStyle}>Urgency</th>
                            <th style={thStyle}>Event Date</th>
                            <th style={thStyle}>Participation Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignments.map((a, idx) => (
                            <tr key={idx} style={idx % 2 === 0 ? { backgroundColor: '#f4f7ff' } : {}}>
                                <td style={tdStyle}>{a.event_name}</td>
                                <td style={tdStyle}>{a.description}</td>
                                <td style={tdStyle}>{a.location}</td>
                                <td style={tdStyle}>{a.required_skills || 'None'}</td>
                                <td style={tdStyle}>{a.urgency}</td>
                                <td style={tdStyle}>{new Date(a.event_date).toLocaleDateString()}</td>
                                <td style={{ ...tdStyle, fontWeight: 'bold', color: statusColor(a.status) }}>
                                    {a.status === 'assigned' ? 'Attending' : a.status === 'completed' ? 'Attended' : a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default VolunteerHistoryPage;
