const SocialFriend = require("../models/social-friend.model");
const {formResponse} = require("../helpers/response");
const httpStatusCodes = require("../constants/http-status-codes");
const {handleError} = require("../helpers/error");
const {createLog} = require("../helpers/logger");
const mongoose = require("mongoose");

const modelName = "social-friend";

exports.create = async (req, res, next)=> {
    const methodName = "create";
    createLog(methodName, modelName);
    try {
        const data = req.body;
        if (!data._id) {
            data._id = new mongoose.mongo.ObjectId();
        }

        let result = await SocialFriend.create(data);
        if (result) {
            res.status(httpStatusCodes[201].code)
            .json(formResponse(httpStatusCodes[201].code, result));
            return;
        } else {
            res.status(httpStatusCodes[202].code)
            .json(formResponse(httpStatusCode[202], {}));
        }
    } catch (err) {
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
        .json(formResponse(httpStatusCodes[500].code, {}));
    }
}

exports.getAll = async (req, res, next)=> {
    const methodName = "get all";
    createLog(methodName, modelName);
    try {
        let results= await SocialFriend.find().lean();
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

exports.getById = async (req,res, next)=> {
    const methodName = "get by ID";
    createLog(methodName, modelName);
    try {
        let result = await SocialFriend.findById(req.params.id).lean();
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

exports.update = async (req, res, next)=> {
    const methodName = "update";
    createLog(methodName, modelName);
    try {
        const data = req.body;

        let result = await SocialFriend.findByIdAndUpdate(req.params.id, data, {new: true});
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

exports.delete = async (req, res, next)=> {
    const methodName = "delete";
    createLog(methodName, modelName);
    try {
        let result = await SocialFriend.findByIdAndDelete(req.params.id);
        if (result) {
            res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code, {}));
            return;
        } else {
            res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, {}));
        }
    } catch(err) {
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
        .json(formResponse(httpStatusCodes[500].code, {}));
    }
}
