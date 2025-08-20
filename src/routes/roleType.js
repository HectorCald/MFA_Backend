const { Router } = require('express');
const RoleTypeController = require('../controllers/roleTypeController');

const router = Router();

// Obtener todos los tipos de roles
router.get('/', RoleTypeController.getAllTypes);

// Obtener un tipo de rol por ID
router.get('/:id', RoleTypeController.getTypeById);

// Buscar un tipo de rol por nombre
router.get('/search', RoleTypeController.getTypeByName);

module.exports = router; 