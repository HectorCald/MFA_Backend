const EventTypeModel = require('../models/eventTypeModel');

/**
 * Obtener todos los tipos de eventos activos
 */
async function getAllEventTypes(req, res) {
    try {
        const eventTypes = await EventTypeModel.findAllActive();
        res.json(eventTypes);
    } catch (error) {
        console.error('Error al obtener tipos de eventos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

/**
 * Obtener un tipo de evento por su código
 */
async function getEventTypeByCode(req, res) {
    try {
        const { code } = req.params;
        const eventType = await EventTypeModel.findByCode(code);
        
        if (!eventType) {
            return res.status(404).json({ message: 'Tipo de evento no encontrado' });
        }
        
        res.json(eventType);
    } catch (error) {
        console.error('Error al obtener tipo de evento por código:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

/**
 * Obtener un tipo de evento por su ID
 */
async function getEventTypeById(req, res) {
    try {
        const { id } = req.params;
        const eventType = await EventTypeModel.findById(id);
        
        if (!eventType) {
            return res.status(404).json({ message: 'Tipo de evento no encontrado' });
        }
        
        res.json(eventType);
    } catch (error) {
        console.error('Error al obtener tipo de evento por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

/**
 * Crear un nuevo tipo de evento
 */
async function createEventType(req, res) {
    try {
        const { code, name, created_by } = req.body;
        
        // Validaciones básicas
        if (!code || !name || !created_by) {
            return res.status(400).json({ 
                message: 'Todos los campos son requeridos: code, name, created_by' 
            });
        }
        
        const eventType = await EventTypeModel.create({ code, name, created_by });
        res.status(201).json(eventType);
    } catch (error) {
        console.error('Error al crear tipo de evento:', error);
        
        // Manejar error de código duplicado
        if (error.code === '23505') {
            return res.status(400).json({ message: 'El código ya existe' });
        }
        
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

/**
 * Actualizar un tipo de evento
 */
async function updateEventType(req, res) {
    try {
        const { id } = req.params;
        const { code, name, is_active } = req.body;
        
        // Validaciones básicas
        if (!code || !name) {
            return res.status(400).json({ 
                message: 'Los campos code y name son requeridos' 
            });
        }
        
        const eventType = await EventTypeModel.update(id, { code, name, is_active });
        
        if (!eventType) {
            return res.status(404).json({ message: 'Tipo de evento no encontrado' });
        }
        
        res.json(eventType);
    } catch (error) {
        console.error('Error al actualizar tipo de evento:', error);
        
        // Manejar error de código duplicado
        if (error.code === '23505') {
            return res.status(400).json({ message: 'El código ya existe' });
        }
        
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

/**
 * Desactivar un tipo de evento
 */
async function deactivateEventType(req, res) {
    try {
        const { id } = req.params;
        const eventType = await EventTypeModel.deactivate(id);
        
        if (!eventType) {
            return res.status(404).json({ message: 'Tipo de evento no encontrado' });
        }
        
        res.json({ message: 'Tipo de evento desactivado exitosamente' });
    } catch (error) {
        console.error('Error al desactivar tipo de evento:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

module.exports = {
    getAllEventTypes,
    getEventTypeByCode,
    getEventTypeById,
    createEventType,
    updateEventType,
    deactivateEventType
};
