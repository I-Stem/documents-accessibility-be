const express = require("express");
const router = express.Router();
const CountryController = require("../controllers/country.controller");

router.post("/", async (req, res)=> {
        await CountryController.create(req, res);
});

    router.get("/", async (req, res)=> {
await CountryController.getAll(req, res);
    });

    router.get("/:id", async (req, res)=> {
        await CountryController.getById(req, res);
    });

    router.put("/:id", async (req, res)=> {
        CountryController.update(req, res);
    });

    router.delete("/:id", async (req, res)=> {
        await CountryController.delete(req, res);
    });

module.exports = router;