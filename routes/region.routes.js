const express = require("express");
const router = express.Router();
const RegionController = require("../controllers/region.controller");

router.post("/", async (req, res)=> {
        await RegionController.create(req, res);
});

    router.get("/", async (req, res)=> {
await RegionController.getAll(req, res);
    });

    router.get("/:id", async (req, res)=> {
        await RegionController.getById(req, res);
    });

    router.put("/:id", async (req, res)=> {
        RegionController.update(req, res);
    });

    router.delete("/:id", async (req, res)=> {
        await RegionController.delete(req, res);
    });

module.exports = router;