const AutotagPDF = require("../models/autotag.model");
const WhatsappAutotag = require("../models/whatsapp-autotag.model")
const { formResponse } = require("../helpers/response");
const httpStatusCodes = require("../constants/http-status-codes");
const { createLog } = require("../helpers/logger");

exports.create = async (req, res) => {
    try {        
        const newPDF = await AutotagPDF.create(req.body);
        console.log(newPDF);
        res.status(httpStatusCodes[201].code)
        .json(formResponse(httpStatusCodes[201].code, newPDF));
    } catch (error) {
        // res.status(500).json({ error: 'An error occurred while creating the PDF entry.' });
        res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code,'An error occurred while creating the PDF entry.'))
    }
}

exports.getById = async (req, res) => {
    try {
        const pdfId = req.params.id;
        
        const pdf = await AutotagPDF.findById(pdfId); 
        
        if (!pdf) {
           
            return res.status(httpStatusCodes[404].code).json(formResponse(httpStatusCodes[404].code, 'PDF not found'));
        }

        res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, pdf));
    } catch (error) {
        res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, 'An error occurred while fetching the PDF'));
    }
}


exports.update = async (req, res) => {
    const pdfId = req.params.id;
    const updatedData = req.body;
    
    createLog(pdfId, updatedData.resultFileLinkActive);
    try {
        const updatedPDF = await AutotagPDF.findByIdAndUpdate(pdfId, updatedData, { new: true });

        if (!updatedPDF) {
            return res.status(httpStatusCodes[404].code).json(formResponse(httpStatusCodes[404].code, 'PDF not found'));
        }

        res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, updatedPDF));
    } catch (error) {
        res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, 'An error occurred while updating the PDF'));
    }
}

exports.delete = async (req, res) => {
    try {
        const pdfId = req.params.id;

        const deletedPDF = await AutotagPDF.findByIdAndDelete(pdfId);

        if (!deletedPDF) {
            return res.status(httpStatusCodes[404].code).json(formResponse(httpStatusCodes[404].code, 'PDF not found'));
        }

        res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, 'PDF deleted'));
    } catch (error) {
        res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, 'An error occurred while deleting the PDF'));
    }
}


exports.getAllPDFsByUserId = async (req, res) => {
    try {
        const userId = req.params.userId; 

        const userPDFs = await AutotagPDF.find({ user: userId }).sort({createdAt: -1});
        console.log(userPDFs)
        res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, userPDFs));
    } catch (error) {
        res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, 'An error occurred while fetching PDFs by userId'));
    }
}

exports.checkIfFileProcessed = async(req, res) => {
    try {
        const userId = req.params.userId;
        const fileHash = req.params.fileHash;
        const outputFormat = req.params.outputFormat;
        const docType = req.params.docType;
        const files = await AutotagPDF.find({ user: userId, inputFileHash: fileHash})
        const matchingFiles = files.filter(file => {
            if (file.type) {
              const parts = file.type.split('.');
              if (parts.length > 1) {
                const fileExtension = parts[parts.length - 1];
                const fileDocType = parts[parts.length - 1];
                if (fileExtension.toLowerCase() === outputFormat.toLowerCase()
                && fileDocType.toLowerCase() === docType.toLowerCase()) {
                  return true;
                }
              }
            }
            return false;
        });
        if(matchingFiles.length > 0) {
            const insertObject = {
                user: userId,
                fileName: matchingFiles[0].fileName,
                fileLink: matchingFiles[0].fileLink,
                resultFileLink: matchingFiles[0].resultFileLink,
                resultFileLinkActive: matchingFiles[0].resultFileLinkActive,
                docType: matchingFiles[0].docType,
                inputFileHash: matchingFiles[0].inputFileHash
            }
            const newPDF = await AutotagPDF.create(insertObject);
            console.log(newPDF);
            res.status(httpStatusCodes[201].code).json(formResponse(httpStatusCodes[201].code, { status: true }));
        }
        else {
            res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, { status: false })); 
        }
    } catch (error) {
        res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, 'An error occurred while checking if user file previously processed'));
    }
}

exports.whatsappCreate = async (req, res) => {
    try {        
        const newPDF = await WhatsappAutotag.create(req.body);
        console.log(newPDF);
        res.status(httpStatusCodes[201].code)
        .json(formResponse(httpStatusCodes[201].code, newPDF));
    } catch (error) {
        // res.status(500).json({ error: 'An error occurred while creating the PDF entry.' });
        res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code,'An error occurred while creating the PDF entry.'))
    }
}

exports.getAllPDFsByWhatsappNumber = async (req, res) => {
    try {
        const userId = req.params.userId; 
        const userPDFs = await WhatsappAutotag.find({ user: userId }).sort({createdAt: -1});
        console.log(userPDFs)
        res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, userPDFs));
    } catch (error) {
        res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, 'An error occurred while fetching PDFs by userId'));
    }
}

exports.compareFileHash = async (req, res) => {
    try {
        const { user, inputFileHash, docType, outputFormat } = req.body;
        const match = await AutotagPDF.findOne({ user, inputFileHash, docType, outputFormat }).sort({createdAt: -1});
        console.log(match)
        if (match && match.resultFileLinkActive) {
            // Create a new entry with the value of the matched object
            console.log(true)
            const obj = {
                user: match.user,
                fileName: match.fileName,
                fileLink: match.fileLink,
                resultFileLink: match.resultFileLink,
                resultFileLinkActive: match.resultFileLinkActive,
                docType: match.docType,
                outputFormat: match.outputFormat,
                inputFileHash: match.inputFileHash
            }
            const newEntry = await AutotagPDF.create(obj);
            res.status(httpStatusCodes[200].code).json({ status: true, data: match });
        } else {
            console.log(false)
            res.status(httpStatusCodes[200].code).json({ status: false });
        }
    } catch (error) {
        res.status(httpStatusCodes[500].code).json({message:'An error occurred while fetching PDFs by userId'});
    }
}

exports.whatsappCompareFileHash = async (req, res) => {
    try {
        const { user, inputFileHash, docType, format } = req.body;
        const match = await WhatsappAutotag.findOne({ user, inputFileHash, docType, format }).sort({createdAt: -1});
        console.log(match)
        if (match) {
            const matchObject = match.toObject();
            delete matchObject._id;
            console.log(true)
            const newEntry = await WhatsappAutotag.create(matchObject); 
            res.status(httpStatusCodes[200].code).json({ status: true, data: match });
        } else {
            console.log(false)
            res.status(httpStatusCodes[200].code).json({ status: false });
        }
    } catch (error) {
        console.log(error);
        res.status(httpStatusCodes[500].code).json({message:'An error occurred while fetching PDFs by userId'});
    }
}

