import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import Modal from 'react-modal';
import toast from 'react-hot-toast';

Modal.setAppElement('#root');

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [viewClient, setViewClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    profession: '',
    company: '',
    notes: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/clients');
      setClients(response.data.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedClient) {
        await axios.put(`http://localhost:5000/api/clients/${selectedClient._id}`, formData);
        toast.success('Client updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/clients', formData);
        toast.success('Client created successfully');
      }
      setModalIsOpen(false);
      resetForm();
      fetchClients();
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error(error.response?.data?.message || 'Failed to save client');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await axios.delete(`http://localhost:5000/api/clients/${id}`);
        toast.success('Client deleted successfully');
        fetchClients();
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error(error.response?.data?.message || 'Failed to delete client');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      profession: '',
      company: '',
      notes: ''
    });
    setSelectedClient(null);
  };

  const openModal = (client = null) => {
    if (client) {
      setSelectedClient(client);
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phoneNumber: client.phoneNumber || '',
        address: client.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        profession: client.profession || '',
        company: client.company || '',
        notes: client.notes || ''
      });
    } else {
      resetForm();
    }
    setModalIsOpen(true);
  };

  const viewClientDetails = (client) => {
    setViewClient(client);
  };

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phoneNumber?.includes(searchTerm) ||
    client.profession?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Client Management</h1>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center"
        >
          <FiPlus className="mr-2" />
          Add New Client
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or profession..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <div key={client._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{client.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{client.profession}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewClientDetails(client)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => openModal(client)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(client._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <FiMail className="mr-2 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiPhone className="mr-2 flex-shrink-0" />
                      <span>{client.phoneNumber}</span>
                    </div>
                    {client.company && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FiMapPin className="mr-2 flex-shrink-0" />
                        <span>{client.company}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Cases: <span className="font-semibold text-gray-800">{client.caseCount || 0}</span>
                      </span>
                      <Link
                        to={`/cases?client=${client._id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Cases
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-gray-500">
              No clients found. Click "Add New Client" to create one.
            </div>
          )}
        </div>
      )}

      {/* Client Form Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto my-8 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {selectedClient ? 'Edit Client' : 'Add New Client'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profession *
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
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
                {selectedClient ? 'Update Client' : 'Create Client'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* View Client Modal */}
      <Modal
        isOpen={!!viewClient}
        onRequestClose={() => setViewClient(null)}
        className="modal"
        overlayClassName="modal-overlay"
      >
        {viewClient && (
          <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto my-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Client Details</h2>
              <button
                onClick={() => setViewClient(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Name</label>
                  <p className="text-lg font-medium text-gray-800">{viewClient.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Profession</label>
                  <p className="text-lg font-medium text-gray-800">{viewClient.profession}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="text-lg font-medium text-gray-800">{viewClient.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="text-lg font-medium text-gray-800">{viewClient.phoneNumber}</p>
                </div>
                {viewClient.company && (
                  <div>
                    <label className="text-sm text-gray-500">Company</label>
                    <p className="text-lg font-medium text-gray-800">{viewClient.company}</p>
                  </div>
                )}
              </div>

              {(viewClient.address?.street || viewClient.address?.city) && (
                <div>
                  <label className="text-sm text-gray-500">Address</label>
                  <p className="text-lg font-medium text-gray-800">
                    {viewClient.address.street && `${viewClient.address.street}, `}
                    {viewClient.address.city && `${viewClient.address.city}, `}
                    {viewClient.address.state && `${viewClient.address.state} `}
                    {viewClient.address.zipCode && viewClient.address.zipCode}
                    {viewClient.address.country && `, ${viewClient.address.country}`}
                  </p>
                </div>
              )}

              {viewClient.notes && (
                <div>
                  <label className="text-sm text-gray-500">Notes</label>
                  <p className="text-lg font-medium text-gray-800">{viewClient.notes}</p>
                </div>
              )}

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Associated Cases</h3>
                {viewClient.cases && viewClient.cases.length > 0 ? (
                  <div className="space-y-3">
                    {viewClient.cases.map(caseItem => (
                      <div key={caseItem._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{caseItem.caseNumber}</p>
                          <p className="text-sm text-gray-600">{caseItem.title}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          caseItem.status === 'Open' ? 'bg-green-100 text-green-800' :
                          caseItem.status === 'Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {caseItem.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No cases associated with this client</p>
                )}
              </div>
            </div>
          </div>
        )}
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

export default Clients;