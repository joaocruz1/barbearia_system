-- Script para atualizar os horários dos barbeiros com os IDs atuais
-- Apaga todos os agendamentos existentes para evitar duplicatas
TRUNCATE TABLE barber_schedules RESTART IDENTITY;

-- Inserir horários dos barbeiros baseado no rodízio informado

-- Bruno Souza - Rua 13 (Segunda a Sábado)
-- ID: 25aad185-561b-4ec0-a570-a6d35d513868
-- Localização: Rua 13 - Ouro Fino (8cecb648-ad70-433a-9841-1717e2b0fac1)
INSERT INTO barber_schedules (id, barber_id, location_id, week_day, start_time, end_time)
SELECT
    gen_random_uuid(),
    '25aad185-561b-4ec0-a570-a6d35d513868',
    '8cecb648-ad70-433a-9841-1717e2b0fac1',
    days.week_day,
    '09:00'::time, -- Horário de início é o mesmo para todos os dias
    CASE
        WHEN days.week_day = 6 THEN '15:00'::time -- Sábado
        ELSE '19:00'::time -- Segunda a Sexta
    END
FROM generate_series(1, 6) AS days(week_day);

-- Erick - Rua 13 (Segunda a Sábado)
-- ID: f9d29449-bec9-4499-83e8-3ce8b1f4078d
-- Localização: Rua 13 - Ouro Fino (8cecb648-ad70-433a-9841-1717e2b0fac1)
INSERT INTO barber_schedules (id, barber_id, location_id, week_day, start_time, end_time)
SELECT
    gen_random_uuid(),
    'f9d29449-bec9-4499-83e8-3ce8b1f4078d',
    '8cecb648-ad70-433a-9841-1717e2b0fac1',
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
-- ID: e4541de6-7803-4474-9ed1-1ce6efbf591d
-- Localizações: Avenida (bf844af4-e283-4600-8241-29a5fead8f18), Inconfidentes (df88109a-0005-41f0-a7cc-feb19540d280)
INSERT INTO barber_schedules (id, barber_id, location_id, week_day, start_time, end_time) VALUES
    -- Avenida (Segunda a Quinta)
    (gen_random_uuid(), 'e4541de6-7803-4474-9ed1-1ce6efbf591d', 'bf844af4-e283-4600-8241-29a5fead8f18', 1, '09:00', '19:00'),
    (gen_random_uuid(), 'e4541de6-7803-4474-9ed1-1ce6efbf591d', 'bf844af4-e283-4600-8241-29a5fead8f18', 2, '09:00', '19:00'),
    (gen_random_uuid(), 'e4541de6-7803-4474-9ed1-1ce6efbf591d', 'bf844af4-e283-4600-8241-29a5fead8f18', 3, '09:00', '19:00'),
    (gen_random_uuid(), 'e4541de6-7803-4474-9ed1-1ce6efbf591d', 'bf844af4-e283-4600-8241-29a5fead8f18', 4, '09:00', '19:00'),
    -- Inconfidentes (Sexta e Sábado)
    (gen_random_uuid(), 'e4541de6-7803-4474-9ed1-1ce6efbf591d', 'df88109a-0005-41f0-a7cc-feb19540d280', 5, '08:30', '19:00'),
    (gen_random_uuid(), 'e4541de6-7803-4474-9ed1-1ce6efbf591d', 'df88109a-0005-41f0-a7cc-feb19540d280', 6, '07:30', '15:00');

-- Carlos - Inconfidentes (Segunda, Quarta, Sexta, Sábado) e Rua 13 (Terça, Quinta)
-- ID: 524995f1-9827-4fba-804f-e965c8425bc2
-- Localizações: Inconfidentes (df88109a-0005-41f0-a7cc-feb19540d280), Rua 13 (8cecb648-ad70-433a-9841-1717e2b0fac1)
INSERT INTO barber_schedules (id, barber_id, location_id, week_day, start_time, end_time) VALUES
    -- Inconfidentes
    (gen_random_uuid(), '524995f1-9827-4fba-804f-e965c8425bc2', 'df88109a-0005-41f0-a7cc-feb19540d280', 1, '09:00', '19:00'),
    (gen_random_uuid(), '524995f1-9827-4fba-804f-e965c8425bc2', 'df88109a-0005-41f0-a7cc-feb19540d280', 3, '09:00', '19:00'),
    (gen_random_uuid(), '524995f1-9827-4fba-804f-e965c8425bc2', 'df88109a-0005-41f0-a7cc-feb19540d280', 5, '09:00', '19:00'),
    (gen_random_uuid(), '524995f1-9827-4fba-804f-e965c8425bc2', 'df88109a-0005-41f0-a7cc-feb19540d280', 6, '09:00', '15:00'),
    -- Rua 13
    (gen_random_uuid(), '524995f1-9827-4fba-804f-e965c8425bc2', '8cecb648-ad70-433a-9841-1717e2b0fac1', 2, '09:00', '19:00'),
    (gen_random_uuid(), '524995f1-9827-4fba-804f-e965c8425bc2', '8cecb648-ad70-433a-9841-1717e2b0fac1', 4, '09:00', '19:00');

-- Julio - Inconfidentes (Segunda a Quinta) e Rua 13 (Sexta, Sábado)
-- ID: b6640820-5082-4a35-bf03-c9bb70ca280d
-- Localizações: Inconfidentes (df88109a-0005-41f0-a7cc-feb19540d280), Rua 13 (8cecb648-ad70-433a-9841-1717e2b0fac1)
INSERT INTO barber_schedules (id, barber_id, location_id, week_day, start_time, end_time) VALUES
    -- Inconfidentes (Segunda a Quinta)
    (gen_random_uuid(), 'b6640820-5082-4a35-bf03-c9bb70ca280d', 'df88109a-0005-41f0-a7cc-feb19540d280', 1, '09:00', '19:00'),
    (gen_random_uuid(), 'b6640820-5082-4a35-bf03-c9bb70ca280d', 'df88109a-0005-41f0-a7cc-feb19540d280', 2, '09:00', '19:00'),
    (gen_random_uuid(), 'b6640820-5082-4a35-bf03-c9bb70ca280d', 'df88109a-0005-41f0-a7cc-feb19540d280', 3, '09:00', '19:00'),
    (gen_random_uuid(), 'b6640820-5082-4a35-bf03-c9bb70ca280d', 'df88109a-0005-41f0-a7cc-feb19540d280', 4, '09:00', '19:00'),
    -- Rua 13 (Sexta e Sábado)
    (gen_random_uuid(), 'b6640820-5082-4a35-bf03-c9bb70ca280d', '8cecb648-ad70-433a-9841-1717e2b0fac1', 5, '09:00', '19:00'),
    (gen_random_uuid(), 'b6640820-5082-4a35-bf03-c9bb70ca280d', '8cecb648-ad70-433a-9841-1717e2b0fac1', 6, '09:00', '15:00');

-- Faguinho - Inconfidentes (Terça, Quinta), Rua 13 (Quarta), Avenida (Sexta, Sábado)
-- ID: 4684fd88-1307-45a1-918c-cf74879d90c9
-- Localizações: Inconfidentes (df88109a-0005-41f0-a7cc-feb19540d280), Rua 13 (8cecb648-ad70-433a-9841-1717e2b0fac1), Avenida (bf844af4-e283-4600-8241-29a5fead8f18)
INSERT INTO barber_schedules (id, barber_id, location_id, week_day, start_time, end_time) VALUES
    -- Inconfidentes
    (gen_random_uuid(), '4684fd88-1307-45a1-918c-cf74879d90c9', 'df88109a-0005-41f0-a7cc-feb19540d280', 2, '09:00', '19:00'),
    (gen_random_uuid(), '4684fd88-1307-45a1-918c-cf74879d90c9', 'df88109a-0005-41f0-a7cc-feb19540d280', 4, '09:00', '19:00'),
    -- Rua 13
    (gen_random_uuid(), '4684fd88-1307-45a1-918c-cf74879d90c9', '8cecb648-ad70-433a-9841-1717e2b0fac1', 3, '09:00', '19:00'),
    -- Avenida
    (gen_random_uuid(), '4684fd88-1307-45a1-918c-cf74879d90c9', 'bf844af4-e283-4600-8241-29a5fead8f18', 5, '09:00', '19:00'),
    (gen_random_uuid(), '4684fd88-1307-45a1-918c-cf74879d90c9', 'bf844af4-e283-4600-8241-29a5fead8f18', 6, '09:00', '15:00');

-- Joilton - Avenida (Segunda a Sábado)
-- ID: 400ab9f7-9cf1-48be-90e5-282cdcd7f874
-- Localização: Avenida (bf844af4-e283-4600-8241-29a5fead8f18)
INSERT INTO barber_schedules (id, barber_id, location_id, week_day, start_time, end_time)
SELECT
    gen_random_uuid(),
    '400ab9f7-9cf1-48be-90e5-282cdcd7f874',
    'bf844af4-e283-4600-8241-29a5fead8f18',
    days.week_day,
    '09:00'::time,
    CASE
        WHEN days.week_day = 6 THEN '15:00'::time -- Sábado
        ELSE '19:00'::time -- Segunda a Sexta
    END
FROM generate_series(1, 6) AS days(week_day);

-- Resumo dos IDs utilizados:
-- Barbeiros:
-- Bruno Souza: 25aad185-561b-4ec0-a570-a6d35d513868
-- Erick: f9d29449-bec9-4499-83e8-3ce8b1f4078d
-- Ryan: e4541de6-7803-4474-9ed1-1ce6efbf591d
-- Carlos: 524995f1-9827-4fba-804f-e965c8425bc2
-- Julio: b6640820-5082-4a35-bf03-c9bb70ca280d
-- Faguinho: 4684fd88-1307-45a1-918c-cf74879d90c9
-- Joilton: 400ab9f7-9cf1-48be-90e5-282cdcd7f874

-- Localizações:
-- Rua 13 - Ouro Fino: 8cecb648-ad70-433a-9841-1717e2b0fac1
-- Avenida - Ouro Fino: bf844af4-e283-4600-8241-29a5fead8f18
-- Inconfidentes: df88109a-0005-41f0-a7cc-feb19540d280
