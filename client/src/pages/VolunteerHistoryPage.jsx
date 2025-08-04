import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VolunteerHistoryPage = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredRowIdx, setHoveredRowIdx] = useState(null);

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.user_id;

    const [upcomingAssignments, setUpcomingAssignments] = useState([]);
    const [pastAssignments, setPastAssignments] = useState([]);

    const navigate = useNavigate();

    const handleGoToDashboard = () => {
        navigate('/volunteer-dashboard');
    };

    const renderTable = (assignments = [], title) => (
        <>
            <h3 style={{ ...headingStyle, fontSize: '1.5rem', marginTop: '40px' }}>{title}</h3>
            {assignments.length === 0 ? (
                <p style={loadingNoNotifTextStyle}>No {title.toLowerCase()} found.</p>
            ) : (
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Event Name</th>
                            <th style={thStyle}>Description</th>
                            <th style={thStyle}>Location</th>
                            <th style={thStyle}>Required Skills</th>
                            <th style={thStyle}>Urgency</th>
                            <th style={thStyle}>Date</th>
                            <th style={thStyle}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignments.map((a, idx) => {
                            const isHovered = hoveredRowIdx === `${title}-${idx}`;
                            return (
                                <tr
                                    key={`${title}-${idx}`}
                                    style={{
                                        backgroundColor: idx % 2 === 0 ? '#f7f5ff' : colors.white,
                                        transition: 'background-color 0.3s ease',
                                        ...(isHovered ? { backgroundColor: colors.hoverPurple, color: colors.white } : {}),
                                        cursor: 'default',
                                    }}
                                    onMouseEnter={() => setHoveredRowIdx(`${title}-${idx}`)}
                                    onMouseLeave={() => setHoveredRowIdx(null)}
                                >
                                    <td style={tdStyle}>{a.event_name}</td>
                                    <td style={tdStyle}>{a.description}</td>
                                    <td style={tdStyle}>{a.location}</td>
                                    <td style={tdStyle}>
                                        {Array.isArray(a.required_skills)
                                            ? a.required_skills.join(', ')
                                            : typeof a.required_skills === 'string'
                                                ? (() => {
                                                    try {
                                                        const parsed = JSON.parse(a.required_skills);
                                                        return Array.isArray(parsed) ? parsed.join(', ') : 'None';
                                                    } catch {
                                                        return a.required_skills;
                                                    }
                                                })()
                                                : 'None'}
                                    </td>
                                    <td style={tdStyle}>{a.urgency}</td>
                                    <td style={tdStyle}>{new Date(a.end_datetime).toLocaleDateString()}</td>
                                    <td style={{ ...tdStyle, fontWeight: 'bold', color: statusColor(a.status) }}>
                                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </>
    );

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
                const { upcoming, past } = res.data;

                setUpcomingAssignments(upcoming);
                setPastAssignments(past);
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

    return (
        <div style={containerStyle}>
            {userId && (
                <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                    <button
                        onClick={handleGoToDashboard}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: colors.darkPurple,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                        }}
                    >
                        Back to Dashboard
                    </button>
                </div>
            )}
            <h2 style={headingStyle}>Volunteer Assignments</h2>

            {loading ? (
                <p style={loadingNoNotifTextStyle}>Loading...</p>
            ) : (
                <>
                    <p style={{
                        fontStyle: 'italic',
                        color: colors.mediumPurple,
                        textAlign: 'center',
                        marginBottom: '20px'
                    }}>
                       This is a collection of your past assignments!
                        </p>
                    {renderTable(pastAssignments, 'Past Assignments')}
                </>
            )}

        </div>
    );
};

export default VolunteerHistoryPage;
