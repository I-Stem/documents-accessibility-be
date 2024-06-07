const express = require("express");
const router = express.Router();
const TestController = require("../controllers/test.controller");

router.post("/", async (req, res)=> {
        await TestController.create(req, res);
});

    router.get("/", async (req, res)=> {
await TestController.getAll(req, res);
    });

    router.get("/:id", async (req, res)=> {
        await TestController.getById(req, res);
    });

    router.put("/:id", async (req, res)=> {
        TestController.update(req, res);
    });

    router.delete("/:id", async (req, res)=> {
        await TestController.delete(req, res);
    });

module.exports = router;