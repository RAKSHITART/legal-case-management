import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiFilter, FiDownload } from 'react-icons/fi';
import Modal from 'react-modal';
import toast from 'react-hot-toast';

Modal.setAppElement('#root');

const Cases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [formData, setFormData] = useState({
    caseNumber: '',
    title: '',
    description: '',
    client: '',
    practiceArea: 'Corporate',
    priority: 'Medium',
    status: 'Open',
    outcome: 'In Progress',
    filedDate: '',
    filedTime: '',
    hearingDate: '',
    hearingTime: '',
    courtLocation: '',
    judge: '',
    opposingParty: '',
    opposingCounsel: ''
  });
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetchCases();
    fetchClients();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/cases');
      setCases(response.data.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/clients?limit=100');
      setClients(response.data.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCase) {
        await axios.put(`http://localhost:5000/api/cases/${selectedCase._id}`, formData);
        toast.success('Case updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/cases', formData);
        toast.success('Case created successfully');
      }
      setModalIsOpen(false);
      resetForm();
      fetchCases();
    } catch (error) {
      console.error('Error saving case:', error);
      toast.error(error.response?.data?.message || 'Failed to save case');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this case?')) {
      try {
        await axios.delete(`http://localhost:5000/api/cases/${id}`);
        toast.success('Case deleted successfully');
        fetchCases();
      } catch (error) {
        console.error('Error deleting case:', error);
        toast.error('Failed to delete case');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      caseNumber: '',
      title: '',
      description: '',
      client: '',
      practiceArea: 'Corporate',
      priority: 'Medium',
      status: 'Open',
      outcome: 'In Progress',
      filedDate: '',
      filedTime: '',
      hearingDate: '',
      hearingTime: '',
      courtLocation: '',
      judge: '',
      opposingParty: '',
      opposingCounsel: ''
    });
    setSelectedCase(null);
  };

  const openModal = (caseItem = null) => {
    if (caseItem) {
      setSelectedCase(caseItem);
      setFormData({
        caseNumber: caseItem.caseNumber || '',
        title: caseItem.title || '',
        description: caseItem.description || '',
        client: caseItem.client?._id || '',
        practiceArea: caseItem.practiceArea || 'Corporate',
        priority: caseItem.priority || 'Medium',
        status: caseItem.status || 'Open',
        outcome: caseItem.outcome || 'In Progress',
        filedDate: caseItem.filedDate ? new Date(caseItem.filedDate).toISOString().split('T')[0] : '',
        filedTime: caseItem.filedTime || '',
        hearingDate: caseItem.hearingDate ? new Date(caseItem.hearingDate).toISOString().split('T')[0] : '',
        hearingTime: caseItem.hearingTime || '',
        courtLocation: caseItem.courtLocation || '',
        judge: caseItem.judge || '',
        opposingParty: caseItem.opposingParty || '',
        opposingCounsel: caseItem.opposingCounsel || ''
      });
    } else {
      resetForm();
    }
    setModalIsOpen(true);
  };

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = 
      caseItem.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || caseItem.status === filters.status;
    const matchesPriority = !filters.priority || caseItem.priority === filters.priority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const exportToCSV = () => {
    const headers = ['Case Number', 'Title', 'Client', 'Practice Area', 'Priority', 'Status', 'Outcome', 'Filed Date', 'Hearing Date', 'Court Location'];
    const data = filteredCases.map(c => [
      c.caseNumber,
      c.title,
      c.client?.name,
      c.practiceArea,
      c.priority,
      c.status,
      c.outcome,
      new Date(c.filedDate).toLocaleDateString(),
      new Date(c.hearingDate).toLocaleDateString(),
      c.courtLocation
    ]);

    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cases.csv';
    a.click();
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Emergency': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Open': return 'bg-green-100 text-green-800';
      case 'Progress': return 'bg-blue-100 text-blue-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Case Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={exportToCSV}
            className="btn-secondary flex items-center"
          >
            <FiDownload className="mr-2" />
            Export
          </button>
          <button
            onClick={() => openModal()}
            className="btn-primary flex items-center"
          >
            <FiPlus className="mr-2" />
            Add New Case
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <div className="flex-1 relative mb-4 md:mb-0">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by case number, title, or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center md:w-auto"
          >
            <FiFilter className="mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-field"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="input-field"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
        )}
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Case Number</th>
                <th className="table-header">Title</th>
                <th className="table-header">Client</th>
                <th className="table-header">Practice Area</th>
                <th className="table-header">Priority</th>
                <th className="table-header">Status</th>
                <th className="table-header">Hearing Date</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredCases.length > 0 ? (
                filteredCases.map((caseItem) => (
                  <tr key={caseItem._id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{caseItem.caseNumber}</td>
                    <td className="table-cell">{caseItem.title}</td>
                    <td className="table-cell">{caseItem.client?.name || 'N/A'}</td>
                    <td className="table-cell">{caseItem.practiceArea}</td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(caseItem.priority)}`}>
                        {caseItem.priority}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(caseItem.status)}`}>
                        {caseItem.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      {caseItem.hearingDate ? new Date(caseItem.hearingDate).toLocaleDateString() : 'N/A'}
                    </td>
                    {/* In the actions column, update the eye icon link */}
<td className="table-cell">
  <div className="flex space-x-3">
    <Link
      to={`/cases/${caseItem._id}`}
      className="text-blue-600 hover:text-blue-800"
      title="View Details"
    >
      <FiEye />
    </Link>
    <button
      onClick={() => openModal(caseItem)}
      className="text-green-600 hover:text-green-800"
      title="Edit"
    >
      <FiEdit2 />
    </button>
    <button
      onClick={() => handleDelete(caseItem._id)}
      className="text-red-600 hover:text-red-800"
      title="Delete"
    >
      <FiTrash2 />
    </button>
  </div>
</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No cases found. Click "Add New Case" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Form Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-white rounded-lg p-6 max-w-4xl mx-auto my-8 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {selectedCase ? 'Edit Case' : 'Add New Case'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case Number *
                </label>
                <input
                  type="text"
                  name="caseNumber"
                  value={formData.caseNumber}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client *
                </label>
                <select
                  name="client"
                  value={formData.client}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Case Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Practice Area *
                </label>
                <select
                  name="practiceArea"
                  value={formData.practiceArea}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="Corporate">Corporate</option>
                  <option value="Criminal">Criminal</option>
                  <option value="Civil">Civil</option>
                  <option value="Family">Family</option>
                  <option value="Property">Property</option>
                  <option value="Intellectual Property">Intellectual Property</option>
                  <option value="Tax">Tax</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="Open">Open</option>
                  <option value="Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outcome *
                </label>
                <select
                  name="outcome"
                  value={formData.outcome}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                  <option value="Settled">Settled</option>
                  <option value="Dismissed">Dismissed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filed Date *
                </label>
                <input
                  type="date"
                  name="filedDate"
                  value={formData.filedDate}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filed Time *
                </label>
                <input
                  type="time"
                  name="filedTime"
                  value={formData.filedTime}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hearing Date *
                </label>
                <input
                  type="date"
                  name="hearingDate"
                  value={formData.hearingDate}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hearing Time *
                </label>
                <input
                  type="time"
                  name="hearingTime"
                  value={formData.hearingTime}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court Location *
                </label>
                <input
                  type="text"
                  name="courtLocation"
                  value={formData.courtLocation}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judge
                </label>
                <input
                  type="text"
                  name="judge"
                  value={formData.judge}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opposing Party
                </label>
                <input
                  type="text"
                  name="opposingParty"
                  value={formData.opposingParty}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opposing Counsel
                </label>
                <input
                  type="text"
                  name="opposingCounsel"
                  value={formData.opposingCounsel}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => setModalIsOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                {selectedCase ? 'Update Case' : 'Create Case'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <style jsx>{`
        .modal {
          position: relative;
          outline: none;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }
      `}</style>
    </div>
  );
};

export default Cases;