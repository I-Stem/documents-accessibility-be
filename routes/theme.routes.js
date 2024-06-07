const express = require("express");
const router = express.Router();
const ThemeController = require("../controllers/theme.controller");

router.post("/", async (req, res)=> {
        await ThemeController.create(req, res);
});

    router.get("/", async (req, res)=> {
await ThemeController.getAll(req, res);
    });

    router.get("/:id", async (req, res)=> {
        await ThemeController.getById(req, res);
    });

    router.put("/:id", async (req, res)=> {
        ThemeController.update(req, res);
    });

    router.delete("/:id", async (req, res)=> {
        await ThemeController.delete(req, res);
    });

module.exports = router;