import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiPlus, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            // You'll need to create a tasks endpoint or use cases for now
            const response = await axios.get('http://localhost:5000/api/cases');
            // Filter tasks from cases or create a separate tasks endpoint
            setTasks(response.data.data.slice(0, 10));
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'Emergency': return <FiAlertCircle className="text-red-500" />;
            case 'High': return <FiAlertCircle className="text-orange-500" />;
            case 'Medium': return <FiClock className="text-yellow-500" />;
            default: return <FiCheckCircle className="text-green-500" />;
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            'Open': 'bg-green-100 text-green-800',
            'Progress': 'bg-blue-100 text-blue-800',
            'Closed': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Tasks & Deadlines</h1>
                <button className="btn-primary flex items-center">
                    <FiPlus className="mr-2" />
                    Add Task
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="table-header">Task</th>
                                <th className="table-header">Case</th>
                                <th className="table-header">Priority</th>
                                <th className="table-header">Status</th>
                                <th className="table-header">Due Date</th>
                                <th className="table-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tasks.length > 0 ? (
                                tasks.map((task) => (
                                    <tr key={task._id} className="hover:bg-gray-50">
                                        <td className="table-cell">
                                            <div className="flex items-center">
                                                {getPriorityIcon(task.priority)}
                                                <span className="ml-2">{task.title}</span>
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <Link to={`/cases/${task._id}`} className="text-blue-600 hover:text-blue-800">
                                                {task.caseNumber}
                                            </Link>
                                        </td>
                                        <td className="table-cell">
                                            <span className={`px-2 py-1 text-xs rounded-full ${task.priority === 'Emergency' ? 'bg-red-100 text-red-800' :
                                                    task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                }`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td className="table-cell">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(task.status)}`}>
                                                {task.status}
                                            </span>
                                        </td>
                                        <td className="table-cell">
                                            {task.hearingDate ? new Date(task.hearingDate).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="table-cell">
                                            <button className="text-blue-600 hover:text-blue-800 mr-3">
                                                Edit
                                            </button>
                                            <button className="text-green-600 hover:text-green-800">
                                                Complete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">
                                        No tasks found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Tasks;