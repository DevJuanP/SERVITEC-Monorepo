INSERT INTO usuarios (nombre, apellido, correo, telefono, password, rol_id, activo) VALUES
    ('Administrador Servitec', 'Central',      'admin@servitec.pe',   '999000000', '$2b$10$kuFmWAFOsZQCCDpoUJ7f6OJEExwA/VtgxDnBkmMiKphs3QWX1270u', 1, true),
    ('Ana Quispe',             'Quispe',       'asesor@servitec.pe',  '999111111', '$2b$10$kuFmWAFOsZQCCDpoUJ7f6OJEExwA/VtgxDnBkmMiKphs3QWX1270u', 2, true),
    ('Luis Rojas',             'Rojas',        'asesor2@servitec.pe', '999222222', '$2b$10$kuFmWAFOsZQCCDpoUJ7f6OJEExwA/VtgxDnBkmMiKphs3QWX1270u', 2, true),
    ('María Torres',           'Torres',       'asesor3@servitec.pe', '999333333', '$2b$10$kuFmWAFOsZQCCDpoUJ7f6OJEExwA/VtgxDnBkmMiKphs3QWX1270u', 2, true),
    ('Juan Pérez',             'Pérez Gómez',  'cliente@servitec.pe', '999888777', '$2b$10$kuFmWAFOsZQCCDpoUJ7f6OJEExwA/VtgxDnBkmMiKphs3QWX1270u', 3, true)
ON CONFLICT (correo) DO UPDATE
    SET nombre   = EXCLUDED.nombre,
        apellido = EXCLUDED.apellido,
        telefono = EXCLUDED.telefono,
        password = EXCLUDED.password,
        rol_id   = EXCLUDED.rol_id,
        activo   = EXCLUDED.activo;
