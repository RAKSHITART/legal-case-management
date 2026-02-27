const User = require("../models/User");

/* ================= GET PROFILE ================= */

exports.getProfile = async (req, res) => {

    const user =
        await User.findById(req.user.id)
            .select("-password");

    res.json(user);

};

/* ================= UPDATE PROFILE ================= */

exports.updateProfile =
    async (req, res) => {

        const user =
            await User.findById(req.user.id);

        if (!user)
            return res.status(404)
                .json({ message: "User not found" });

        user.name =
            req.body.name || user.name;

        user.phone =
            req.body.phone || user.phone;

        user.officeAddress =
            req.body.officeAddress
            || user.officeAddress;

        user.lawyerType =
            req.body.lawyerType
            || user.lawyerType;

        user.experience =
            req.body.experience
            || user.experience;

        const updated =
            await user.save();

        res.json(updated);

    };