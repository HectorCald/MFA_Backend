const express = require('express');
const router = express.Router();
const OfficeController = require('../controllers/officeController');

// Obtener todas las oficinas
router.get('/', OfficeController.getAllOffices);

// Obtener oficina por ID
router.get('/:id', OfficeController.getOfficeById);

// Obtener oficinas por cliente empresarial
router.get('/client/:clientId', OfficeController.getOfficesByBusinessClientId);

// Obtener roles de una oficina específica
router.get('/:officeId/roles/:businessClientId', OfficeController.getOfficeRoles);

// Obtener conteo de oficinas por cliente
router.get('/client/:clientId/count', OfficeController.getOfficeCountByBusinessClientId);

// Crear nueva oficina
router.post('/', OfficeController.createOffice);

// Actualizar oficina
router.put('/:officeId', OfficeController.updateOffice);

// Desactivar oficina
router.delete('/:id', OfficeController.deactivateOffice);

// Asignar rol de persona en una oficina
router.post('/assign-role', OfficeController.assignPersonRole);

module.exports = router;

