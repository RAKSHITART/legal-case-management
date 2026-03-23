import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiBell, FiCheck, FiTrash2, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/notifications');
            setNotifications(response.data.data);
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
            toast.success('Marked as read');
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('Failed to mark as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put('http://localhost:5000/api/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    const deleteNotification = async (id) => {
        if (window.confirm('Delete this notification?')) {
            try {
                await axios.delete(`http://localhost:5000/api/notifications/${id}`);
                setNotifications(notifications.filter(n => n._id !== id));
                if (!notifications.find(n => n._id === id)?.isRead) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
                toast.success('Notification deleted');
            } catch (error) {
                console.error('Error deleting notification:', error);
                toast.error('Failed to delete notification');
            }
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'hearing': return <FiCalendar className="text-blue-500" />;
            case 'priority': return <FiAlertCircle className="text-red-500" />;
            default: return <FiBell className="text-gray-500" />;
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }
        return 'Just now';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="btn-secondary text-sm"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                        <div className="mt-1">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-800">{notification.title}</h3>
                                            <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                                            <div className="flex items-center mt-2 text-xs text-gray-400">
                                                <span>{getTimeAgo(notification.createdAt)}</span>
                                                {notification.relatedCase && (
                                                    <>
                                                        <span className="mx-2">•</span>
                                                        <Link
                                                            to={`/cases/${notification.relatedCase._id}`}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            View Case
                                                        </Link>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => markAsRead(notification._id)}
                                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                title="Mark as read"
                                            >
                                                <FiCheck />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notification._id)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            title="Delete"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FiBell className="mx-auto text-4xl text-gray-300 mb-3" />
                        <p className="text-gray-500">No notifications yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;