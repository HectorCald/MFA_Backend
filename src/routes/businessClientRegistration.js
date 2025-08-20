const { Router } = require('express');
const BusinessClientRegistrationController = require('../controllers/businessClientRegistrationController');

const router = Router();

// Ruta para registrar un cliente empresarial completo
router.post('/register', BusinessClientRegistrationController.registerCompleteBusinessClient);

// Ruta para obtener todos los clientes empresariales
router.get('/all', BusinessClientRegistrationController.getAllBusinessClients);

// Ruta para obtener un cliente empresarial por ID
router.get('/:id', BusinessClientRegistrationController.getBusinessClientById);

// Ruta para actualizar un cliente empresarial
router.put('/:id', BusinessClientRegistrationController.updateBusinessClient);

// Ruta para eliminar un cliente empresarial
router.delete('/:id', BusinessClientRegistrationController.deleteBusinessClient);

// Ruta para validar duplicados
router.post('/validate-duplicate', BusinessClientRegistrationController.validateDuplicate);

module.exports = router;