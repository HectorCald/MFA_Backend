-- ========================================================
-- Tabla: role_type
-- Descripción: Es un catálogo, para almacenar los diferentes 
-- tipos de roles que pueden ser asignados a los usuarios 
-- o entidades dentro del sistema.
-- no editable vía frontend.
-- ========================================================
CREATE TABLE IF NOT EXISTS role_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(40) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    -- Restricción de unicidad
    CONSTRAINT uq_role_type_name UNIQUE (name)
);

-- Insertar los tipos de roles básicos
INSERT INTO role_type (name) VALUES
    ('Gerente General'),
    ('Responsable de Oficina'),
    ('Agente'),
    ('Contacto Contable')
ON CONFLICT (name) DO NOTHING; 