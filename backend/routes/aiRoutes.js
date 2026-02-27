const express = require("express");
const router = express.Router();

const {
    predictComplexity,
    summarizeText
} = require("../controllers/aiController");

/* AI ROUTES */

router.get("/complexity/:caseId", predictComplexity);

router.post("/summarize", summarizeText);

module.exports = router;