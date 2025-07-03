-- Atualizar estrutura das localidades conforme especificado
-- Avenida e Rua 13 são em Ouro Fino
-- Inconfidentes tem apenas um lugar

UPDATE locations SET 
  name = 'Rua 13 - Ouro Fino',
  address = 'Rua 13, Centro, Ouro Fino - MG'
WHERE name = 'Rua 13';

UPDATE locations SET 
  name = 'Avenida - Ouro Fino', 
  address = 'Avenida Principal, Centro, Ouro Fino - MG'
WHERE name = 'Avenida';

UPDATE locations SET 
  name = 'Inconfidentes',
  address = 'Bairro Inconfidentes, Inconfidentes - MG'
WHERE name = 'Inconfidentes';

-- Remover a localidade "Ouro Fino" duplicada se existir
DELETE FROM locations WHERE name = 'Ouro Fino';
