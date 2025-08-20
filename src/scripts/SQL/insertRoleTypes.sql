-- ========================================================
-- Script: insertRoleTypes.sql
-- Descripción: Inserta los tipos de roles básicos en la tabla role_type
-- ========================================================

-- Insertar los tipos de roles básicos si no existen
INSERT INTO role_type (name) VALUES
    ('Gerente General'),
    ('Responsable de Oficina'),
    ('Agente'),
    ('Contacto Contable')
ON CONFLICT (name) DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT * FROM role_type WHERE is_active = true ORDER BY name; 