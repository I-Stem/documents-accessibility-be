 const UserGroup = require("../../models/user-group.model");
const { formResponse } = require("../../helpers/response");
const httpStatusCodes = require("../../constants/http-status-codes");
const { handleError } = require("../../helpers/error");
const { createLog } = require("../../helpers/logger");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const modelName = "user-group";

exports.create = async (req, res, next) => {
    const methodName = "create";
    createLog(methodName, modelName);
    try {
        const data = req.body;
        if (!data._id) {
            data._id = new mongoose.mongo.ObjectId();
        }

        let result = await UserGroup.create(data);
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

exports.getAll = async (req, res, next) => {
    const methodName = "get all";
    createLog(methodName, modelName);
    try {
        let results = await UserGroup.find().lean();
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
        let result = await UserGroup.find({ user: new mongoose.Types.ObjectId(req.params.id) }).lean();
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
        const data = mongoose.Types.ObjectId(req.body.data);
        let result;
        if (req.body.isApproved) {
            result = await UserGroup.findOneAndUpdate(req.params.id,
                { $push: { approved: data } },
                { new: true, upsert: true });
        }
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
        let result = await UserGroup.findByIdAndDelete(req.params.id);
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

exports.filter = async (req, res, next) => {
    const methodName = "filter by ";
    createLog(methodName, modelName);
    try {
        const ob = req.body;
        let param = {};
        if (ob.isObject == true) {
            delete ob.isObject;
            for (const [key, value] of Object.entries(ob)) {
                param[key] = new ObjectId(value);
            }
        } else {
            param = ob;
        }

        let results = await UserGroup.find(param);
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
