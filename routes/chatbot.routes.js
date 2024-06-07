const express = require("express");
const router = express.Router();
const ChatbotController = require("../controllers/chatbot/chatbot.controller");
const ChatbotControllerV2 = require("../controllers/chatbot/chatbotv2.controller");

router.post("/", async (req, res)=> {
    await ChatbotController.create(req, res);
});

router.post("/v2", async (req, res)=> {
    await ChatbotControllerV2.create(req, res);
});

router.get("/getall", async (req, res)=> {
    await ChatbotControllerV2.getAll(req, res);
});

router.get("/:id", async (req, res)=> {
    await ChatbotControllerV2.getById(req, res);
});

router.get("/continue-chat", async (req, res)=> {
    await ChatbotControllerV2.getById(req, res);
});

module.exports = router;