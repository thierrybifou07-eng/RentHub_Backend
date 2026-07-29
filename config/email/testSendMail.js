import { sendTemplateEmail } from "../../src/shared/helpers/sendMail.js";
import { generateVerificationCode } from "../../src/shared/helpers/helpers.js";

await sendTemplateEmail('contact@gmail.com', '👨🏾‍💻Maildev, test de connetion📈', 'welcome', {
    username: 'Mugiwarano Dev',
    validatedCode: '241580',
    heading: `Mugiwarano Dev, bienvenue sur notre plateforme`, // Assuming you have access to the user object
    countMinutes: 5
})

const { code, expiredAt } = generateVerificationCode(6, 1000 * 5 * 60)

console.log('le mail est parti avec succès')

console.log(code, expiredAt)