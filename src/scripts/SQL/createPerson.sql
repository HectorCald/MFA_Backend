 -- ========================================================
-- Tabla: person
-- Descripción: Almacena información básica de personas físicas
-- asociadas al sistema, como gerentes, responsables contables,
-- comerciales u otros roles vinculados a clientes empresariales.
-- como también el cliente directo(viajero)
-- Puede reutilizarse en otros contextos dentro del sistema.
-- ========================================================
 CREATE TABLE IF NOT EXISTS person (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dni VARCHAR(50) NOT NULL,
    dni_country_id UUID NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('M', 'F')),
    birthdate DATE NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    cellphone VARCHAR(30) NOT NULL,
    address TEXT NOT NULL,
    postal_code VARCHAR(10),
    country_id UUID NOT NULL,
    city_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID NULL,
    updated_at TIMESTAMP NULL,
    -- CONSTRAINTS
    CONSTRAINT uq_person_dni_country UNIQUE (dni, dni_country_id),
    CONSTRAINT uq_person_email UNIQUE (email),
    CONSTRAINT uq_person_cellphone UNIQUE (cellphone),
    CONSTRAINT fk_dni_country FOREIGN KEY (dni_country_id) REFERENCES country(id),
    CONSTRAINT fk_country FOREIGN KEY (country_id) REFERENCES country(id),
    CONSTRAINT fk_city FOREIGN KEY (city_id) REFERENCES city(id),
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES app_user(id),
    CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES app_user(id)
);