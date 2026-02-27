const Client = require('../models/Client');
const Case = require('../models/Case');

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
const createClient = async (req, res) => {
  try {
    const clientData = {
      ...req.body,
      user: req.user.id
    };

    const client = await Client.create(clientData);

    res.status(201).json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
const getClients = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    let query = { user: req.user.id };

    if (search) {
      query.$text = { $search: search };
    }

    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get case counts for each client
    const clientsWithCaseCount = await Promise.all(
      clients.map(async (client) => {
        const cases = await Case.find({
          client: client._id,
          user: req.user.id
        }).select('caseNumber title status priority hearingDate');

        return {
          ...client.toObject(),
          caseCount: cases.length,
          cases: cases // Include cases array
        };
      })
    );

    const total = await Client.countDocuments(query);

    res.status(200).json({
      success: true,
      data: clientsWithCaseCount,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private
const getClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Get all cases for this client
    const cases = await Case.find({
      client: client._id,
      user: req.user.id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...client.toObject(),
        cases
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
const deleteClient = async (req, res) => {
  try {
    // Check if client has any cases
    const caseCount = await Case.countDocuments({
      client: req.params.id,
      user: req.user.id
    });

    if (caseCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete client with existing cases. Please delete or reassign cases first.'
      });
    }

    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient
};