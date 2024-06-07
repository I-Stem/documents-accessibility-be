const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth/login.controller");

router.post("/login", async (req, res) => {
    await AuthController.login(req, res);
});

router.post("/forgot-password", async (req, res, next) => {
    await AuthController.forgotPassword(req, res, next);
});

router.post("/register", async (req, res, next) => {
    await AuthController.register(req, res, next);
});

router.post("/refresh", async (req, res, next) => {
    await AuthController.refreshToken(req, res, next);
});

module.exports = router;