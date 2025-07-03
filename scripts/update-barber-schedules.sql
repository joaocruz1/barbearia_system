-- Atualizar horários dos barbeiros com as novas localidades

-- Limpar horários existentes
DELETE FROM barber_schedules;

-- Bruno Souza - Rua 13 - Ouro Fino (Segunda a Sábado)
INSERT INTO barber_schedules (barber_id, location_id, week_day, start_time, end_time)
SELECT 
  (SELECT id FROM barbers WHERE name = 'Bruno Souza'),
  (SELECT id FROM locations WHERE name = 'Rua 13 - Ouro Fino'),
  generate_series(1, 6), -- Segunda a Sábado
  CASE 
    WHEN generate_series(1, 6) = 6 THEN '09:00'::time -- Sábado
    ELSE '09:00'::time -- Segunda a Sexta
  END,
  CASE 
    WHEN generate_series(1, 6) = 6 THEN '15:00'::time -- Sábado
    ELSE '19:00'::time -- Segunda a Sexta
  END;

-- Erick - Rua 13 - Ouro Fino (Segunda a Sábado)
INSERT INTO barber_schedules (barber_id, location_id, week_day, start_time, end_time)
SELECT 
  (SELECT id FROM barbers WHERE name = 'Erick'),
  (SELECT id FROM locations WHERE name = 'Rua 13 - Ouro Fino'),
  generate_series(1, 6), -- Segunda a Sábado
  CASE 
    WHEN generate_series(1, 6) = 5 THEN '08:00'::time -- Sexta
    WHEN generate_series(1, 6) = 6 THEN '08:00'::time -- Sábado
    ELSE '09:00'::time -- Segunda a Quinta
  END,
  CASE 
    WHEN generate_series(1, 6) = 6 THEN '15:00'::time -- Sábado
    ELSE '19:00'::time -- Segunda a Sexta
  END;

-- Ryan - Avenida - Ouro Fino (Segunda a Quinta) e Inconfidentes (Sexta e Sábado)
INSERT INTO barber_schedules (barber_id, location_id, week_day, start_time, end_time)
VALUES
  -- Avenida - Ouro Fino Segunda a Quinta
  ((SELECT id FROM barbers WHERE name = 'Ryan'), (SELECT id FROM locations WHERE name = 'Avenida - Ouro Fino'), 1, '09:00', '19:00'),
  ((SELECT id FROM barbers WHERE name = 'Ryan'), (SELECT id FROM locations WHERE name = 'Avenida - Ouro Fino'), 2, '09:00', '19:00'),
  ((SELECT id FROM barbers WHERE name = 'Ryan'), (SELECT id FROM locations WHERE name = 'Avenida - Ouro Fino'), 3, '09:00', '19:00'),
  ((SELECT id FROM barbers WHERE name = 'Ryan'), (SELECT id FROM locations WHERE name = 'Avenida - Ouro Fino'), 4, '09:00', '19:00'),
  -- Inconfidentes Sexta e Sábado
  ((SELECT id FROM barbers WHERE name = 'Ryan'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 5, '08:30', '19:00'),
  ((SELECT id FROM barbers WHERE name = 'Ryan'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 6, '07:30', '15:00');

-- Carlos - Inconfidentes (Segunda, Quarta, Sexta, Sábado) e Rua 13 - Ouro Fino (Terça, Quinta)
INSERT INTO barber_schedules (barber_id, location_id, week_day, start_time, end_time)
VALUES
  -- Inconfidentes
  ((SELECT id FROM barbers WHERE name = 'Carlos'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 1, '09:00', '19:00'),
  ((SELECT id FROM barbers WHERE name = 'Carlos'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 3, '09:00', '19:00'),
  ((SELECT id FROM barbers WHERE name = 'Carlos'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 5, '09:00', '19:00'),
  ((SELECT id FROM barbers WHERE name = 'Carlos'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 6, '09:00', '15:00'),
  -- Rua 13 - Ouro Fino
  ((SELECT id FROM barbers WHERE name = 'Carlos'), (SELECT id FROM locations WHERE name = 'Rua 13 - Ouro Fino'), 2, '09:00', '19:00'),
  ((SELECT id FROM barbers WHERE name = 'Carlos'), (SELECT id FROM locations WHERE name = 'Rua 13 - Ouro Fino'), 4, '09:00', '19:00');

-- Julio - Inconfidentes (Segunda a Quinta) e Rua 13 - Ouro Fino (Sexta, Sábado)
INSERT INTO barber_schedules (barber_id, location_id, week_day, start_time, end_time)
VALUES
  -- Inconfidentes Segunda a Quinta
  ((SELECT id FROM barbers WHERE name = 'Julio'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 1, '09:00', '19:00'),
  ((SELECT id FROM barbers WHERE name = 'Julio'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 2, '09:00', '19:00'),
  ((SELECT id FROM barbers WHERE name = 'Julio'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 3, '09:00', '19:00'),
  ((SELECT id FROM barbers WHERE name = 'Julio'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 4, '09:00', '19:00'),
  -- Rua 13 - Ouro Fino Sexta e Sábado
  ((SELECT id FROM barbers WHERE name = 'Julio'), (SELECT id FROM locations WHERE name = 'Rua 13 - Ouro Fino'), 5, '09:00', '19:00'),
  ((SELECT id FROM barbers WHERE name = 'Julio'), (SELECT id FROM locations WHERE name = 'Rua 13 - Ouro Fino'), 6, '09:00', '15:00');

-- Faguinho - Inconfidentes (Terça, Quinta), Rua 13 - Ouro Fino (Quarta), Avenida - Ouro Fino (Sexta, Sábado)
INSERT INTO barber_schedules (barber_id, location_id, week_day, start_time, end_time)
VALUES
  -- Inconfidentes
  ((SELECT id FROM barbers WHERE name = 'Faguinho'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 2, '09:00', '19:00'),
  ((SELECT id FROM barbers WHERE name = 'Faguinho'), (SELECT id FROM locations WHERE name = 'Inconfidentes'), 4, '09:00', '19:00'),
  -- Rua 13 - Ouro Fino
  ((SELECT id FROM barbers WHERE name = 'Faguinho'), (SELECT id FROM locations WHERE name = 'Rua 13 - Ouro Fino'), 3, '09:00', '19:00'),
  -- Avenida - Ouro Fino
  ((SELECT id FROM barbers WHERE name = 'Faguinho'), (SELECT id FROM locations WHERE name = 'Avenida - Ouro Fino'), 5, '09:00', '19:00'),
  ((SELECT id FROM barbers WHERE name = 'Faguinho'), (SELECT id FROM locations WHERE name = 'Avenida - Ouro Fino'), 6, '09:00', '15:00');

-- Joilton - Avenida - Ouro Fino (Segunda a Sábado)
INSERT INTO barber_schedules (barber_id, location_id, week_day, start_time, end_time)
SELECT 
  (SELECT id FROM barbers WHERE name = 'Joilton'),
  (SELECT id FROM locations WHERE name = 'Avenida - Ouro Fino'),
  generate_series(1, 6), -- Segunda a Sábado
  '09:00'::time,
  CASE 
    WHEN generate_series(1, 6) = 6 THEN '15:00'::time -- Sábado
    ELSE '19:00'::time -- Segunda a Sexta
  END;
