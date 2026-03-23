import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    FiArrowLeft,
    FiEdit2,
    FiTrash2,
    FiCalendar,
    FiMapPin,
    FiUser,
    FiBriefcase,
    FiDownload
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const CaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    const fetchCaseDetails = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/cases/${id}`);
            setCaseData(response.data.data);
        } catch (error) {
            console.error('Error fetching case details:', error);
            toast.error('Failed to fetch case details');
            navigate('/cases');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchCaseDetails();
    }, [fetchCaseDetails]);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this case?')) {
            try {
                await axios.delete(`http://localhost:5000/api/cases/${id}`);
                toast.success('Case deleted successfully');
                navigate('/cases');
            } catch (error) {
                console.error('Error deleting case:', error);
                toast.error('Failed to delete case');
            }
        }
    };

    const handleDownloadPDF = async () => {
        try {
            setDownloading(true);

            const response = await axios.get(`http://localhost:5000/api/files/cases/${id}/download`, {
                responseType: 'blob'
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `case-${caseData.caseNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('PDF downloaded successfully');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error('Failed to download PDF');
        } finally {
            setDownloading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'bg-green-100 text-green-800';
            case 'Progress': return 'bg-yellow-100 text-yellow-800';
            case 'Closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Emergency': return 'bg-red-100 text-red-800';
            case 'High': return 'bg-orange-100 text-orange-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!caseData) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Case not found</p>
                <button
                    onClick={() => navigate('/cases')}
                    className="mt-4 btn-primary"
                >
                    Back to Cases
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header with navigation and actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/cases')}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <FiArrowLeft className="mr-2" />
                    Back to Cases
                </button>

                <div className="flex space-x-3">
                    {/* Download PDF Button */}
                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiDownload className="mr-2" />
                        {downloading ? 'Generating...' : 'Download PDF'}
                    </button>

                    {/* Edit Button */}
                    <Link
                        to={`/cases/edit/${id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center"
                    >
                        <FiEdit2 className="mr-2" />
                        Edit
                    </Link>

                    {/* Delete Button */}
                    <button
                        onClick={handleDelete}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center"
                    >
                        <FiTrash2 className="mr-2" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Case Title Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{caseData.title}</h1>
                        <p className="text-gray-600 mt-1">Case #{caseData.caseNumber}</p>
                    </div>
                    <div className="flex space-x-2">
                        <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(caseData.status)}`}>
                            {caseData.status}
                        </span>
                        <span className={`px-3 py-1 text-sm rounded-full ${getPriorityColor(caseData.priority)}`}>
                            {caseData.priority}
                        </span>
                    </div>
                </div>
            </div>

            {/* Client Information Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FiUser className="mr-2 text-blue-600" />
                    Client Information
                </h2>

                {caseData.client ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium text-gray-800">{caseData.client.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email Address</p>
                            <p className="font-medium text-gray-800">{caseData.client.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Phone Number</p>
                            <p className="font-medium text-gray-800">{caseData.client.phoneNumber}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Profession</p>
                            <p className="font-medium text-gray-800">{caseData.client.profession}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No client information available</p>
                )}
            </div>

            {/* Case Details Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FiBriefcase className="mr-2 text-blue-600" />
                    Case Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-500">Practice Area</p>
                        <p className="font-medium text-gray-800">{caseData.practiceArea}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Case Outcome</p>
                        <p className="font-medium text-gray-800">{caseData.outcome}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Filed Date & Time</p>
                        <p className="font-medium text-gray-800">
                            {new Date(caseData.filedDate).toLocaleDateString()} at {caseData.filedTime}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Presiding Judge</p>
                        <p className="font-medium text-gray-800">{caseData.judge || 'Not assigned'}</p>
                    </div>

                    {caseData.opposingParty && (
                        <div>
                            <p className="text-sm text-gray-500">Opposing Party</p>
                            <p className="font-medium text-gray-800">{caseData.opposingParty}</p>
                        </div>
                    )}

                    {caseData.opposingCounsel && (
                        <div>
                            <p className="text-sm text-gray-500">Opposing Counsel</p>
                            <p className="font-medium text-gray-800">{caseData.opposingCounsel}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Hearing Information Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FiCalendar className="mr-2 text-blue-600" />
                    Hearing Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-500">Hearing Date & Time</p>
                        <p className="font-medium text-gray-800">
                            {new Date(caseData.hearingDate).toLocaleDateString()} at {caseData.hearingTime}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Court Location</p>
                        <p className="font-medium text-gray-800 flex items-center">
                            <FiMapPin className="mr-1 text-gray-400" />
                            {caseData.courtLocation}
                        </p>
                    </div>
                </div>
            </div>

            {/* Case Description Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Case Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {caseData.description || 'No description provided'}
                </p>
            </div>

            {/* Metadata Section */}
            <div className="text-sm text-gray-400 text-center">
                <p>Case created on {new Date(caseData.createdAt).toLocaleString()}</p>
                {caseData.updatedAt && caseData.updatedAt !== caseData.createdAt && (
                    <p className="mt-1">Last updated on {new Date(caseData.updatedAt).toLocaleString()}</p>
                )}
            </div>
        </div>
    );
};

export default CaseDetails;