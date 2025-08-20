const RoleController = require('../controllers/roleController');
const express = require('express');
const router = express.Router();

// rutas para obtener todos los roles
router.get('/', RoleController.getAllRoles);

// ruta para verificar si existe un código de rol
router.get('/check-code/:code', RoleController.codeExists);

// ruta para verificar si existe un nombre de rol
router.get('/check-name/:name', RoleController.checkNameExists);

// ruta para crear un nuevo rol
router.post('/', RoleController.createRole);

// ruta para actualizar un rol existente
router.put('/:id', RoleController.updateRole);

// ruta para cambiar estado activo/inactivo de un rol
router.patch('/:id/toggle-status', RoleController.toggleRoleStatus);

// ruta para eliminar un rol
router.delete('/:id', RoleController.deleteRole);

// ruta para obtener información completa de un rol por ID
router.get('/:id', RoleController.getRoleById);


module.exports = router;