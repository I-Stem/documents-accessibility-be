const express = require("express");
const router = express.Router();

const notficationController = require('../controllers/user/user.controller');

router.put("/:id", async (req, res) => {
    await notficationController.updateSettings(req, res);
})
router.post("/", async (req, res) => {
    await notficationController.createSettings(req, res);
})

router.get("/:id", async (req, res) => {
    await notficationController.getSettings(req, res);
})
module.exports = router;
