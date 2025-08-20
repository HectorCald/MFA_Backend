-- ========================================================
-- Tabla: office_type
-- Descripción: Define los tipos posibles de oficinas de clientes
-- empresariales (ej: principal, sucursal).
-- Tabla auxiliar estática, gestionada desde base de datos.
-- no editable vía frontend.
-- ========================================================
CREATE TABLE IF NOT EXISTS office_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Insertar tipos básicos de oficina
INSERT INTO office_type (name) VALUES 
    ('Principal'),
    ('Sucursal'),
    ('Agencia'),
    ('Oficina Regional')
ON CONFLICT (name) DO NOTHING; 