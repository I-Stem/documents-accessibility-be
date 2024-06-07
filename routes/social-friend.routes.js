const express = require("express");
const router = express.Router();
const SocialFriendController = require("../controllers/social-friend.controller");

router.post("/", async (req, res)=> {
        await SocialFriendController.create(req, res);
});

    router.get("/", async (req, res)=> {
await SocialFriendController.getAll(req, res);
    });

    router.get("/:id", async (req, res)=> {
        await SocialFriendController.getById(req, res);
    });

    router.put("/:id", async (req, res)=> {
        SocialFriendController.update(req, res);
    });

    router.delete("/:id", async (req, res)=> {
        await SocialFriendController.delete(req, res);
    });

module.exports = router;