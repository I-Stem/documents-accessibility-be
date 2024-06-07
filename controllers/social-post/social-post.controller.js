const SocialPost = require("../../models/social-post.model");
const SocialGroup = require("../../models/social-group.model");
const SocialPostComments = require("../../models/social-post-comment.model");
const Project = require("../../models/project.model");
const User = require("../../models/user.model");
const UserFile = require("../../models/user-file.model")
const { formResponse } = require("../../helpers/response");
const httpStatusCodes = require("../../constants/http-status-codes");
const { handleError } = require("../../helpers/error");
const { createLog } = require("../../helpers/logger");
const mongoose = require("mongoose");
const jwtHelper = require('../../helpers/jwt');
const modelName = "social-post";
const fileType = require('file-type');
const { v4: uuid } = require('uuid');
const AWS = require('aws-sdk');
const mimeTypes = require("nodemailer/lib/mime-funcs/mime-types");
const conn = require("../../config/db/mongo");
const s3 = new AWS.S3();
const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/pdf',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain',
    'audio/ogg', 'audio/mpeg', 'video/mp4', 'audio/wav', 'audio/webm', 'video/webm', 'image/webp'];

const {sendBulkEmail,sendEmail}=require('../../controllers/user/user-notification.controller')
exports.create = async (req, res, next) => {

    // console.log(req.body)
        // let data=req.body
        // sendBulkEmail(data.post_type)
        //  res.send("done sending mails")
    AWS.config = new AWS.Config();
    AWS.config.update({
        region:"us-east-1",
        credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: "us-east-1:6d15f6cc-5c4d-4d8f-9fc2-2f0b6d82736c",
            // AccessKey: process.env.AWS_ACCESS_KEY_ID,
            // SecretKey: process.env.AWS_SECRET_ACCESS_KEY
        })
    });

    const methodName = "create";
    createLog(methodName, modelName);
    const session = await conn.startSession();
    session.startTransaction();
    try {
        const data = req.body.newFeed;
        let url = ''
        if (req.body.image && req.body.mime) {
            url = await _uploadBase64Image(res, req.body.image, req.body.mime);
            if(url.length > 0){
                data.files = [url]
                data.fileName = [req.body.fileName]
            }
            else {
                await session.abortTransaction();
                res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
                return;
            }
        }
        if (!data._id) {
            data._id = new mongoose.mongo.ObjectId();
        }
        let result = await SocialPost.create(data);

        sendBulkEmail(data.post_type)

        if(!result) {
            await session.abortTransaction();
            res.status(httpStatusCodes[400].code)
                .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
            return;
        }
        let postId = result._id.toString();
        let groupId = result.group._id.toString();
        // let userId = result.user._id.toString();
        let auth = req.headers['authorization'];
        let userData = jwtHelper.decodeJWT(auth);

        let userId = userData.sub;

        if (result.post_type == 'GROUP_DISCUSSION') {
            result = await SocialGroup.findByIdAndUpdate(groupId, { $addToSet: { "discussions.approved": postId } }, { new: true });
            if(!result) {
                await session.abortTransaction();
                res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
                return;
            }
            let updatedUser = await User.findByIdAndUpdate(userId, { $inc: { post_count: 1 } }, { new: true });
            if (!updatedUser) {
                // throw new Error("could not update user count");
                await session.abortTransaction();
                res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
                return;
            }

        } else if (result.post_type == 'GROUP_ANNOUNCEMENT') {
            result = await SocialGroup.findByIdAndUpdate(groupId, { $addToSet: { "announcements.approved": postId } }, { new: true });
            if(!result) {
                await session.abortTransaction();
                res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
                return;
            }
        } else if (result.post_type == 'PROJECT_DISCUSSION') {
            let projectId = result.project._id.toString();
            result = await Project.findByIdAndUpdate(projectId, { $addToSet: { "discussions.approved": postId } }, { new: true });
            if(!result) {
                await session.abortTransaction();
                res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
                return;
            }

            let updatedUser = await User.findByIdAndUpdate(userId, { $inc: { post_count: 1 } }, { new: true });
            if (!updatedUser) {
                // throw new Error("could not update user count");
                await session.abortTransaction();
                res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
                return;
            }
        } else if (result.post_type == 'PROJECT_ANNOUNCEMENT') {
            let projectId = result.project._id.toString();
            result = await Project.findByIdAndUpdate(projectId, { $addToSet: { "announcements.approved": postId } }, { new: true });
            if(!result) {
                await session.abortTransaction();
                res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
                return;
            }
        }

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
        let results = await SocialPost.find().lean();
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
        let result = await SocialPost.findById(req.params.id).lean();
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
        const data = req.body.post;
        let url = ''
        if (req.body.image && req.body.mime) {
            url = await _uploadBase64Image(res, req.body.image, req.body.mime);
            if(url.length > 0){
                data.files = [url]
                data.fileName = [req.body.fileName]
            }
            else {
                await session.abortTransaction();
                res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
                return;
            }
        }
        let result = await SocialPost.findByIdAndUpdate(req.params.id, data, { new: true });
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
        let post = await SocialPost.findById(req.params.id);
        let userId = post.user._id.toString();

        let result = await SocialPost.deleteOne({ _id: req.params.id });

        let updatedUser = await User.findByIdAndUpdate(userId, { $inc: { post_count: -1 } });
        if (!updatedUser) throw new Error("could not update user count");

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
        const filterParams = req.body;
        let results = await SocialPost.find(filterParams)
            .sort({ createdAt: -1 }).lean();
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

exports.getPostsByUser = async (req, res, next) => {
    const methodName = "get posts by user";
    createLog(methodName, modelName);
    try {
        let user = await User.find({ _id: new mongoose.Types.ObjectId(req.params.id) });
        let offset = req.params.offset;
        if (user) {
            let result = await SocialPost.find({
                user: new mongoose.Types.ObjectId(req.params.id), approved: req.params.approved
            })
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(10)
                .lean();
            if (result) {
                res.status(httpStatusCodes[200].code)
                    .json(formResponse(httpStatusCodes[200].code, result));
                return;
            } else {
                res.status(httpStatusCodes[404].code)
                    .json(formResponse(httpStatusCodes[404].code, {}));
            }
        }

    } catch (err) {
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, {}));
    }
}

exports.likeOrUnlikePost = async (req, res) => {
    const methodName = "like or unlike post";
    // const userId = req.params.userId;

    const postId = req.params.postId;
    const liked = req.params.liked;
    let auth = req.headers['authorization'];
    let userData = jwtHelper.decodeJWT(auth);
    const userId = userData.sub;
    createLog(methodName, modelName);

    try {
        if (liked == '1') {
            //start mongoose transaction 
            let updatedPost = await SocialPost.findByIdAndUpdate(postId, { $addToSet: { likes: userId } }, { new: true });
            if (!updatedPost) throw new Error("could not update post");
            let updatedUser = await User.findByIdAndUpdate(userId, { $inc: { like_count: 1 } }, { new: true });
            sendEmail('POST_LIKES_AND_COMMENTS',userId)
            if (!updatedUser) throw new Error("could not update user count");
            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, updatedPost));
        } else {
            let updatedPost = await SocialPost.findByIdAndUpdate(postId, { $pull: { likes: userId } }, { new: true });
            if (!updatedPost) throw new Error("could not update post");
            let updatedUser = await User.findByIdAndUpdate(userId, { $inc: { like_count: -1 } }, { new: true });
            if (!updatedUser) throw new Error("could not update user count");
            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, updatedPost));

        }
    } catch (err) {
        //rollback transaction
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, {}));
    }
}

exports.getFilesByGroup = async (req, res, next) => {
    const methodName = "get social group files by id";
    createLog(methodName, modelName);
    const groupId = req.params.groupId;
    let result;
    try {
        result = await SocialPost.find({
            $and: [
                { "files.0": { "$exists": true } },
                { "group": groupId }
            ]
        }).lean();
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

exports.getFilesByProject = async (req, res, next) => {
    const methodName = "get Project files by id";
    createLog(methodName, modelName);
    const projectId = req.params.projectId;
    let result;
    try {
        result = await SocialPost.find({
            $and: [
                { "files.0": { "$exists": true } },
                { "project": projectId }
            ]
        }).lean();
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

exports.getUserFeed = async (req, res, next) => {
    const methodName = "get posts by user";
    createLog(methodName, modelName);
    try {
        const userId = mongoose.Types.ObjectId(req.params.id);
        let user = await User.find({ _id: userId });
        const groupIds = user[0].groups.approved;
        const offset = parseInt(req.params.offset);
        const limit = parseInt(req.params.limit);
        if (user) {
            let result = await SocialPost.aggregate([
                {
                    $match: {
                        $or: [
                            { user: userId },
                            { group: { $in: groupIds } }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user_details'
                    }
                },
                {
                    $unwind: '$user_details'
                },
                {
                    $lookup: {
                        from: 'social_post_comments',
                        localField: '_id',
                        foreignField: 'post',
                        as: 'social_post_comment'
                    },
                },
                {
                    $project: {
                        user: 1,
                        postType: 1,
                        content: 1,
                        group: 1,
                        project: 1,
                        region: 1,
                        theme: 1,
                        approved: 1,
                        approved_on: 1,
                        approved_by: 1,
                        likes: 1,
                        files: 1,
                        fileName: 1,
                        reported: 1,
                        reported_on: 1,
                        blocked: 1,
                        blocked_by: 1,
                        createdAt: 1,
                        comment_count: { $size: '$social_post_comment' },
                        'user_details.first_name': 1,
                        'user_details.last_name': 1,
                        'user_details.profile_pic': 1,
                    }
                },
                { $sort: { createdAt: -1 } },
                { $skip: offset },
                { $limit: limit }
            ]);
            if (result) {
                res.status(httpStatusCodes[200].code)
                    .json(formResponse(httpStatusCodes[200].code, result));
                return;
            } else {
                res.status(httpStatusCodes[404].code)
                    .json(formResponse(httpStatusCodes[404].code, {}));
            }
        }

    } catch (err) {
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, {}));
    }
}

exports.getGroupFeed = async (req, res, next) => {
    const methodName = "get posts by group";
    createLog(methodName, modelName);
    try {
        console.log(req.params)
        const groupId = mongoose.Types.ObjectId(req.params.id);
        const limit = parseInt(req.params.limit);
        const offset = parseInt(req.params.offset);
        const post_type = req.params.post_type;

        let result = await SocialPost.aggregate([
            {
                $match: { $and: 
                    [
                        { group: groupId },
                        { post_type: post_type }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user_details'
                }
            },
            {
                $unwind: '$user_details'
            },
            {
                $lookup: {
                    from: 'social_post_comments',
                    localField: '_id',
                    foreignField: 'post',
                    as: 'social_post_comment'
                },
            },
            {
                $project: {
                    user: 1,
                    postType: 1,
                    content: 1,
                    group: 1,
                    project: 1,
                    region: 1,
                    theme: 1,
                    approved: 1,
                    approved_on: 1,
                    approved_by: 1,
                    likes: 1,
                    files: 1,
                    fileName: 1,
                    reported: 1,
                    reported_on: 1,
                    blocked: 1,
                    blocked_by: 1,
                    createdAt: 1,
                    comment_count: { $size: '$social_post_comment' },
                    'user_details.first_name': 1,
                    'user_details.last_name': 1,
                    'user_details.profile_pic': 1,
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: offset },
            { $limit: limit }
        ]);
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

exports.getProjectFeed = async (req, res, next) => {
    const methodName = "get posts by group";
    createLog(methodName, modelName);
    try {
        console.log(req.params)
        const projectId = mongoose.Types.ObjectId(req.params.id);
        const limit = parseInt(req.params.limit);
        const offset = parseInt(req.params.offset);
        const post_type = req.params.post_type;

        let result = await SocialPost.aggregate([
            {
                $match: { $and: 
                    [
                        { project: projectId },
                        { post_type: post_type }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user_details'
                }
            },
            {
                $unwind: '$user_details'
            },
            {
                $lookup: {
                    from: 'social_post_comments',
                    localField: '_id',
                    foreignField: 'post',
                    as: 'social_post_comment'
                },
            },
            {
                $project: {
                    user: 1,
                    postType: 1,
                    content: 1,
                    group: 1,
                    project: 1,
                    region: 1,
                    theme: 1,
                    approved: 1,
                    approved_on: 1,
                    approved_by: 1,
                    likes: 1,
                    files: 1,
                    fileName: 1,
                    reported: 1,
                    reported_on: 1,
                    blocked: 1,
                    blocked_by: 1,
                    createdAt: 1,
                    comment_count: { $size: '$social_post_comment' },
                    'user_details.first_name': 1,
                    'user_details.last_name': 1,
                    'user_details.profile_pic': 1,
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: offset },
            { $limit: limit }
        ]);
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
