const Case = require('../models/Case');
const PDFDocument = require('pdfkit');

// @desc    Generate PDF case summary
// @route   GET /api/cases/:id/download
// @access  Private
const downloadCasePDF = async (req, res) => {
    try {
        const caseId = req.params.id;
        const userId = req.user.id;

        // Find the case with populated client data
        const caseData = await Case.findOne({
            _id: caseId,
            user: userId
        }).populate('client', 'name email phoneNumber address profession');

        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: 'Case not found'
            });
        }

        // Create a PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            info: {
                Title: `Case Summary - ${caseData.caseNumber}`,
                Author: req.user.name || 'Legal Case Management System',
                Subject: 'Legal Case Summary'
            }
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=case-${caseData.caseNumber}.pdf`);

        // Pipe the PDF to the response
        doc.pipe(res);

        // Add header
        doc.fontSize(20)
            .font('Helvetica-Bold')
            .text('LEGAL CASE MANAGEMENT SYSTEM', { align: 'center' })
            .moveDown(0.5);

        doc.fontSize(16)
            .text('CASE SUMMARY REPORT', { align: 'center' })
            .moveDown(1);

        // Add horizontal line
        doc.strokeColor('#2563eb')
            .lineWidth(2)
            .moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke()
            .moveDown(1);

        // Case Information
        doc.fontSize(14)
            .font('Helvetica-Bold')
            .fillColor('#2563eb')
            .text('CASE INFORMATION', { underline: true })
            .fillColor('#000000')
            .fontSize(12)
            .font('Helvetica')
            .moveDown(0.5);

        const startY = doc.y;

        // Left column labels
        doc.font('Helvetica-Bold')
            .text('Case Number:', 50, startY)
            .text('Title:', 50, startY + 20)
            .text('Practice Area:', 50, startY + 40)
            .text('Priority:', 50, startY + 60)
            .text('Status:', 50, startY + 80)
            .text('Outcome:', 50, startY + 100);

        // Right column values
        doc.font('Helvetica')
            .text(caseData.caseNumber || 'N/A', 200, startY)
            .text(caseData.title || 'N/A', 200, startY + 20)
            .text(caseData.practiceArea || 'N/A', 200, startY + 40)
            .text(caseData.priority || 'N/A', 200, startY + 60)
            .text(caseData.status || 'N/A', 200, startY + 80)
            .text(caseData.outcome || 'N/A', 200, startY + 100);

        doc.moveDown(8);

        // Client Information
        doc.fontSize(14)
            .font('Helvetica-Bold')
            .fillColor('#2563eb')
            .text('CLIENT INFORMATION', { underline: true })
            .fillColor('#000000')
            .fontSize(12)
            .font('Helvetica')
            .moveDown(0.5);

        const clientStartY = doc.y;

        doc.font('Helvetica-Bold')
            .text('Name:', 50, clientStartY)
            .text('Email:', 50, clientStartY + 20)
            .text('Phone:', 50, clientStartY + 40)
            .text('Profession:', 50, clientStartY + 60);

        if (caseData.client) {
            doc.font('Helvetica')
                .text(caseData.client.name || 'N/A', 200, clientStartY)
                .text(caseData.client.email || 'N/A', 200, clientStartY + 20)
                .text(caseData.client.phoneNumber || 'N/A', 200, clientStartY + 40)
                .text(caseData.client.profession || 'N/A', 200, clientStartY + 60);
        } else {
            doc.font('Helvetica')
                .text('No client information', 200, clientStartY);
        }

        doc.moveDown(6);

        // Hearing Information
        doc.fontSize(14)
            .font('Helvetica-Bold')
            .fillColor('#2563eb')
            .text('HEARING INFORMATION', { underline: true })
            .fillColor('#000000')
            .fontSize(12)
            .font('Helvetica')
            .moveDown(0.5);

        const hearingStartY = doc.y;

        doc.font('Helvetica-Bold')
            .text('Hearing Date:', 50, hearingStartY)
            .text('Hearing Time:', 50, hearingStartY + 20)
            .text('Court Location:', 50, hearingStartY + 40)
            .text('Judge:', 50, hearingStartY + 60);

        doc.font('Helvetica')
            .text(caseData.hearingDate ? new Date(caseData.hearingDate).toLocaleDateString() : 'N/A', 200, hearingStartY)
            .text(caseData.hearingTime || 'N/A', 200, hearingStartY + 20)
            .text(caseData.courtLocation || 'N/A', 200, hearingStartY + 40)
            .text(caseData.judge || 'Not assigned', 200, hearingStartY + 60);

        doc.moveDown(6);

        // Description
        if (caseData.description) {
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .fillColor('#2563eb')
                .text('CASE DESCRIPTION', { underline: true })
                .fillColor('#000000')
                .fontSize(12)
                .font('Helvetica')
                .moveDown(0.5);

            doc.text(caseData.description, 50, doc.y, {
                width: 500,
                align: 'left'
            });
            doc.moveDown(2);
        }

        // Additional parties
        if (caseData.opposingParty || caseData.opposingCounsel) {
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .fillColor('#2563eb')
                .text('ADDITIONAL PARTIES', { underline: true })
                .fillColor('#000000')
                .fontSize(12)
                .font('Helvetica')
                .moveDown(0.5);

            if (caseData.opposingParty) {
                doc.font('Helvetica-Bold')
                    .text('Opposing Party:', 50, doc.y)
                    .font('Helvetica')
                    .text(caseData.opposingParty, 200, doc.y - 12);
                doc.moveDown(1);
            }

            if (caseData.opposingCounsel) {
                doc.font('Helvetica-Bold')
                    .text('Opposing Counsel:', 50, doc.y)
                    .font('Helvetica')
                    .text(caseData.opposingCounsel, 200, doc.y - 12);
                doc.moveDown(1);
            }
        }

        // Footer
        doc.moveDown(3);
        doc.fontSize(10)
            .font('Helvetica-Oblique')
            .fillColor('#666666')
            .text(`Report generated on: ${new Date().toLocaleString()}`, {
                align: 'center'
            });

        doc.fontSize(8)
            .fillColor('#999999')
            .text('This is a computer generated document', {
                align: 'center'
            });

        // Finalize the PDF
        doc.end();

    } catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate PDF',
            error: error.message
        });
    }
};

module.exports = {
    downloadCasePDF
};