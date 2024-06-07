const User = require("../../models/user.model");
const user_settings = require('../../models/user-settings.model')
const { formResponse } = require("../../helpers/response");
const httpStatusCodes = require("../../constants/http-status-codes");
const { handleError } = require("../../helpers/error");
const jwtHelper = require('../../helpers/jwt');
const { createLog } = require("../../helpers/logger");
const SocialGroup = require("../../models/social-group.model");

const crypto = require('crypto');
const mongoose = require("mongoose");

const bcrypt = require('bcryptjs');
const sendEmail = require('../../helpers/send-email');

const modelName = "login";
const conn = require("../../config/db/mongo");

exports.login = async (req, res) => {
    const methodName = "Login";
    createLog(methodName, modelName);

    const _username = req.body.username;
    const _password = req.body.password;

    const data = {
        email: _username
    }

    try {
        let result = await User.findOne(data).lean();
        if (result) {
            //compare passwords 
            if (!(bcrypt.compareSync(_password, result.passwordHash))) {
                res.status(httpStatusCodes[500].code)
                    .json(formResponse(httpStatusCodes[500].code, {
                        message: "Invalid Username or Password. Please try again"
                    }));
            } else {
                const jwt = jwtHelper.generateJwtToken(result._id);
                const refreshToken = jwtHelper.generateRefreshToken(result._id);
                const userData = (({ _id, password, ...generalDetails }) => ({ ...generalDetails }))(result);
                result.token = refreshToken;
                let dbResponse = await User.findByIdAndUpdate(result._id, result);
                const response = {
                    user: { ...userData },
                    jwtToken: jwt,
                    refreshToken: refreshToken
                };

                res.status(httpStatusCodes[200].code)
                    .json(formResponse(httpStatusCodes[200].code, response));
            }
        } else {
            res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, {
                    message: "Account cannot be found. Try signing up"
                }));
        }
    } catch (err) {
        console.log(err)
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, {
                message: "Your request could not be processed at this time"
            }));
    }
}

exports.register = async (req, res, next) => {
    const methodName = "Register";
    createLog(methodName, modelName);

    const ipOb = {
        email: req.body.username,
        first_name: req.body.first_name,
        last_name: req.body.last_name
    };

    if (!ipOb.email.trim()) {
        res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, {
                message: "Email is invalid. Try again."
            }));
        return;
    }

    const data = {
        email: ipOb.email
    }

    const session = await conn.startSession();
    session.startTransaction();
    try {
        let result = await User.findOne(data).lean();
        if (result) {
            await session.abortTransaction();
            res.status(httpStatusCodes[400].code)
                .json(formResponse(httpStatusCodes[400].code, {
                    message: "User already exists. Try login"
                }));
            return;
        }

        if (!ipOb._id) {
            ipOb._id = new mongoose.mongo.ObjectId();
        }

        ipOb.passwordHash = await bcrypt.hash(req.body.password, 10);

        let createResult = await User.create(ipOb);

        await user_settings.create({
            user: createResult._id
        })

        if (createResult) {
            //add him to global group
            let generalGroup = await SocialGroup.findOneAndUpdate({ global: true }, { $addToSet: { "members.approved": createResult._id } }, { new: true });
            if (!generalGroup) {
                await session.abortTransaction();
                res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
                return;
            }
            //update against newly created user too
            let userResult = await User.findByIdAndUpdate(createResult._id, { $addToSet: { "groups.approved": generalGroup._id } }, { new: true });
            if (!userResult) {
                await session.abortTransaction();
                res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, "Please Try again later"));
                return;
            }
            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, {
                    message: "Account created successfully",
                    redirect: true
                }));
        } else {
            await session.abortTransaction();
            res.status(httpStatusCodes[500].code)
                .json(formResponse(httpStatusCodes[500].code, {
                    message: "Account cannot be created at this time."
                }));
            return;
        }
    } catch (err) {
        await session.abortTransaction();
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, {
                message: "Your request could not be processed at this time"
            }));
    } finally {
        await session.endSession();
        res.end();
    }
}

exports.forgotPassword = async (req, res, next) => {
    const methodName = "Forgot Password";
    createLog(methodName, modelName);

    try {
        const _username = req.body.username;

        if (!_username.trim()) {
            res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, {
                    message: "Email is invalid. Try again."
                }));
            return;
        }

        const data = {
            email: _username
        }
        let result = await User.find(data).lean();
        if (result) {
            const _email = result[0].email;
            let password = crypto.randomBytes(6).toString('hex');
            let password_hash = await bcrypt.hash(password, 10);
            let updatePasswordResult = await User.findOneAndUpdate({ email: _email }, { passwordHash: password_hash })
            if (updatePasswordResult) {
                await sendPasswordResetEmail(_email, password);
                res.status(httpStatusCodes[200].code)
                    .json(formResponse(httpStatusCodes[200].code, {
                        message: "New Password has been sent to your registered email"
                    }));
            }
            else {
                throw new Error("could not update password hash");
            }
        }
        else {
            res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, {
                    message: "Account cannot be found. Try signing up"
                }));
        }

    }
    catch (err) {
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, {
                message: "Your request could not be processed at this time"
            }));
    }
}

async function sendPasswordResetEmail(email, password) {
    let subject = 'G.N.Y.P.W.D - New Login Password';
    let message = `<h4>Reset Password Email</h4> <p>Your new login password is ${password}</p>`;
    await sendEmail.sendEmail({ email, subject, message });
}

exports.refreshToken = async (req, res, next) => {
    const methodName = "Refresh";
    createLog(methodName, modelName);
    const refreshToken = req.body.refresh;
    if (refreshToken == null) {
        return res.status(403).send("Refresh Token is required!");
    }
    try {
        let user = await User.findOne({where: {token: refreshToken}});
        if (!user) {
            res.status(403).send("Invalid refresh token");
            return;
        }
        if(jwtHelper.verifyExpiry(refreshToken)) {
            res.status(403).send("Refresh token was expired. Please make a new sign in request");
            return;
        }
        const jwt = jwtHelper.generateJwtToken(user._id);
        const newRefreshToken = jwtHelper.generateRefreshToken(user._id);
        user.token = newRefreshToken;
        let dbResponse = await User.findByIdAndUpdate(user._id, user);
        const response = {
            jwtToken: jwt,
            refreshToken: newRefreshToken
        };
        res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code, response));
    } catch (err) {
        handleError(err, methodName, modelName);
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, {
                message: "Your request could not be processed at this time"
            }));
    }
}
