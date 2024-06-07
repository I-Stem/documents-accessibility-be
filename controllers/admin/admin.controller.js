const SocialPost = require("../../models/social-post.model");
const SocialGroup = require("../../models/social-group.model");
const Project = require("../../models/project.model");
const User = require("../../models/user.model");
const { formResponse } = require("../../helpers/response");
const httpStatusCodes = require("../../constants/http-status-codes");
const { handleError } = require("../../helpers/error");
const { createLog } = require("../../helpers/logger");
const mongoose = require("mongoose");
const jwtHelper = require('../../helpers/jwt');
const modelName = "admin";
exports.approveOrDisapprovePost = async(req, res, next)=> {
    const methodName = "approve or disapprove post";
    createLog(methodName, modelName);
    let auth = req.headers['authorization'];
    let userData = jwtHelper.decodeJWT(auth);
    const userId = userData.sub;
    const {postId, approved, date} = req.body;
    const data = {
        approved: approved,
        approved_by: userId,
        approved_on: date
    };

    try {
        let result = await SocialPost.findByIdAndUpdate(postId, data, {new:true});
if(!result) throw new Error("Could not update post");
    res.status(httpStatusCodes[200].code)
    .json(formResponse(httpStatusCodes[200].code, result));
    }catch(err) {
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
        .json(formResponse(httpStatusCodes[500].code, {}));
    }
}

