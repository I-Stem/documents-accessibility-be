// routes/contentRoutes.js

const express = require('express');
const router = express.Router();
const contentController = require('../controllers/opportunities.controller');

router.get('/get-html-content', contentController.getContentByTitleAndCategory);
router.get('/get-titles', contentController.getTitlesByCategoryAndRegions);
router.get('/search/get-titles', contentController.getTitleBySearch);
router.post('/get-html-content', contentController.getContentByHref);

module.exports = router;
