/* ===== AZURTECH — Configuration partagée =====
   Destinataire de tous les envois automatiques. */
window.AZ_DEST_EMAIL = 'contact@azurtech-informatique.fr';

/* EmailJS (compte gratuit emailjs.com). Renseignez ces clés pour l'envoi
   automatique. Deux modèles distincts : un pour les DEVIS, un pour les RENDEZ-VOUS.
   Dans chaque modèle EmailJS, mettez comme "Subject" : {{subject}}
   et une pièce jointe utilisant {{content}} (base64) + {{filename}}.
   Tant que les clés ne sont pas renseignées, un envoi manuel pré-rempli prend le relais. */
window.AZ_EMAILJS = {
  publicKey:   'uTCMI7zjo80TOIbCy',
  serviceId:   'service_0yvovn5',
  templateDevis: 'template_95whq28',
  templateRdv:   'template_zbalmvs'
};
window.AZ_EMAILJS_READY = !window.AZ_EMAILJS.publicKey.startsWith('REMPLACER');
