const Case = require("../models/Case");
const Task = require("../models/Task");
exports.summarizeText = (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Text required" });
  }

  const summary = text.split(".").slice(0, 2).join(".") + ".";

  res.json({ summary });
};

exports.predictComplexity = async (req, res) => {
  try {
    const { caseId } = req.params;

    const caseData = await Case.findById(caseId);
    const tasks = await Task.find({ caseId });

    let score = 0;

    if (caseData.caseType === "Criminal") score += 3;
    if (caseData.caseType === "Civil") score += 2;

    if (tasks.length > 5) score += 3;
    else if (tasks.length > 2) score += 2;
    else score += 1;

    let complexity = "Low";
    if (score >= 5) complexity = "High";
    else if (score >= 3) complexity = "Medium";

    res.json({
      caseTitle: caseData.title,
      totalTasks: tasks.length,
      predictedComplexity: complexity
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};