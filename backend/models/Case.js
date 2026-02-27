const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  caseNumber: {
    type: String,
    required: [true, 'Please add case number'],
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Please add case title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add case description']
  },
  practiceArea: {
    type: String,
    required: [true, 'Please add practice area'],
    enum: ['Corporate', 'Criminal', 'Civil', 'Family', 'Property', 'Intellectual Property', 'Tax', 'Other']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Emergency'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'Progress', 'Closed'],
    default: 'Open'
  },
  outcome: {
    type: String,
    enum: ['Lost', 'Won', 'In Progress', 'Settled', 'Dismissed'],
    default: 'In Progress'
  },
  filedDate: {
    type: Date,
    required: [true, 'Please add filed date'],
    default: Date.now
  },
  filedTime: {
    type: String,
    required: [true, 'Please add filed time']
  },
  hearingDate: {
    type: Date,
    required: [true, 'Please add hearing date']
  },
  hearingTime: {
    type: String,
    required: [true, 'Please add hearing time']
  },
  courtLocation: {
    type: String,
    required: [true, 'Please add court location']
  },
  judge: String,
  opposingParty: String,
  opposingCounsel: String,
  // New field for case file
  caseFile: {
    filename: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  documents: [{
    name: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search
caseSchema.index({ caseNumber: 'text', title: 'text', description: 'text' });

module.exports = mongoose.model('Case', caseSchema);