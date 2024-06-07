const express = require("express");
const router = express.Router();
const autotagPDFController = require('../controllers/autotag.controller');

router.post('/pdf', autotagPDFController.create);
router.get('/pdf/:id', autotagPDFController.getById);
router.put('/pdf/:id', autotagPDFController.update);
router.delete('/pdf/:id', autotagPDFController.delete);
router.post('/pdf/compareFileHash',autotagPDFController.compareFileHash)

router.get('/user/:userId/pdf',autotagPDFController.getAllPDFsByUserId)

router.post('/whatsapp', autotagPDFController.whatsappCreate);
router.get('/whatsapp/:userId',autotagPDFController.getAllPDFsByWhatsappNumber)
router.post('/whatsapp/compareFileHash',autotagPDFController.whatsappCompareFileHash)
// router.get('/pdf/user/:userId', autotagPDFController.getAllAutotagPDFsByUserId);
// router.delete('/pdf/:id', autotagPDFController.deleteAutotagPDF);
module.exports=router;