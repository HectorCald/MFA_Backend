-- ============================================
-- Tabla: audit_log
-- Descripción:
--   Registra eventos de auditoría del sistema, incluyendo
--   inicios de sesión, modificaciones de datos y bloqueos.
--   Incluye referencias al usuario que es objeto del evento
--   (app_user_id) y al usuario que ejecuta la acción
--   (performed_by).
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- El usuario que es objeto de la auditoría.
    app_user_id UUID NOT NULL,
    -- El usuario que realizó la acción.
    performed_by_id UUID NOT NULL,
    -- Fecha y hora del evento, para la columna "Fecha/Hora".
    event_date_id TIMESTAMPTZ NOT NULL,
    -- Clave foránea a la tabla event_type, para la columna "Evento".
    event_type_id UUID NOT NULL,
    -- Tabla sobre la que se hizo el evento, para la columna "Tabla".
    table_name VARCHAR(50),
    record_id UUID NOT NULL, 
    -- Campo JSONB para los detalles y cambios, para la columna "Detalles/Cambios".
    -- Almacena información como la IP, cambios de datos, etc.
    event_details JSONB,
    -- Definición de las claves foráneas con nombres explícitos
    CONSTRAINT fk_audit_log_user FOREIGN KEY (app_user_id) REFERENCES app_user(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_audit_log_performed_by FOREIGN KEY (performed_by_id) REFERENCES app_user(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_audit_log_event_type FOREIGN KEY (event_type_id) REFERENCES event_type(id)
);
-- Índices para mejorar la velocidad de búsqueda
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(app_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_by_id ON audit_log(performed_by_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_event_type_id ON audit_log(event_type_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_event_date ON audit_log(event_date_id);