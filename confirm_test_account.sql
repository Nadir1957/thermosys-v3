-- Confirmer manuellement l'email du compte test, sans passer par l'envoi d'un email
update auth.users
set email_confirmed_at = now(), confirmed_at = now()
where email = 'mhamed.bendriss.lahoussine@gmail.com';
