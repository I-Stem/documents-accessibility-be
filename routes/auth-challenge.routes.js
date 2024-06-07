const express = require("express");
const router = express.Router();
const AuthChallengeController = require("../controllers/auth-challenge/auth-challenge.controller");

router.post("/", async (req, res)=> {
        await AuthChallengeController.create(req, res);
});

    router.get("/", async (req, res)=> {
await AuthChallengeController.getAll(req, res);
    });

    router.get("/:id", async (req, res)=> {
        await AuthChallengeController.getById(req, res);
    });

    router.put("/:id", async (req, res)=> {
        AuthChallengeController.update(req, res);
    });

    router.delete("/:id", async (req, res)=> {
        await AuthChallengeController.delete(req, res);
    });

module.exports = router;