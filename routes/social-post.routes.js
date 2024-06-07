const express = require("express");
const router = express.Router();
const SocialPostController = require("../controllers/social-post/social-post.controller");

router.post("/", async (req, res) => {
    await SocialPostController.create(req, res);
});

router.get("/", async (req, res) => {
    await SocialPostController.getAll(req, res);
});

router.get("/:id", async (req, res) => {
    await SocialPostController.getById(req, res);
});

router.put("/:id", async (req, res) => {
    SocialPostController.update(req, res);
});

router.delete("/:id", async (req, res) => {
    await SocialPostController.delete(req, res);
});

router.post("/filter", async (req, res) => {
    await SocialPostController.filter(req, res);
});

router.get("/get-user-posts/:id/:approved/:offset", async (req, res) => {
    await SocialPostController.getPostsByUser(req, res);
});

router.get("/like-post/:userId/:postId/:liked", async (req, res) => {
    await SocialPostController.likeOrUnlikePost(req, res);
});

router.get("/get-files-by-group/:groupId", async (req, res) => {
    await SocialPostController.getFilesByGroup(req, res);
});

router.get("/get-files-by-project/:projectId", async (req, res) => {
    await SocialPostController.getFilesByProject(req, res);
});

router.get("/get-user-feed/:id/:approved/:offset/:limit", async (req, res) => {
    await SocialPostController.getUserFeed(req, res);
});

router.get("/get-group-feed/:id/:post_type/:approved/:offset/:limit", async (req, res) => {
    await SocialPostController.getGroupFeed(req, res);
});
router.get("/get-project-feed/:id/:post_type/:approved/:offset/:limit", async (req, res) => {
    await SocialPostController.getProjectFeed(req, res);
});

module.exports = router;