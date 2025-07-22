import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VolunteerHistoryPage = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.user_id;

    // Set periwinkle page background on mount, reset on unmount
    useEffect(() => {
        const originalBg = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#CCCCFF'; // periwinkle

        return () => {
            document.body.style.backgroundColor = originalBg;
        };
    }, []);

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

    const colors = {
        white: '#FFFFFF',
        darkPurple: '#3B0A45',
        mediumPurple: '#5B2C6F',
        borderPurple: '#4A235A',
        hoverPurple: '#9B59B6',
    };

    const containerStyle = {
        padding: '2rem',
        maxWidth: '900px',
        margin: '40px auto',
        backgroundColor: colors.white,
        borderRadius: '12px',
        boxShadow: `0 4px 12px rgba(59, 10, 69, 0.3)`,
        color: colors.darkPurple,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    };

    const headingStyle = {
        marginBottom: '25px',
        fontWeight: '700',
        fontSize: '2rem',
        textAlign: 'center',
        color: colors.darkPurple,
    };

    const loadingNoNotifTextStyle = {
        textAlign: 'center',
        fontSize: '1.2rem',
        color: colors.mediumPurple,
        fontWeight: '600',
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        boxShadow: `0 2px 8px rgba(74, 35, 90, 0.15)`,
    };

    const thStyle = {
        padding: '12px 15px',
        border: `1px solid ${colors.borderPurple}`,
        textAlign: 'left',
        fontWeight: '700',
        fontSize: '0.95rem',
        backgroundColor: colors.darkPurple,
        color: colors.white,
        userSelect: 'none',
    };

    const tdStyle = {
        padding: '10px 14px',
        border: `1px solid ${colors.borderPurple}`,
        fontSize: '0.9rem',
    };

    const statusColor = (status) => {
        switch (status) {
            case 'completed': return 'green';
            case 'assigned': return 'blue';
            case 'cancelled': return 'red';
            default: return colors.darkPurple;
        }
    };

    // Row hover handling (optional)
    const [hoveredRowIdx, setHoveredRowIdx] = useState(null);

    return (
        <div style={containerStyle}>
            <h2 style={headingStyle}>Volunteer History</h2>

            {loading ? (
                <p style={loadingNoNotifTextStyle}>Loading...</p>
            ) : assignments.length === 0 ? (
                <p style={loadingNoNotifTextStyle}>No past participation found.</p>
            ) : (
                <table style={tableStyle}>
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
                        {assignments.map((a, idx) => {
                            const isHovered = hoveredRowIdx === idx;
                            return (
                                <tr
                                    key={idx}
                                    style={{
                                        backgroundColor: idx % 2 === 0 ? '#f7f5ff' : colors.white,
                                        transition: 'background-color 0.3s ease',
                                        ...(isHovered ? { backgroundColor: colors.hoverPurple, color: colors.white } : {}),
                                        cursor: 'default',
                                    }}
                                    onMouseEnter={() => setHoveredRowIdx(idx)}
                                    onMouseLeave={() => setHoveredRowIdx(null)}
                                >
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
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default VolunteerHistoryPage;
