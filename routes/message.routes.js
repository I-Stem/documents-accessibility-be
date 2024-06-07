const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/message.controller");

router.post("/", async (req, res) => {
    await MessageController.create(req, res);
});

router.get("/", async (req, res) => {
    await MessageController.getAll(req, res);
});

router.get("/:id", async (req, res) => {
    await MessageController.getById(req, res);
});

router.put("/:id", async (req, res) => {
    MessageController.update(req, res);
});

router.delete("/:id", async (req, res) => {
    await MessageController.delete(req, res);
});

router.get("/get-user-messages/:senderId/:receiverId", async (req, res) => {
    await MessageController.getMessagesByUser(req, res);
});

module.exports = router;