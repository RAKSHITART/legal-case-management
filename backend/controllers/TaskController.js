const Task = require('../models/Task');
const Case = require('../models/Case');

// 🔹 CREATE TASK
exports.createTask = async (req, res) => {
    try {
        const task = await Task.create(req.body);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔹 GET ALL TASKS (with case details)
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('caseId');
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔹 UPDATE TASK (Smart Logic Included)
exports.updateTask = async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        // 🔥 SMART BUSINESS LOGIC
        // Check if all tasks of this case are completed
        const tasks = await Task.find({ caseId: updatedTask.caseId });

        const allCompleted = tasks.every(task => task.completed === true);

        if (allCompleted) {
            await Case.findByIdAndUpdate(updatedTask.caseId, {
                status: "Closed"
            });
        } else {
            await Case.findByIdAndUpdate(updatedTask.caseId, {
                status: "Open"
            });
        }

        res.status(200).json(updatedTask);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔹 DELETE TASK
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({ message: "Task deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};