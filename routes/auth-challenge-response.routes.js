const express = require("express");
const router = express.Router();
const AuthChallengeResponseController = require("../controllers/auth-challenge/auth-challenge-response.controller");

router.post("/", async (req, res)=> {
        await AuthChallengeResponseController.create(req, res);
});

    router.get("/", async (req, res)=> {
await AuthChallengeResponseController.getAll(req, res);
    });

    router.get("/:id", async (req, res)=> {
        await AuthChallengeResponseController.getById(req, res);
    });

    router.put("/:id", async (req, res)=> {
        AuthChallengeResponseController.update(req, res);
    });

    router.delete("/:id", async (req, res)=> {
        await AuthChallengeResponseController.delete(req, res);
    });

module.exports = router;