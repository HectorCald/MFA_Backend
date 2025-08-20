const { Router } = require('express');
const CountryController = require('../controllers/countryController');

const router = Router();

/**
 * @route   GET /api/countries
 * @desc    Obtener todos los países
 * @access  Public
 */
router.get('/', CountryController.getAllCountries);

/**
 * @route   GET /api/countries/:id
 * @desc    Obtener un país por ID
 * @access  Public
 */
router.get('/:id', CountryController.getCountryById);

/**
 * @route   GET /api/countries/search
 * @desc    Buscar un país por nombre
 * @access  Public
 */
router.get('/search', CountryController.getCountryByName);

/**
 * @route   GET /api/countries/code/:code
 * @desc    Buscar un país por código
 * @access  Public
 */
router.get('/code/:code', CountryController.getCountryByCode);

module.exports = router; 