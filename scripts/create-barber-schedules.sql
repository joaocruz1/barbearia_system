-- Apaga todos os agendamentos existentes para evitar duplicatas
TRUNCATE TABLE barber_schedules RESTART IDENTITY;

-- Inserir horários dos barbeiros baseado no rodízio informado

-- Bruno Souza - Rua 13 (Segunda a Sábado)
INSERT INTO barber_schedules (barber_id, location_id, week_day, start_time, end_time)
SELECT
    (SELECT id FROM barbers WHERE name = 'Bruno Souza'),
    (SELECT id FROM locations WHERE name = 'Rua 13'),
    days.week_day,
    '09:00'::time, -- Horário de início é o mesmo para todos os dias
    CASE
        WHEN days.week_day = 6 THEN '15:00'::time -- Sábado
        ELSE '19:00'::time -- Segunda a Sexta
    END
FROM generate_series(1, 6) AS days(week_day);

-- Erick - Rua 13 (Segunda a Sábado)
INSERT INTO barber_schedules (barber_id, location_id, week_day, start_time, end_time)
SELECT
    (SELECT id FROM barbers WHERE name = 'Erick'),
    (SELECT id FROM locations WHERE name = 'Rua 13'),
    days.week_day,
    CASE
        WHEN days.week_day >= 5 THEN '08:00'::time -- Sexta e Sábado
        ELSE '09:00'::time -- Segunda a Quinta
    END,
    CASE
        WHEN days.week_day = 6 THEN '15:00'::time -- Sábado
        ELSE '19:00'::time -- Segunda a Sexta
    END
FROM generate_series(1, 6) AS days(week_day);

-- Ryan - Avenida (Segunda a Quinta) e Inconfidentes (Sexta e Sábado)
INSERT INTO barber_schedules (barber_id, location_id, week_day, start_time, end_time) VALUES
    -- Avenida (Segunda a Quinta)
    ((SELECT id FROM barbers WHERE name = 'Ryan'), (SELECT id FROM locations WHERE name = 'Avenida'), 1, '09:00', '19:00'),
    ((SELECT id FROM barbers WHERE name = 'Ryan'), (SELECT id FROM locations WHERE name = 'Avenida'), 2, '09:00', '19:00'),
    ((SELECT id FROM barbers WHERE name = 'Ryan'), (SELECT id FROM locations WHERE name = 'Avenida'), 3, '09:00', '19:00'),
    ((SELECT id FROM barbers WHERE name = 'Ryan'), (SELECT id FROM locations WHERE name = 'Avenida'), 4, '09:00', '19:00'),
    -- Inconfidentes (Sexta e Sábado)
    ((SELECT id FROM barbers WHERE name = 'Ryan'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 5, '08:30', '19:00'),
    ((SELECT id FROM barbers WHERE name = 'Ryan'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 6, '07:30', '15:00');

-- Carlos - Inconfidentes (Segunda, Quarta, Sexta, Sábado) e Rua 13 (Terça, Quinta)
INSERT INTO barber_schedules (barber_id, location_id, week_day, start_time, end_time) VALUES
    -- Inconfidentes
    ((SELECT id FROM barbers WHERE name = 'Carlos'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 1, '09:00', '19:00'),
    ((SELECT id FROM barbers WHERE name = 'Carlos'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 3, '09:00', '19:00'),
    ((SELECT id FROM barbers WHERE name = 'Carlos'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 5, '09:00', '19:00'),
    ((SELECT id FROM barbers WHERE name = 'Carlos'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 6, '09:00', '15:00'),
    -- Rua 13
    ((SELECT id FROM barbers WHERE name = 'Carlos'), (SELECT id FROM locations WHERE name = 'Rua 13'), 2, '09:00', '19:00'),
    ((SELECT id FROM barbers WHERE name = 'Carlos'), (SELECT id FROM locations WHERE name = 'Rua 13'), 4, '09:00', '19:00');

-- Julio - Inconfidentes (Segunda a Quinta) e Rua 13 (Sexta, Sábado)
INSERT INTO barber_schedules (barber_id, location_id, week_day, start_time, end_time) VALUES
    -- Inconfidentes (Segunda a Quinta)
    ((SELECT id FROM barbers WHERE name = 'Julio'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 1, '09:00', '19:00'),
    ((SELECT id FROM barbers WHERE name = 'Julio'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 2, '09:00', '19:00'),
    ((SELECT id FROM barbers WHERE name = 'Julio'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 3, '09:00', '19:00'),
    ((SELECT id FROM barbers WHERE name = 'Julio'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 4, '09:00', '19:00'),
    -- Rua 13 (Sexta e Sábado)
    ((SELECT id FROM barbers WHERE name = 'Julio'), (SELECT id FROM locations WHERE name = 'Rua 13'), 5, '09:00', '19:00'),
    ((SELECT id FROM barbers WHERE name = 'Julio'), (SELECT id FROM locations WHERE name = 'Rua 13'), 6, '09:00', '15:00');

-- Faguinho - Inconfidentes (Terça, Quinta), Rua 13 (Quarta), Avenida (Sexta, Sábado)
INSERT INTO barber_schedules (barber_id, location_id, week_day, start_time, end_time) VALUES
    -- Inconfidentes
    ((SELECT id FROM barbers WHERE name = 'Faguinho'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 2, '09:00', '19:00'),
    ((SELECT id FROM barbers WHERE name = 'Faguinho'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 4, '09:00', '19:00'),
    -- Rua 13
    ((SELECT id FROM barbers WHERE name = 'Faguinho'), (SELECT id FROM locations WHERE name = 'Rua 13'), 3, '09:00', '19:00'),
    -- Avenida
    ((SELECT id FROM barbers WHERE name = 'Faguinho'), (SELECT id FROM locations WHERE name = 'Avenida'), 5, '09:00', '19:00'),
    ((SELECT id FROM barbers WHERE name = 'Faguinho'), (SELECT id FROM locations WHERE name = 'Avenida'), 6, '09:00', '15:00');

-- Joilton - Avenida (Segunda a Sábado)
INSERT INTO barber_schedules (barber_id, location_id, week_day, start_time, end_time)
SELECT
    (SELECT id FROM barbers WHERE name = 'Joilton'),
    (SELECT id FROM locations WHERE name = 'Avenida'),
    days.week_day,
    '09:00'::time,
    CASE
        WHEN days.week_day = 6 THEN '15:00'::time -- Sábado
        ELSE '19:00'::time -- Segunda a Sexta
    END
FROM generate_series(1, 6) AS days(week_day);