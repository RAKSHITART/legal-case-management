const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case'
    },
    documentName: String,
    status: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Approved'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);