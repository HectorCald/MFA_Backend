-- ======================================
-- Tabla: app_user
-- ======================================
CREATE TABLE IF NOT EXISTS app_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Identificador único
    person_id UUID NOT NULL UNIQUE,                -- FK hacia la tabla person
    password_hash VARCHAR(250) NOT NULL,           -- Hash seguro de contraseña
    user_type VARCHAR(10) NOT NULL DEFAULT 'externo', -- interno o externo
    is_active BOOLEAN NOT NULL DEFAULT TRUE,       -- Estado de cuenta
    last_login_at TIMESTAMPTZ,                     -- Útima vez que ingresó
    failed_login_attempts SMALLINT NOT NULL DEFAULT 0 CHECK (failed_login_attempts >= 0),-- Cantidad de intentos de ingreso
    last_failed_login_at TIMESTAMPTZ,               -- Último intento fallido
    blocked_until TIMESTAMPTZ,                      -- Fecha/hora de desbloqueo
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE, -- Forzar cambio de contraseña
    password_updated_at TIMESTAMPTZ,                      -- Última vez que se cambió contraseña
    legacy_username VARCHAR(50),                  -- Username del sistema anterior (opcional)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Fecha creación
    updated_at TIMESTAMPTZ DEFAULT NOW(), -- Fecha última actualización
    created_by UUID NOT NULL, -- Quién creó
    updated_by UUID, -- Quién actualizó
    CONSTRAINT fk_user_person
        FOREIGN KEY (person_id) REFERENCES person(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_user_created_by
        FOREIGN KEY (created_by) REFERENCES app_user(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_user_updated_by
        FOREIGN KEY (updated_by) REFERENCES app_user(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_user_type 
        CHECK (user_type IN ('interno', 'externo')
);
-- ======================================
-- Índices recomendados
-- ======================================
-- Búsquedas rápidas por bloqueo
CREATE INDEX idx_app_user_blocked_until ON app_user(blocked_until);
-- Búsquedas rápidas por actividad
CREATE INDEX idx_app_user_is_active ON app_user(is_active);
-- Últimos intentos fallidos (para reportes/seguridad)
CREATE INDEX idx_app_user_last_failed_login_at ON app_user(last_failed_login_at);