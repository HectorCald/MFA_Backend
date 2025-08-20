-- ======================================
-- Tabla menu
-- ======================================
CREATE TABLE IF NOT EXISTS menu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Código único para el menú, ideal para referencias en el código.
    code VARCHAR(50) UNIQUE NOT NULL,
    -- Nombre legible para el usuario.
    name VARCHAR(100) NOT NULL,
    -- ID del menú padre si es un submenú.
    parent_id UUID,
    path TEXT,
    icon VARCHAR(50),
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Fecha creación
    updated_at TIMESTAMPTZ DEFAULT NOW(), -- Fecha última actualización
    created_by UUID NOT NULL, -- Quién creó
    updated_by UUID, -- Quién actualizó
    -- CONSTRAINTS
    CONSTRAINT fk_menu_parent
          FOREIGN KEY (parent_id) REFERENCES menu(id) ON DELETE RESTRICT ON UPDATE CASCADE, 
    CONSTRAINT fk_menu_created_by 
         FOREIGN KEY (created_by) REFERENCES app_user(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_menu_updated_by 
        FOREIGN KEY (updated_by) REFERENCES app_user(id) ON DELETE RESTRICT ON UPDATE CASCADE
);