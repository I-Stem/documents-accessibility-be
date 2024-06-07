const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user/user.controller");

router.post("/", async (req, res) => {
    await UserController.create(req, res);
});

router.get("/", async (req, res) => {
    await UserController.getAll(req, res);
});

router.get("/:id", async (req, res) => {
    await UserController.getById(req, res);
});

router.put("/", async (req, res) => {
    UserController.update(req, res);
});

router.delete("/:id", async (req, res) => {
    await UserController.delete(req, res);
});

router.post("/get-group-users", async (req, res) => {
    await UserController.getGroupUsers(req, res);
});

router.post("/get-user-by-filter", async (req, res) => {
    await UserController.filter(req, res);
});

module.exports = router;