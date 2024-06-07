const User = require("../../models/user.model");
const user_settings = require('../../models/user-settings.model')
const user_notification = require('../../models/user-notification.model')
const SocialGroup = require("../../models/social-group.model");
const { formResponse } = require("../../helpers/response");
const httpStatusCodes = require("../../constants/http-status-codes");
const { handleError } = require("../../helpers/error");
const { createLog } = require("../../helpers/logger");
const jwtHelper = require('../../helpers/jwt');
const mongoose = require("mongoose");

const modelName = "user";
const { v4: uuid } = require('uuid');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fileType = require('file-type');
const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/pdf',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain',
    'audio/ogg', 'audio/mpeg', 'video/mp4', 'audio/wav', 'audio/webm', 'video/webm', 'image/webp'];
const bcrypt = require('bcryptjs');

exports.create = async (req, res, next) => {
    const methodName = "create";
    createLog(methodName, modelName);
    try {
        const data = req.body;
        if (!data._id) {
            data._id = new mongoose.mongo.ObjectId();
        }

        let result = await User.create(data);
        // await user_settings.create({
        //     user: data._id
        // })
        if (result) {
            res.status(httpStatusCodes[201].code)
                .json(formResponse(httpStatusCodes[201].code, result));
            return;
        } else {
            res.status(httpStatusCodes[202].code)
                .json(formResponse(httpStatusCodes[202], {}));
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
        let results = await User.find().lean();
        if (results) {
            let resultsWithoutPasswordHash = [];
            results.forEach(el => {
                resultsWithoutPasswordHash.push(withoutProperty(el, 'passwordHash'))
            });
            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, resultsWithoutPasswordHash));
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

    let auth = req.headers['authorization'];
    let userData = jwtHelper.decodeJWT(auth);

    let id = req.params.id == "undefined" ? userData.sub : req.params.id;
    try {
        let result = await User.findById(id).lean();
        if (result) {
            const resultWithoutPasswordHash = withoutProperty(result, 'passwordHash') 
            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, resultWithoutPasswordHash));
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
        //console.log(data);
        let url = ''
        if (req.body.image && req.body.mime) {
            url = await _uploadBase64Image(res, req.body.image, req.body.mime);
            if (url.length > 0) {
                data.profile_pic = url
            }
            else {
                await session.abortTransaction();
                res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
                return;
            }
        }
        let auth = req.headers['authorization'];
        console.log(auth)
        let userData = jwtHelper.decodeJWT(auth);

        let id = userData.sub;

        // encrypt password for change password requests
        if(data.password) {
            data.passwordHash = await bcrypt.hash(data.password, 10);
        }

        let result = await User.findByIdAndUpdate(id, data, { new: true });
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
        let result = await User.findByIdAndDelete(req.params.id);
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

    const filterParams = req.body;
    console.log(filterParams);
    try {
        let results = await User.find(filterParams).lean();
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

exports.getGroupUsers = async (req, res, next) => {
    const methodName = "get group users";
    createLog(methodName, modelName);
    const filter = JSON.parse(req.body.filter);

    try {
        let userIds = await SocialGroup.find({ _id: { $in: filter } })
            .select("members.approved")
            .distinct("members.approved")
            .lean();

        if (!userIds) throw new Error("Could not fetch user ids");
        console.log(userIds);

        let users = await User.find({ _id: { $in: userIds } }).lean();
        console.log(users);

        if (!users) throw new Error("could not fetch users");

        res.status(httpStatusCodes[200])
            .json(formResponse(httpStatusCodes[200], users));
    } catch (err) {
        res.status(httpStatusCodes[500])
            .json(formResponse(httpStatusCodes[500], {}));
    }
}

exports.updateSettings = async (req, res) => {


    let k = req.body
    if (Object.keys(k).length === 0) {
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code))
        return
    }

    // console.log(typeof data.id)
    let post_type = Object.keys(k).toString()
    let post_type_value = Object.values(k).toString()
    console.log(Object.keys(k).toString())
    let data = await User.findById(req.params.id, "email")


    if (post_type === 'GROUP_ANNOUNCEMENT' || post_type === 'GROUP_DISCUSSION' || post_type === 'PROJECT_ANNOUNCEMENT' || post_type === 'PROJECT_DISCUSSION') {
        try {
            let key = Object.keys(k)
            let result;
            if (Object.values(k).toString() === "true") {

                await user_settings.updateOne({ user: req.params.id }, {
                    $set: {
                        [key]: true
                    }
                })
                result = await user_notification.updateOne({ notification_type: Object.keys(k).toString() }, {
                    $addToSet: {
                        users: {
                            _id: req.params.id,
                            user: req.params.id,
                            email: data.email
                        }
                    }
                })
                if (result) {
                    res.status(httpStatusCodes[200].code)
                        .json(formResponse(httpStatusCodes[200].code, result));
                    return;
                }
                else {
                    res.status(httpStatusCodes[202].code)
                        .json(formResponse(httpStatusCodes[202].code, {}));
                }
            }
            else if (Object.values(k).toString() === "false") {
                await user_settings.updateOne({ user: req.params.id }, {
                    $set: {
                        [key]: false
                    }
                })
                result = await user_notification.updateOne({ notification_type: Object.keys(k).toString() }, {
                    $pull: {
                        users: {
                            user: req.params.id
                        }
                    }
                })
                if (result) {
                    res.status(httpStatusCodes[200].code)
                        .json(formResponse(httpStatusCodes[200].code, result));
                    return;
                }
                else {
                    res.status(httpStatusCodes[202].code)
                        .json(formResponse(httpStatusCodes[202].code, {}));
                }
            }




        }
        catch (err) {
            res.status(httpStatusCodes[500].code)
                .json(formResponse(httpStatusCodes[500].code, {}));
        }
    }
    else if (post_type === 'PERSONAL_CHATS' || post_type === 'POST_LIKES_AND_COMMENTS') {

        let key = Object.keys(k)
        let value = post_type_value
        let result = await user_settings.updateOne({ user: req.params.id }, {
            $set: {
                [key]: value
            }
        })
        if (result) {
            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, result));
            return;
        }
        else {
            res.status(httpStatusCodes[202].code)
                .json(formResponse(httpStatusCodes[202].code, {}));
        }

    }
}

exports.createSettings = async (req, res) => {

    try {
        let result = await user_notification.create({
            notification_type: req.body.notification_type
        })
        if (result) {
            res.status(httpStatusCodes[201].code)
                .json(formResponse(httpStatusCodes[201].code, result));
            return;
        } else {
            res.status(httpStatusCodes[202].code)
                .json(formResponse(httpStatusCodes[202], {}));
        }

    }
    catch (err) {
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, {}));
    }

}

exports.getSettings = async (req, res) => {

    try {
        let result = await user_settings.findOne({ user: req.params.id })
        console.log("getting user settings")
        if (result) {
            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, result));
            return;
        } else {
            res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, {}));
        }
    }
    catch (err) {
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, {}));
    }
}

async function _uploadBase64Image(res, imageParam, mimeParam) {
    try {
        // const body = JSON.parse(event.body);
        const image = imageParam;
        const mime = mimeParam;
        console.log(imageParam)
        console.log(mimeParam)
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
        if (detectedMime !== mime) {
            return {
                statusCode: 400,
                message: 'mime types dont match'
            };
        }
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

function withoutProperty(obj, property) {  
    const { [property]: unused, ...rest } = obj;
    return rest;
}