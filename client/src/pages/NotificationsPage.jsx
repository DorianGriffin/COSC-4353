import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './NotificationsPage.css';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const storedUser = JSON.parse(localStorage.getItem("user"));
    console.log("Loaded user from localStorage:", storedUser); 
    const userId = storedUser?.user_id;

    useEffect(() => {
        if (!userId) {
            console.warn("No user ID found in localStorage");
            return; // Don't make request
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

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="notifications-container">
            <h2>Notifications</h2>
            {loading ? (
                <p className="loading-text">Loading...</p>
            ) : notifications.length === 0 ? (
                <p className="no-notifications-text">No notifications found.</p>
            ) : (
                <table className="notifications-table">
                    <thead>
                        <tr>
                            <th>Message</th>
                            <th>Created Date</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notifications.map((n) => {
                            const createdAt = new Date(n.created_at);
                            const dateString = createdAt.toLocaleDateString();
                            const timeString = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                            return (
                                <tr key={n.notification_id} className={n.read_status ? 'read' : 'unread'}>
                                    <td className="message-cell">{n.message}</td>
                                    <td className="created-date">{dateString}</td>
                                    <td className="created-time">{timeString}</td>

                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}
        </div>
    )
};

export default NotificationsPage;