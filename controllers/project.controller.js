const Project = require("../models/project.model");
const User = require("../models/user.model");
const SocialGroup = require("../models/social-group.model");
const { formResponse } = require("../helpers/response");
const httpStatusCodes = require("../constants/http-status-codes");
const { handleError } = require("../helpers/error");
const { createLog } = require("../helpers/logger");
const mongoose = require("mongoose");
const jwtHelper = require('../helpers/jwt');

const modelName = "project";
const conn = require("../config/db/mongo");

exports.create = async (req, res, next) => {
    const methodName = "create";
    createLog(methodName, modelName);
    const session = await conn.startSession();
    try {
        const transactionResults = await session.withTransaction(async () => {
            const data = req.body;
            console.log(httpStatusCodes[200].code)
            if (!data._id) {
                data._id = new mongoose.mongo.ObjectId();
            }
            const result = await Project.create(data);
            if(!result) {
                await session.abortTransaction();
                // res.status(httpStatusCodes[400].code)
                //     .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
                return;
            }

            let userId = result.members.approved[0]._id.toString();
            let projectId = result._id.toString();
            let groupId = result.group._id.toString();

            const result2 = await _insertOrRemoveProjectFromGroup(res, projectId, groupId, 1);
            if(!result2) {
                await session.abortTransaction();
                // res.status(httpStatusCodes[400].code)
                //     .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
                return;
            }
            
            const result3 = await _insertOrRemoveProjectMember(res, projectId, userId, 1);
            if(!result3) {
                await session.abortTransaction();
                // res.status(httpStatusCodes[400].code)
                //     .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
                return;
            }
            // if (result) {
            //     res.status(httpStatusCodes[201].code)
            //         .json(formResponse(httpStatusCodes[201].code, result));
            //     return;
            // } else {
            //     res.status(httpStatusCodes[202].code)
            //         .json(formResponse(httpStatusCodes[202], {}));
            // }
        });
        console.log(transactionResults)
        if (transactionResults) {
            console.log("The reservation was successfully created.");
            res.status(httpStatusCodes[201].code)
                .json(formResponse(httpStatusCodes[201].code, result));
        } else {
            console.log("The transaction was intentionally aborted.");
            res.status(httpStatusCodes[202].code)
                .json(formResponse(httpStatusCodes[202].code, {}));
        }
    } catch (err) {
        // await session.abortTransaction();
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
        let results = await Project.find().lean();
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
    const methodName = "get by ID";
    createLog(methodName, modelName);
    try {
        let result = await Project.findById(req.params.id).lean();
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
        const { name, details } = req.body;

        const data = {
            name: name.toLowerCase(),
            details: details
        };

        let result = await Project.findByIdAndUpdate(req.params.id, data, { new: true });
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
        let result = await Project.findByIdAndDelete(req.params.id);
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

exports.addOrRemoveProjectMember = async (req, res, next) => {
    const methodName = "add or remove project member";
    createLog(methodName, modelName);

    const session = await conn.startSession();
    session.startTransaction();       
    try {
        let auth = req.headers['authorization'];
        let userData = jwtHelper.decodeJWT(auth);
        const userId = userData.sub;
        // const userId = req.params.userId;
        const projectId = req.params.projectId;

        result = await _insertOrRemoveProjectMember(res, projectId, userId, req.params.add);
        if(!result) {
            await session.abortTransaction();
            res.status(httpStatusCodes[400].code)
                .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
            return;
        }
        return result;

        console.log(userId, projectId, req.params.add);
        if (parseInt(req.params.add)) {
            let result = await Project.findByIdAndUpdate(projectId, { $addToSet: { "members.approved": userId } }, { new: true });
            if (!result) throw new Error("could not update project");
            let result1 = await User.findByIdAndUpdate(userId, { $addToSet: { "projects.approved": projectId } }, { new: true });
            if (!result1) throw new Error("could not update user");

            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, {}));
        } else {
            console.log('reached')
            let result = await Project.findByIdAndUpdate(projectId, { $pull: { "members.approved": userId } }, { new: true });
            if (!result) throw new Error("could not update project");
            let result1 = await User.findByIdAndUpdate(userId, { $pull: { "projects.approved": projectId } }, { new: true });
            if (!result1) throw new Error("could not update user");

            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, {}));

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

exports.getProjectsByUser = async (req, res, next) => {
    const methodName = "get projects by user";
    createLog(methodName, modelName);
     
    const group = req.params.group === '1' ? null : req.params.group; 
    const skipSelf = req.params.skipSelf;  
    const filter = JSON.parse(req.params.filter); 
    let result;
    try {
        if (!parseInt(skipSelf)) {
            if (group) {
                result = await Project.find({ group, _id: { $in: filter } }).lean();
            } else {
                result = await Project.find({ _id: { $in: filter } }).lean();
            }
        } else {
            if (group) {
                result = await Project.find({ group, _id: { $nin: filter } }).lean();
            } else {
                result = await Project.find({ _id: { $nin: filter } }).lean();
            }
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


async function _insertOrRemoveProjectMember(res, projectId, userId, add) {
    if (parseInt(add)) {
        let result = await Project.findByIdAndUpdate(projectId, { $addToSet: { "members.approved": userId } }, { new: true });
        if (!result) {
            throw new Error("could not update project member");
        }
        let result1 = await User.findByIdAndUpdate(userId, { $addToSet: { "projects.approved": projectId } }, { new: true });
        if (!result1) {
            throw new Error("could not update user projects");
        }

        // res.status(httpStatusCodes[200].code)
        //     .json(formResponse(httpStatusCodes[200].code, {}));
    } else {
        let result = await Project.findByIdAndUpdate(projectId, { $pull: { "members.approved": userId } }, { new: true });
        if (!result) {
            throw new Error("could not remove project member");
        }
        let result1 = await User.findByIdAndUpdate(userId, { $pull: { "projects.approved": projectId } }, { new: true });
        if (!result1) {
            throw new Error("could not remove user project");
        }
        // res.status(httpStatusCodes[200].code)
        //     .json(formResponse(httpStatusCodes[200].code, {}));
    }
}

async function _insertOrRemoveProjectFromGroup(res, projectId, groupId, add) {
    if (parseInt(add)) {
        console.log(groupId)
        console.log(projectId)
        let result = await SocialGroup.findByIdAndUpdate(groupId, { $addToSet: { "projects.approved": projectId } }, { new: true });
        if (!result) {
            // throw new Error("could not update project member");
            // res.status(httpStatusCodes[400].code)
            //     .json(formResponse(httpStatusCodes[400].code, "could not update project member"));
            return 0;
        }
        // res.status(httpStatusCodes[200].code)
        //     .json(formResponse(httpStatusCodes[200].code, {}));
        return 1;
    } else {
        let result = await SocialGroup.findByIdAndUpdate(groupId, { $pull: { "projects.approved": projectId } }, { new: true });
        if (!result) {
            // throw new Error("could not remove project member");
            // res.status(httpStatusCodes[400].code)
            //     .json(formResponse(httpStatusCodes[400].code, "could not remove project member"));
            return 0;
        }
        // res.status(httpStatusCodes[200].code)
        //     .json(formResponse(httpStatusCodes[200].code, {}));
        return 1;
    }
}
