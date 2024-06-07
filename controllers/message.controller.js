const Message = require("../models/message.model");
const User = require("../models/user.model");
const { formResponse } = require("../helpers/response");
const httpStatusCodes = require("../constants/http-status-codes");
const { handleError } = require("../helpers/error");
const { createLog } = require("../helpers/logger");
const mongoose = require("mongoose");
const modelName = "message";
const conn = require("../config/db/mongo");
const {sendEmail}=require('../controllers/user/user-notification.controller')
const { v4: uuid } = require('uuid');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fileType = require('file-type');
const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/pdf',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain',
    'audio/ogg', 'audio/opus', 'audio/mpeg', 'video/mp4', 'audio/wav', 'audio/webm', 'video/webm', 'image/webp'];
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

        if(data.content_type == 'audio') {
            const mime = 'audio/opus';
            url = await _uploadBase64Image(res, data.content, mime);
            createLog('url ',url)
            if (url.length > 0) {
                data.content = url
            }
            else {
                await session.abortTransaction();
                res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
                return;
            }
        }

        let result = await Message.create(data);

        // sendEmail("PERSONAL_CHATS",data.receiver)
        
        if (result) {
            //update user.chat_users for sender and receiver
            let resultUpdateSenderChatUsers = await User.findByIdAndUpdate(data.sender, { $addToSet: { "chat_users": data.receiver } }, { new: true });
            if (!resultUpdateSenderChatUsers) {
                // throw new Error("could not update sender chat user");
                await session.abortTransaction();
                res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, "could not update sender chat user"));
                return;
            }

            let resultUpdateReceiverChatUsers = await User.findByIdAndUpdate(data.receiver, { $addToSet: { "chat_users": data.sender } }, { new: true });
            if (!resultUpdateReceiverChatUsers) {
                // throw new Error("could not update receiver chat user");
                await session.abortTransaction();
                res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, "could not update receiver chat user"));
                return;
            }

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
        let results = await Message.find().lean();
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
        let result = await Message.findById(req.params.id).lean();
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
        const { name } = req.body;
        const data = {
            name: name.toLowerCase()
        };

        let result = await Message.findByIdAndUpdate(req.params.id, data, { new: true });
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
        let result = await Message.findByIdAndDelete(req.params.id);
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

exports.getMessagesByUser = async (req, res, next) => {
    const methodName = "get by Sender and Receiver";
    createLog(methodName, modelName);

    const senderId = req.params.senderId;
    const receiverId = req.params.receiverId;

    try {
        let result = await Message.find(
            {
                $or: [
                    {
                        $and: [
                            { sender: senderId },
                            { receiver: receiverId }
                        ]
                    },
                    {
                        $and: [
                            { sender: receiverId },
                            { receiver: senderId }
                        ]
                    }
                    // { sender: { "$in": [senderId, receiverId] } },
                    // { receiver: { "$in": [senderId, receiverId] } }
                ]
            }
        ).lean();
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

async function _uploadBase64Image(res, imageParam, mimeParam) {
    try {
        // const body = JSON.parse(event.body);
        const image = imageParam;
        const mime = mimeParam;
        if (!image || !mime) {
            return {
                statusCode: 400,
                message: 'incorrect body on request'
            };
        }
        if (!allowedMimes.includes(mime)) {
            return {
                statusCode: 400,
                message: 'mime is not allowed '
            };
        }
        let imageData = image;
        if (image.substr(0, 7) === 'base64,') {
            imageData = image.substr(7, image.length);
        }
        const buffer = Buffer.from(imageData, 'base64');
        const fileInfo = await fileType.fromBuffer(buffer);
        let detectedExt = '';
        let detectedMime = '';
        if (mime == 'text/plain') {
            detectedExt = 'txt';
            detectedMime = 'text/plain';
        }
        else {
            detectedExt = fileInfo.ext;
            detectedMime = fileInfo.mime;
        }

        // console.log(buffer)
        console.log(fileInfo)
        console.log(detectedExt)
        console.log(detectedMime)
        // if (detectedMime !== mime) {
        //     return {
        //         statusCode: 400,
        //         message: 'mime types dont match'
        //     };
        // }
        const name = uuid();
        const key = `${name}.${detectedExt}`;
        console.log(`writing image to bucket called ${key}`);
        await s3
            .putObject({
                Body: buffer,
                Key: key,
                ContentType: mime,
                Bucket: 'gnypwd-media',
                ACL: 'public-read',
            })
            .promise();
        const url = `https://gnypwd-media.s3.amazonaws.com/${key}`;
        return url
    } catch (error) {
        console.log('error', error);
        return error
    }
}