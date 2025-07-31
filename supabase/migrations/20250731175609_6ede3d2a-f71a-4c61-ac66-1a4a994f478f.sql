-- Ajout du support pour expand-options dans la fonction edge
-- Les fonctions edge existantes supportent déjà les nouveaux types de requêtes via le champ requestType

-- Pas de changements en base nécessaires pour cette fonctionnalité
-- Le service utilise la fonction openai-decision-maker existante avec requestType: 'expand-options'

SELECT 'Migration completed - no database changes needed' as status;