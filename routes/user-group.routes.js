const express = require("express");
const router = express.Router();
const UserGroupController = require("../controllers/user/user-group.controller");

router.post("/", async (req, res) => {
    await UserGroupController.create(req, res);
});

router.get("/", async (req, res) => {
    await UserGroupController.getAll(req, res);
});

router.get("/:id", async (req, res) => {
    await UserGroupController.getById(req, res);
});

router.put("/:id", async (req, res) => {
    UserGroupController.update(req, res);
});

router.delete("/:id", async (req, res) => {
    await UserGroupController.delete(req, res);
});

router.post("/filter", async (req, res) => {
    await UserGroupController.filter(req, res);
});

module.exports = router;