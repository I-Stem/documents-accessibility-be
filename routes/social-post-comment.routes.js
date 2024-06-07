const express = require("express");
const router = express.Router();
const SocialPostCommentController = require("../controllers/social-post-comment/social-post-comment.controller");

router.post("/", async (req, res) => {
    await SocialPostCommentController.create(req, res);
});

router.get("/", async (req, res) => {
    await SocialPostCommentController.getAll(req, res);
});

router.get("/:id", async (req, res) => {
    await SocialPostCommentController.getById(req, res);
});

router.put("/:id", async (req, res) => {
    SocialPostCommentController.update(req, res);
});

router.delete("/:id", async (req, res) => {
    await SocialPostCommentController.delete(req, res);
});

router.get("/get-post-comments/:id", async (req, res) => {
    await SocialPostCommentController.getCommentsByPost(req, res);
});

module.exports = router;