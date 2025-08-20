const express = require('express');
const router = express.Router();
const OfficeTypeController = require('../controllers/officeTypeController');

// Obtener todos los tipos de oficina
router.get('/', OfficeTypeController.getAllOfficeTypes);

// Obtener tipo de oficina por ID
router.get('/:id', OfficeTypeController.getOfficeTypeById);

module.exports = router;
