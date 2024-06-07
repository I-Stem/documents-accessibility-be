const express = require("express");
const router = express.Router();
const ProjectController = require("../controllers/project.controller");

router.post("/", async (req, res) => {
    await ProjectController.create(req, res);
});

router.get("/", async (req, res) => {
    await ProjectController.getAll(req, res);
});

router.get("/:id", async (req, res) => {
    await ProjectController.getById(req, res);
});

router.put("/:id", async (req, res) => {
    ProjectController.update(req, res);
});

router.delete("/:id", async (req, res) => {
    await ProjectController.delete(req, res);
});

router.get("/get-projects/:group/:filter/:skipSelf", async (req, res) => {
    await ProjectController.getProjectsByUser(req, res);
});

router.get("/add-or-remove-project-member/:projectId/:add", async (req, res) => {
    await ProjectController.addOrRemoveProjectMember(req, res);
});


module.exports = router;