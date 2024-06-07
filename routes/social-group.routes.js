const express = require("express");
const router = express.Router();
const SocialGroupController = require("../controllers/social-group/social-group.controller");
const { decodeJWT } = require("../helpers/jwt");

router.post("/", async (req, res) => {
    await SocialGroupController.create(req, res);
});

router.get("/", async (req, res) => {
    await SocialGroupController.getAll(req, res);
});

router.get("/:id", async (req, res) => {
    await SocialGroupController.getById(req, res);
});

router.put("/:id", async (req, res) => {
    SocialGroupController.update(req, res);
});

router.delete("/:id", async (req, res) => {
    await SocialGroupController.delete(req, res);
});

router.get("/get-social-groups/:filter/:skipSelf", async (req, res) => {
    await SocialGroupController.getSocialGroupsByUser(req, res);
});

router.get("/add-or-remove-group-member/:groupId/:add", async (req, res) => {
    await SocialGroupController.addOrRemoveGroupMember(req, res);
});

router.post("/:groupId/pending-members",async(req,res)=>{
    await SocialGroupController.addPendingMember(req,res);
})
router.get("/:groupId/pending-members",async(req,res)=>{
    await SocialGroupController.getPendingMembers(req,res);
})
router.delete("/:groupId/pending-members", async (req, res) => {
    await SocialGroupController.removePendingMember(req, res);
});
  

router.post("/admin-add-or-remove-group-member", async (req, res) => {
    await SocialGroupController.adminAddOrRemoveGroupMember(req, res);
});

router.get("/get-all-un-connect-groups", async (req, res) => {
    await SocialGroupController.getAllUnConnectGroups(req, res);
});

router.get("/get-un-connect-groups/:filter/:skipSelf", async (req, res) => {
    await SocialGroupController.getUnConnectGroupsByUser(req, res);
});

module.exports = router;