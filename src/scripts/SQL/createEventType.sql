-- ============================================
-- Tabla para estandarizar los tipos de eventos de auditoría
-- ============================================
CREATE TABLE IF NOT EXISTS event_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- El código interno para el evento (ej: 'inicio_sesion')
    code VARCHAR(50) UNIQUE NOT NULL,
    -- El nombre legible para el usuario (ej: 'Inicio de sesión')
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Fecha de creación
    created_by UUID NOT NULL, -- Quién creó
    CONSTRAINT fk_event_type_created_by
        FOREIGN KEY (created_by) REFERENCES app_user(id) ON DELETE RESTRICT ON UPDATE CASCADE
);