const express = require("express");
const router = express.Router();
const UserFriendController = require("../controllers/user/user-friend.controller");

router.post("/", async (req, res)=> {
        await UserFriendController.create(req, res);
});

    router.get("/", async (req, res)=> {
await UserFriendController.getAll(req, res);
    });

    router.get("/:id", async (req, res)=> {
        await UserFriendController.getById(req, res);
    });

    router.put("/:id", async (req, res)=> {
        UserFriendController.update(req, res);
    });

    router.delete("/:id", async (req, res)=> {
        await UserFriendController.delete(req, res);
    });

module.exports = router;