const Notification = require('../models/Notification');
const Case = require('../models/Case');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({ user: req.user.id })
      .populate('relatedCase', 'caseNumber title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });

    const total = await Notification.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
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

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
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

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
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

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
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

// @desc    Create notification for upcoming hearings
// @route   POST /api/notifications/check-hearings
// @access  Private (Internal use)
const checkUpcomingHearings = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcomingHearings = await Case.find({
      hearingDate: { $gte: today, $lte: nextWeek },
      status: { $ne: 'Closed' }
    }).populate('user');

    for (const caseItem of upcomingHearings) {
      const daysUntil = Math.ceil((caseItem.hearingDate - today) / (1000 * 60 * 60 * 24));
      
      // Check if notification already exists
      const existingNotification = await Notification.findOne({
        user: caseItem.user._id,
        relatedCase: caseItem._id,
        type: 'hearing',
        title: 'Upcoming Hearing Reminder'
      });

      if (!existingNotification) {
        await Notification.create({
          user: caseItem.user._id,
          type: 'hearing',
          title: 'Upcoming Hearing Reminder',
          message: `Hearing for case ${caseItem.caseNumber} is in ${daysUntil} days`,
          relatedCase: caseItem._id,
          scheduledFor: caseItem.hearingDate,
          priority: daysUntil <= 2 ? 'High' : 'Medium'
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Hearing reminders checked'
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
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  checkUpcomingHearings
};