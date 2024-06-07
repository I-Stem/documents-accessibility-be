const Theme = require("../models/theme.model");
const {formResponse} = require("../helpers/response");
const httpStatusCodes = require("../constants/http-status-codes");
const {handleError} = require("../helpers/error");
const {createLog} = require("../helpers/logger");

const modelName = "theme";

exports.create = async (req, res, next)=> {
    const methodName = "create";
    createLog(methodName, modelName);
    try {
        const name = req.body.name.toLowerCase();
        const data = {
            name
        };

        let result = await Theme.create(data);
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
        let results= await Theme.find().lean();
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
        let result = await Theme.findById(req.params.id).lean();
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
        const {name} = req.body;
        const data = {
            name: name.toLowerCase()
        };

        let result = await Theme.findByIdAndUpdate(req.params.id, data, {new: true});
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
        let result = await Theme.findByIdAndDelete(req.params.id);
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
