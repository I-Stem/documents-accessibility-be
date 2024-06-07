const express = require("express");
const router = express.Router();
const UserQuestionController = require("../controllers/auth-challenge/user-question.controller");

router.post("/", async (req, res)=> {
        await UserQuestionController.create(req, res);
});

    router.get("/", async (req, res)=> {
await UserQuestionController.getAll(req, res);
    });

    router.get("/:id", async (req, res)=> {
        await UserQuestionController.getById(req, res);
    });

    router.put("/:id", async (req, res)=> {
        UserQuestionController.update(req, res);
    });

    router.delete("/:id", async (req, res)=> {
        await UserQuestionController.delete(req, res);
    });

module.exports = router;