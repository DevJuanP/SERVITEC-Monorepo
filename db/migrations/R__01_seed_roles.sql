INSERT INTO roles (id, nombre, descripcion) VALUES
    (1, 'admin',   'Administrador'),
    (2, 'asesor',  'Asesor técnico'),
    (3, 'cliente', 'Cliente final')
ON CONFLICT (id) DO UPDATE
    SET nombre = EXCLUDED.nombre,
        descripcion = EXCLUDED.descripcion;

SELECT setval(pg_get_serial_sequence('roles', 'id'), (SELECT max(id) FROM roles));
