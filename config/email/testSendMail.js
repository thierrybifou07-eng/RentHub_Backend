import { sendTemplateEmail } from "../../src/shared/helpers/sendMail.js";
import { generateVerificationCode } from "../../src/shared/helpers/helpers.js";

/*await sendTemplateEmail('contact@gmail.com', 'juste pour le test', 'welcome', {
    username: 'Arnaud paul',
    validatedCode: '241580'
})*/

const { code, expiredAt } = generateVerificationCode(6, 1000 * 5 * 60)

console.log('le mail est parti avec succès')

console.log(code, expiredAt)