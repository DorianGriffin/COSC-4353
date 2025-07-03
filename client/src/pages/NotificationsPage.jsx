import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredRowId, setHoveredRowId] = useState(null);

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.user_id;

    // Set the page background color on mount and clean it on unmount
    useEffect(() => {
        const originalBg = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#CCCCFF'; // Periwinkle page background

        return () => {
            document.body.style.backgroundColor = originalBg; // Reset on unmount
        };
    }, []);

    useEffect(() => {
        if (!userId) {
            console.warn("No user ID found in localStorage");
            return;
        }

        axios
            .get(`http://localhost:8080/api/notifications/${userId}`, {
                params: { userId }
            })
            .then((res) => {
                setNotifications(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch notifications:', err);
                setLoading(false);
            });
    }, [userId]);

    const colors = {
        white: '#FFFFFF',         // content background
        darkPurple: '#3B0A45',   // text and accent
        mediumPurple: '#5B2C6F', // medium purple for highlights
        hoverPurple: '#9B59B6',  // lighter purple on hover
        borderPurple: '#4A235A', // table borders
    };

    const containerStyle = {
        maxWidth: '800px',
        margin: '40px auto',
        padding: '25px',
        background: colors.white, // white content background
        borderRadius: '12px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: colors.darkPurple,
        boxShadow: `0 4px 12px rgba(59, 10, 69, 0.3)`,
    };

    const headingStyle = {
        textAlign: 'center',
        marginBottom: '25px',
        color: colors.darkPurple,
        fontWeight: '700',
        fontSize: '2rem',
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
        backgroundColor: colors.white,
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: `0 4px 10px rgba(59, 10, 69, 0.15)`,
    };

    const theadStyle = {
        backgroundColor: colors.darkPurple,
        color: colors.white,
    };

    const thTdStyle = {
        padding: '14px 18px',
        textAlign: 'left',
        borderBottom: `1px solid ${colors.borderPurple}`,
        userSelect: 'none',
    };

    const messageCellStyle = {
        maxWidth: '400px',
        wordWrap: 'break-word',
    };

    const dateTimeCellStyle = {
        whiteSpace: 'nowrap',
        width: '130px',
    };

    const getRowStyle = (read_status, isHovered) => ({
        backgroundColor: colors.white,
        fontWeight: read_status ? 'normal' : '700',
        color: read_status ? colors.mediumPurple : colors.darkPurple,
        cursor: 'default',
        transition: 'background-color 0.3s ease',
        ...(isHovered && { backgroundColor: colors.hoverPurple, color: colors.white }),
    });

    return (
        <div style={containerStyle}>
            <h2 style={headingStyle}>Notifications</h2>
            {loading ? (
                <p style={loadingNoNotifTextStyle}>Loading...</p>
            ) : notifications.length === 0 ? (
                <p style={loadingNoNotifTextStyle}>No notifications found.</p>
            ) : (
                <table style={tableStyle}>
                    <thead style={theadStyle}>
                        <tr>
                            <th style={thTdStyle}>Message</th>
                            <th style={thTdStyle}>Created Date</th>
                            <th style={thTdStyle}>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notifications.map((n) => {
                            const createdAt = new Date(n.created_at);
                            const dateString = createdAt.toLocaleDateString();
                            const timeString = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const isHovered = hoveredRowId === n.notification_id;

                            return (
                                <tr
                                    key={n.notification_id}
                                    style={getRowStyle(n.read_status, isHovered)}
                                    onMouseEnter={() => setHoveredRowId(n.notification_id)}
                                    onMouseLeave={() => setHoveredRowId(null)}
                                >
                                    <td style={{ ...thTdStyle, ...messageCellStyle }}>{n.message}</td>
                                    <td style={{ ...thTdStyle, ...dateTimeCellStyle }}>{dateString}</td>
                                    <td style={{ ...thTdStyle, ...dateTimeCellStyle }}>{timeString}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default NotificationsPage;
