const Case = require("../models/Case");

exports.getAnalytics = async (req, res) => {

    try {

        /* COUNTS */

        const totalCases =
            await Case.countDocuments();

        const activeCases =
            await Case.countDocuments({
                status: { $ne: "Closed" }
            });

        const closedCases =
            await Case.countDocuments({
                status: "Closed"
            });

        const completion =
            totalCases === 0
                ? 0 :
                ((closedCases / totalCases) * 100)
                    .toFixed(1);

        /* STATUS GRAPH */

        const statusStats =
            await Case.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ]);

        /* PRIORITY GRAPH */

        const priorityStats =
            await Case.aggregate([
                {
                    $group: {
                        _id: "$priority",
                        count: { $sum: 1 }
                    }
                }
            ]);

        /* MONTHLY TREND */

        const monthlyCases =
            await Case.aggregate([
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

        /* COURT LOAD */

        const courtStats =
            await Case.aggregate([
                {
                    $group: {
                        _id: "$courtLocation",
                        count: { $sum: 1 }
                    }
                }
            ]);

        /* RESULT */

        const resultStats =
            await Case.aggregate([
                {
                    $group: {
                        _id: "$result",
                        count: { $sum: 1 }
                    }
                }
            ]);

        res.json({

            totalCases,
            activeCases,
            closedCases,
            completion,
            statusStats,
            priorityStats,
            monthlyCases,
            courtStats,
            resultStats

        });

    } catch (err) {

        res.status(500)
            .json({ message: "Analytics failed" });

    }

};