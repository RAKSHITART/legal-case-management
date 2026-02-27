const PDFDocument = require("pdfkit");
const Case = require("../models/Case");

exports.downloadCaseReport = async (req,res)=>{

try{

const caseData =
await Case.findById(req.params.id)
.populate("client");

if(!caseData)
return res.status(404)
.json({message:"Case not found"});

/* PDF */

const doc = new PDFDocument();

res.setHeader(
"Content-Type",
"application/pdf"
);

res.setHeader(
"Content-Disposition",
`attachment; filename=case-${caseData.caseNumber}.pdf`
);

doc.pipe(res);

/* TITLE */

doc.fontSize(20)
.text("LEGAL CASE REPORT",
{align:"center"});

doc.moveDown();

/* CASE DETAILS */

doc.fontSize(14)
.text(`Case Number: ${caseData.caseNumber}`);

doc.text(`Title: ${caseData.title}`);

doc.text(`Description: ${caseData.description}`);

doc.text(
`Court Location: ${caseData.courtLocation}`
);

doc.text(
`Priority: ${caseData.priority}`
);

doc.text(
`Status: ${caseData.status}`
);

doc.text(
`Result: ${caseData.result}`
);

doc.moveDown();

/* CLIENT */

doc.fontSize(16)
.text("Client Details");

doc.fontSize(12)
.text(`Name: ${caseData.client.name}`);

doc.text(`Email: ${caseData.client.email}`);

doc.text(`Phone: ${caseData.client.phone}`);

doc.text(`Address: ${caseData.client.address}`);

doc.moveDown();

/* DATES */

doc.text(
`Filing Date:
${caseData.filingDate}`
);

doc.text(
`Hearing Date:
${caseData.hearingDate}`
);

doc.end();

}catch(err){

console.log(err);
res.status(500)
.json({message:"PDF failed"});

}

};