const { Router } = require('express');
const BusinessClientTypeController = require('../controllers/businessClientTypeController');

const router = Router();

/**
 * @route   GET /api/business-client-types
 * @desc    Obtener todos los tipos de clientes empresariales
 * @access  Public
 */
router.get('/', BusinessClientTypeController.getAllTypes);

/**
 * @route   GET /api/business-client-types/:id
 * @desc    Obtener un tipo de cliente por ID
 * @access  Public
 */
router.get('/:id', BusinessClientTypeController.getTypeById);

/**
 * @route   GET /api/business-client-types/search
 * @desc    Buscar un tipo de cliente por nombre
 * @access  Public
 */
router.get('/search', BusinessClientTypeController.getTypeByName);

module.exports = router; 