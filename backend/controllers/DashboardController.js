const mongoose = require('mongoose');
const Case = require('../models/Case');
const Client = require('../models/Client');
const Notification = require('../models/Notification');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Convert string ID to MongoDB ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);

    // Get total cases
    const totalCases = await Case.countDocuments({ user: objectId });

    // Get active cases (Open + Progress) - THESE ARE YOUR "PENDING TASKS"
    const activeCases = await Case.countDocuments({
      user: objectId,
      status: { $in: ['Open', 'Progress'] }
    });

    // Get closed cases
    const closedCases = await Case.countDocuments({
      user: objectId,
      status: 'Closed'
    });

    // Calculate completion percentage
    const completionPercentage = totalCases > 0
      ? Math.round((closedCases / totalCases) * 100)
      : 0;

    // Get cases by priority
    const priorityData = await Case.aggregate([
      { $match: { user: objectId } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format for pie chart - ensure all priority levels exist with default 0
    const priorityMap = {
      'Low': 0,
      'Medium': 0,
      'High': 0,
      'Emergency': 0
    };

    priorityData.forEach(item => {
      if (item._id && priorityMap.hasOwnProperty(item._id)) {
        priorityMap[item._id] = item.count;
      }
    });

    const casesByPriority = Object.entries(priorityMap).map(([name, value]) => ({
      name,
      value
    }));

    // Get cases by status
    const statusData = await Case.aggregate([
      { $match: { user: objectId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format for pie chart - ensure all status levels exist
    const statusMap = {
      'Open': 0,
      'Progress': 0,
      'Closed': 0
    };

    statusData.forEach(item => {
      if (item._id && statusMap.hasOwnProperty(item._id)) {
        statusMap[item._id] = item.count;
      }
    });

    const casesByStatus = Object.entries(statusMap).map(([name, value]) => ({
      name,
      value
    }));

    // Get cases by outcome
    const outcomeData = await Case.aggregate([
      { $match: { user: objectId } },
      {
        $group: {
          _id: '$outcome',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format for pie chart - ensure all outcome levels exist
    const outcomeMap = {
      'Won': 0,
      'Lost': 0,
      'In Progress': 0,
      'Settled': 0,
      'Dismissed': 0
    };

    outcomeData.forEach(item => {
      if (item._id && outcomeMap.hasOwnProperty(item._id)) {
        outcomeMap[item._id] = item.count;
      }
    });

    const casesByOutcome = Object.entries(outcomeMap).map(([name, value]) => ({
      name,
      value
    }));

    // Get cases by practice area
    const practiceAreaData = await Case.aggregate([
      { $match: { user: objectId } },
      {
        $group: {
          _id: '$practiceArea',
          count: { $sum: 1 }
        }
      }
    ]);

    let casesByPracticeArea = practiceAreaData.map(item => ({
      name: item._id || 'Other',
      value: item.count
    }));

    // If no practice areas, show empty array
    if (casesByPracticeArea.length === 0) {
      casesByPracticeArea = [];
    }

    // Get upcoming hearings (next 30 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);
    nextMonth.setHours(23, 59, 59, 999);

    const upcomingHearings = await Case.find({
      user: objectId,
      hearingDate: { $gte: today, $lte: nextMonth },
      status: { $ne: 'Closed' }
    })
      .populate('client', 'name email phoneNumber')
      .sort({ hearingDate: 1 })
      .limit(10);

    // Get recent cases
    const recentCases = await Case.find({ user: objectId })
      .populate('client', 'name email phoneNumber')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get unread notifications
    const unreadNotifications = await Notification.countDocuments({
      user: objectId,
      isRead: false
    });

    // Prepare response data - NOW pendingTasks = activeCases
    const responseData = {
      overview: {
        totalCases: totalCases || 0,
        activeCases: activeCases || 0,
        closedCases: closedCases || 0,
        completionPercentage: completionPercentage || 0,
        pendingTasks: activeCases || 0, // CHANGED: Now shows active cases count
        unreadNotifications: unreadNotifications || 0
      },
      charts: {
        casesByPriority: casesByPriority,
        casesByStatus: casesByStatus,
        casesByOutcome: casesByOutcome,
        casesByPracticeArea: casesByPracticeArea
      },
      upcomingHearings: upcomingHearings || [],
      recentCases: recentCases || []
    };

    // Log for debugging
    console.log('Dashboard Stats Response:', {
      totalCases: responseData.overview.totalCases,
      activeCases: responseData.overview.activeCases,
      pendingTasks: responseData.overview.pendingTasks,
      closedCases: responseData.overview.closedCases
    });

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get calendar events
// @route   GET /api/dashboard/calendar
// @access  Private
const getCalendarEvents = async (req, res) => {
  try {
    const { start, end } = req.query;
    const userId = req.user.id;
    const objectId = new mongoose.Types.ObjectId(userId);

    let query = { user: objectId };

    if (start && end) {
      query.hearingDate = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }

    const cases = await Case.find(query)
      .populate('client', 'name')
      .select('caseNumber title client hearingDate hearingTime courtLocation');

    const events = cases.map(caseItem => ({
      id: caseItem._id,
      title: `${caseItem.caseNumber} - ${caseItem.title}`,
      start: caseItem.hearingDate,
      time: caseItem.hearingTime,
      client: caseItem.client?.name,
      location: caseItem.courtLocation,
      extendedProps: {
        caseId: caseItem._id,
        caseNumber: caseItem.caseNumber
      }
    }));

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Calendar Events Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getCalendarEvents
};