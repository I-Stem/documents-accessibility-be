const SocialGroup = require("../../models/social-group.model");
const User = require("../../models/user.model");
const { formResponse } = require("../../helpers/response");
const httpStatusCodes = require("../../constants/http-status-codes");
const { handleError } = require("../../helpers/error");
const { createLog } = require("../../helpers/logger");
const mongoose = require("mongoose");
const jwtHelper = require('../../helpers/jwt');
const modelName = "social-group";
const conn = require("../../config/db/mongo");

exports.create = async (req, res, next) => {
    const methodName = "create";
    createLog(methodName, modelName);
    const session = await conn.startSession();
    session.startTransaction();
    try {
        const data = req.body;
        if (!data._id) {
            data._id = new mongoose.mongo.ObjectId();
        }
        let result = await SocialGroup.create(data);
        if (!result) {
            await session.abortTransaction();
            res.status(httpStatusCodes[400].code)
                .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
            return;
        }
        // console.log(result);
        let userId = result.members.approved[0]._id.toString();
        let groupId = result._id.toString();
        let groupResult = await _insertOrRemoveGroupMember(res, groupId, userId, 1, session);
        if (!groupResult) {
            await session.abortTransaction();
            res.status(httpStatusCodes[400].code)
                .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
            return;
        }
        return groupResult;
        if (result) {
            res.status(httpStatusCodes[201].code)
                .json(formResponse(httpStatusCodes[201].code, result));
            return;
        } else {
            res.status(httpStatusCodes[202].code)
                .json(formResponse(httpStatusCode[202], {}));
        }
    } catch (err) {
        await session.abortTransaction();
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, {}));
    } finally {
        await session.endSession();
        res.end();
    }
}

exports.getAll = async (req, res, next) => {
    const methodName = "get all";
    createLog(methodName, modelName);
    try {
        let results = await SocialGroup.find({
            $or: [{ isUnConnectGroup: false }, { isUnConnectGroup: { $exists: false } }]
          }).lean();
        if (results) {
            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, results));
            return;
        } else {
            res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, {}));
        }
    } catch (err) {
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, {}));
    }
}

exports.getById = async (req, res, next) => {
    console.log('getting by id');
    const methodName = "get by ID";
    createLog(methodName, modelName);
    try {
        let result = await SocialGroup.findById(req.params.id).lean();
        if (result) {
            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, result));
            return;
        } else {
            res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, {}));
        }
    } catch (err) {
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, {}));
    }
}

exports.update = async (req, res, next) => {
    const methodName = "update";
    createLog(methodName, modelName);
    try {
        const data = req.body;

        let result = await SocialGroup.findByIdAndUpdate(req.params.id, data, { new: true });
        if (result) {
            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, result));
            return;
        } else {
            res.status(httpStatusCodes[202].code)
                .json(formResponse(httpStatusCodes[202].code, {}));
        }
    } catch (err) {
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, {}));
    }
}

exports.delete = async (req, res, next) => {
    const methodName = "delete";
    createLog(methodName, modelName);
    try {
        let result = await SocialGroup.findByIdAndDelete(req.params.id);
        if (result) {
            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, {}));
            return;
        } else {
            res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, {}));
        }
    } catch (err) {
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, {}));
    }
}

exports.getSocialGroupsByUser = async (req, res, next) => {
    const methodName = "get social groups by user";
    createLog(methodName, modelName);
    const filter = JSON.parse(req.params.filter);
    const skipSelf = req.params.skipSelf;
    let result;
    try {
        if (!parseInt(skipSelf)) {
            result = await SocialGroup.find({ $and: [{ _id: { $in: filter } }, { $or: [{ isUnConnectGroup: false }, { isUnConnectGroup: { $exists: false } }] }] }).lean();
        } else {
            result = await SocialGroup.find({ $and: [{ _id: { $nin: filter } }, {$or: [{ isUnConnectGroup: false }, { isUnConnectGroup: { $exists: false } }] }] }).lean();
        }
        if (result) {
            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, result));
            return;
        } else {
            res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, {}));
        }
    } catch (err) {
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, {}));
    }
}

exports.addOrRemoveGroupMember = async (req, res, next) => {
    const methodName = "add or remove group member";
    createLog(methodName, modelName);

    const session = await conn.startSession();
    session.startTransaction();
    try {
        let auth = req.headers['authorization'];
        let userData = jwtHelper.decodeJWT(auth);
        const userId = userData.sub;
        const groupId = req.params.groupId;
        result = await _insertOrRemoveGroupMember(res, groupId, userId, req.params.add, session);
        if (!result) {
            await session.abortTransaction();
            res.status(httpStatusCodes[400].code)
                .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
            return;
        }
    } catch (err) {
        //rollback transaction
        await session.abortTransaction();
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, {}));
    } finally {
        await session.endSession();
        res.end();
    }
}


async function _insertOrRemoveGroupMember(res, groupId, userId, add, session) {
    if (parseInt(add)) {
        let result = await SocialGroup.findByIdAndUpdate(groupId, { $addToSet: { "members.approved": userId } }, { new: true });
        if (!result) {
            console.log("here", result)
            // throw new Error("could not update group member");
            // await session.abortTransaction();
            // res.status(httpStatusCodes[400].code)
            //     .json(formResponse(httpStatusCodes[400].code, "could not update group member"));
            return false;
        }
        let result1 = await User.findByIdAndUpdate(userId, { $addToSet: { "groups.approved": groupId } }, { new: true });
        if (!result1) {
            console.log("here1", result1)
            // throw new Error("could not update user");
            // await session.abortTransaction();
            // res.status(httpStatusCodes[400].code)
            //     .json(formResponse(httpStatusCodes[400].code, "could not update user"));
            return false;
        }
        
        // removing user object from pending array
        let result2 = await SocialGroup.findByIdAndUpdate(groupId, { $pull: { "members.pending": { user: userId } } }, { new: true });
        if (!result2) {
            // await session.abortTransaction();
            // res.status(httpStatusCodes[400].code)
            //     .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
            // return;
            throw(new Error())
        }

        res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code, {}));
    } else {
        let result = await SocialGroup.findByIdAndUpdate(groupId, { $pull: { "members.approved": userId } }, { new: true });
        if (!result) {
            // throw new Error("could not update group member");
            await session.abortTransaction();
            res.status(httpStatusCodes[400].code)
                .json(formResponse(httpStatusCodes[400].code, "could not update group member"));
            return;
        }
        let result1 = await User.findByIdAndUpdate(userId, { $pull: { "groups.approved": groupId } }, { new: true });
        if (!result1) {
            // throw new Error("could not update user");
            await session.abortTransaction();
            res.status(httpStatusCodes[400].code)
                .json(formResponse(httpStatusCodes[400].code, "could not update user"));
            return;
        }

        res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code, {}));
    }
}



exports.addPendingMember = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const { message, userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Find the social group by ID and append the pending member
        const socialGroup = await SocialGroup.findById(groupId);

        // Check if the user is already in the pending array
        const isUserPending = socialGroup.members.pending.some(
            (member) => member.user && member.user.toString() === userId
        );

        if (isUserPending) {
            return res.status(400).json({ error: "User is already pending" });
        }

        // Add the pending member to the array
        socialGroup.members.pending.push({ user: userId, message });

        // Save the updated social group
        await socialGroup.save();

        res.status(200).json({ message: "Pending member added successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred" });
    }
};


exports.getPendingMembers = async (req, res) => {
    try {
        const { groupId } = req.params;

        // Find the social group by ID and populate the pending members' user information
        const socialGroup = await SocialGroup.findById(groupId)
            .populate("members.pending.user", "first_name last_name email"); // Add additional fields as needed

        // Extract the pending members array
        const pendingMembers = socialGroup.members.pending;

        res.status(200).json({ pendingMembers });
    } catch (error) {
        res.status(500).json({ error: "An error occurred" });
    }
};

exports.removePendingMember = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Remove the pending member from the array using updateOne
        const result = await SocialGroup.updateOne(
            { _id: groupId },
            { $pull: { "members.pending": { user: userId } } },
            { multi: true }
        );

        if (result.nModified === 0) {
            return res.status(400).json({ error: "User is not pending" });
        }

        res.status(200).json({ message: "Pending member removed successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred" });
    }
};


exports.adminAddOrRemoveGroupMember = async (req, res, next) => {
    const methodName = "add or remove group member";
    createLog(methodName, modelName);

    const session = await conn.startSession();
    session.startTransaction();
    try {
        const { groupId, userId, flag } = req.body;
        result = await _insertOrRemoveGroupMember(res, groupId, userId, flag, session);
        if (!result) {
            // await session.abortTransaction();
            // res.status(httpStatusCodes[400].code)
            //     .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
            // return;
            throw(new Error())
        }
    } catch (err) {
        //rollback transaction
        await session.abortTransaction();
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, {}));
    } finally {
        await session.endSession();
        res.end();
    }
}

exports.getAllUnConnectGroups = async (req, res, next) => {
    const methodName = "get all";
    createLog(methodName, modelName);
    try {
        let results = await SocialGroup.find({isUnConnectGroup: true}).lean();
        if (results) {
            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, results));
            return;
        } else {
            res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, {}));
        }
    } catch (err) {
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, {}));
    }
}

exports.getUnConnectGroupsByUser = async (req, res, next) => {
    const methodName = "get social groups by user";
    createLog(methodName, modelName);
    const filter = JSON.parse(req.params.filter);
    const skipSelf = req.params.skipSelf;
    let result;
    try {
        if (!parseInt(skipSelf)) {
            result = await SocialGroup.find({ $and: [{ _id: { $in: filter } }, { isUnConnectGroup: true }] }).lean();
        } else {
            result = await SocialGroup.find({ $and: [{ _id: { $nin: filter } }, { isUnConnectGroup: true }] }).lean();
        }
        if (result) {
            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, result));
            return;
        } else {
            res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, {}));
        }
    } catch (err) {
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, {}));
    }
}