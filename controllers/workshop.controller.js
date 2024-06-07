const Workshop = require("../models/workshop.model");
const {formResponse} = require("../helpers/response");
const httpStatusCodes = require("../constants/http-status-codes");
const {handleError} = require("../helpers/error");
const {createLog} = require("../helpers/logger");

const modelName = "workshops";

exports.create = async (req, res, next)=> {
    const methodName = "create";
    createLog(methodName, modelName);
    try {        
        const newPDF = await Workshop.create(req.body);
        console.log(newPDF);
        res.status(httpStatusCodes[201].code)
        .json(formResponse(httpStatusCodes[201].code, newPDF));
    } catch (error) {
        res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code,'An error occurred while creating the PDF entry.'))
    }
}

exports.getById = async (req, res) => {
    try {
        const methodName = "getById";
        createLog(methodName, modelName);
        const workshopId = req.params.id;       
        const workshop = await Workshop.findById(workshopId);       
        if (!workshop) {         
            return res.status(httpStatusCodes[404].code).json(formResponse(httpStatusCodes[404].code, 'Workshop not found'));
        }
        res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, workshop));
    } catch (error) {
        res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, 'An error occurred while fetching the workshop'));
    }
}

exports.getAll = async (req, res, next)=> {
    const methodName = "get all";
    createLog(methodName, modelName);
    try {
        let results= await Workshop.find().lean();
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