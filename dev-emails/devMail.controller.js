import { handleServerError, unauthorized } from "../src/shared/helpers/response.helpers.js";

const MAILDEV_API_URL = process.env.MAILDEV_API_URL

export const getMyEmails = async (req, res) => {
    try {
        console.log('The req.user/////////////////////////////////////////////////////////',req.user);
        
        const userEmail = req.user?.email;
        if (!userEmail) {
            return res.status(401).json(unauthorized())
        }
        const url = new URL(`${MAILDEV_API_URL}/email`)
        url.searchParams.set('headers.to', userEmail);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Maildev response with the status" + response.status);
        }

        const data = await response.json()
        res.json(data)
    } catch (error) {
        console.error('Erreur récupération des emails:', error.message);
        handleServerError(req, res)

    }
}