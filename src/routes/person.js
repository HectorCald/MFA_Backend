const PersonController = require('../controllers/personController');
const express = require('express');
const router = express.Router();

// Crear nueva persona
router.post('/', PersonController.createPerson);

// Obtener todas las personas
router.get('/', PersonController.getAllPersons);

// Obtener personas por cliente empresarial
router.get('/business-client/:businessClientId', PersonController.getPersonsByBusinessClientId);

// Buscar personas por diferentes criterios
router.get('/search', PersonController.searchPersons);

// Obtener persona por ID
router.get('/:id', PersonController.getPersonById);

module.exports = router;
