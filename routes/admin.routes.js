const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/admin/admin.controller");

router.patch("/approve-or-disapprove-post", async(req, res)=> {
await AdminController.approveOrDisapprovePost(req, res);
});

module.exports = router;