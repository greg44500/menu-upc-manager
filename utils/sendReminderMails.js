const UserModel = require("../models/user.model");
const sendMail = require("../utils/sendMail");

const sendReminderEmails = async () => {
    try {
        // Récupérer tous les utilisateurs qui n'ont pas changé leur mot de passe
        const usersWithTempPassword = await UserModel.find({
            isTemporaryPassword: true
        });

        if (usersWithTempPassword.length === 0) {
            console.log("Aucun utilisateur avec un mot de passe provisoire.");
            return;
        }

        // Envoyer un email à chaque utilisateur
        for (const user of usersWithTempPassword) {
            const subject = "⚠️ Veuillez modifier votre mot de passe";
            const text = `Bonjour,\n\nVous utilisez toujours un mot de passe provisoire. Pour des raisons de sécurité, veuillez le modifier dès maintenant en accédant à votre compte.\n\nMerci.`;

            await sendMail(user.email, subject, text);
            console.log(`Email envoyé à ${user.email}`);
        }

        console.log("Tous les emails de rappel ont été envoyés.");
    } catch (error) {
        console.error("Erreur lors de l'envoi des emails de rappel:", error.message);
    }
};

module.exports = sendReminderEmails;