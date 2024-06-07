const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/learning/learning-module.controller');

// Create a new module
router.post('/', async (req, res) => {
    await moduleController.createModule(req, res);
});


router.get('/', async (req, res) => {
    await moduleController.getAllModules(req, res);
});


router.get('/:id', async (req, res) => {
    await moduleController.getModulesByCourseId(req, res);
});




router.put('/:id', async (req, res) => {
    await moduleController.deleteModule(req, res);
});


router.delete('/:id', async (req, res) => {
    await moduleController.deleteModule(req, res);
});


router.get('/:moduleId/sections', async (req, res) => {
    await moduleController.getModuleSections(req, res);
});

module.exports = router;
