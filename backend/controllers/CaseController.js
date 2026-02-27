const Case = require('../models/Case');
const Client = require('../models/Client');
const Notification = require('../models/Notification');

// @desc    Create new case
// @route   POST /api/cases
// @access  Private
const createCase = async (req, res) => {
  try {
    const caseData = {
      ...req.body,
      user: req.user.id
    };

    // Check if client exists
    const client = await Client.findOne({
      _id: req.body.client,
      user: req.user.id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const newCase = await Case.create(caseData);

    // Create notification for high priority cases
    if (newCase.priority === 'Emergency') {
      await Notification.create({
        user: req.user.id,
        type: 'priority',
        title: 'Emergency Case Added',
        message: `Emergency case ${newCase.caseNumber} has been added`,
        relatedCase: newCase._id,
        priority: 'Emergency'
      });
    }

    // Create notification for upcoming hearing
    const hearingDate = new Date(newCase.hearingDate);
    const now = new Date();
    const daysUntilHearing = Math.ceil((hearingDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilHearing <= 7) {
      await Notification.create({
        user: req.user.id,
        type: 'hearing',
        title: 'Upcoming Hearing',
        message: `Hearing for case ${newCase.caseNumber} is in ${daysUntilHearing} days`,
        relatedCase: newCase._id,
        scheduledFor: hearingDate
      });
    }

    res.status(201).json({
      success: true,
      data: newCase
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

// @desc    Get all cases
// @route   GET /api/cases
// @access  Private
const getCases = async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 10 } = req.query;
    
    let query = { user: req.user.id };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Search by case number, title, or description
    if (search) {
      query.$text = { $search: search };
    }

    const cases = await Case.find(query)
      .populate('client', 'name email phoneNumber')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Case.countDocuments(query);

    res.status(200).json({
      success: true,
      data: cases,
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

// @desc    Get single case
// @route   GET /api/cases/:id
// @access  Private
const getCase = async (req, res) => {
  try {
    const caseItem = await Case.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('client', 'name email phoneNumber address profession');

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    res.status(200).json({
      success: true,
      data: caseItem
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

// @desc    Update case
// @route   PUT /api/cases/:id
// @access  Private
const updateCase = async (req, res) => {
  try {
    let caseItem = await Case.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Track changes for notifications
    const oldStatus = caseItem.status;
    const oldPriority = caseItem.priority;
    const oldHearingDate = caseItem.hearingDate;

    // Update using findOneAndUpdate with proper options
    caseItem = await Case.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      {
        new: true, // Still needed for now, will be deprecated but works
        runValidators: true,
        context: 'query' // Important for enum validation
      }
    );

    // Create notification if status changed to Closed
    if (oldStatus !== 'Closed' && caseItem.status === 'Closed') {
      await Notification.create({
        user: req.user.id,
        type: 'general',
        title: 'Case Closed',
        message: `Case ${caseItem.caseNumber} has been closed`,
        relatedCase: caseItem._id
      });
    }

    // Create notification if priority changed to Emergency
    if (oldPriority !== 'Emergency' && caseItem.priority === 'Emergency') {
      await Notification.create({
        user: req.user.id,
        type: 'priority',
        title: 'Priority Changed to Emergency',
        message: `Case ${caseItem.caseNumber} is now marked as Emergency`,
        relatedCase: caseItem._id,
        priority: 'Emergency'
      });
    }

    // Create notification if hearing date changed
    if (oldHearingDate && oldHearingDate.toString() !== caseItem.hearingDate.toString()) {
      await Notification.create({
        user: req.user.id,
        type: 'hearing',
        title: 'Hearing Date Changed',
        message: `Hearing for case ${caseItem.caseNumber} has been rescheduled to ${new Date(caseItem.hearingDate).toLocaleDateString()}`,
        relatedCase: caseItem._id,
        scheduledFor: caseItem.hearingDate
      });
    }

    res.status(200).json({
      success: true,
      data: caseItem
    });
  } catch (error) {
    console.error('Update Case Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete case
// @route   DELETE /api/cases/:id
// @access  Private
const deleteCase = async (req, res) => {
  try {
    const caseItem = await Case.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    await caseItem.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Case deleted successfully'
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

// @desc    Add document to case
// @route   POST /api/cases/:id/documents
// @access  Private
const addDocument = async (req, res) => {
  try {
    const caseItem = await Case.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    const { name, fileUrl } = req.body;

    caseItem.documents.push({
      name,
      fileUrl
    });

    await caseItem.save();

    res.status(200).json({
      success: true,
      data: caseItem.documents
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
  createCase,
  getCases,
  getCase,
  updateCase,
  deleteCase,
  addDocument
};