-- ======================================
-- Tabla app_user_role
-- ======================================
CREATE TABLE IF NOT EXISTS app_user_role (
    app_user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Fecha creación
    created_by UUID NOT NULL, -- Quién creó
    -- Clave primaria compuesta para asegurar la unicidad de la relación
    PRIMARY KEY (app_user_id, role_id),
    -- Foreign Keys
    CONSTRAINT fk_app_user_role_app_user FOREIGN KEY (app_user_id) REFERENCES app_user(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_app_user_role_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_app_user_role_created_by FOREIGN KEY (created_by) REFERENCES app_user(id) ON DELETE RESTRICT ON UPDATE CASCADE
  );