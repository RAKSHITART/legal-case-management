const mongoose = require('mongoose');

const deadlineSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },
  title: String,
  deadlineDate: Date
}, { timestamps: true });

module.exports = mongoose.model('Deadline', deadlineSchema);