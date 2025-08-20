const { Router } = require('express');
const CityController = require('../controllers/cityController');

const router = Router();

/**
 * @route   GET /api/cities
 * @desc    Obtener todas las ciudades
 * @access  Public
 */
router.get('/', CityController.getAllCities);

/**
 * @route   GET /api/cities/:id
 * @desc    Obtener una ciudad por ID
 * @access  Public
 */
router.get('/:id', CityController.getCityById);

/**
 * @route   GET /api/cities/search
 * @desc    Buscar una ciudad por nombre
 * @access  Public
 */
router.get('/search', CityController.getCityByName);

/**
 * @route   GET /api/cities/code/:code
 * @desc    Buscar una ciudad por código
 * @access  Public
 */
router.get('/code/:code', CityController.getCityByCode);

/**
 * @route   GET /api/cities/country/:countryId
 * @desc    Buscar ciudades por ID de país
 * @access  Public
 */
router.get('/country/:countryId', CityController.getCityByCountryId);

module.exports = router; 