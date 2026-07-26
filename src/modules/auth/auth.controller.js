import { User, Otp } from "../../database/models/index.js";
import { sendTemplateEmail } from "../../shared/helpers/sendMail.js";
import { verifyPassword } from "./password.js";
import OTP from '../../../config/auth/OTP_CODE.js'
import USER_STATUS from "./userStatus.js";
import { conflict, error, fail, notFound, registered, verified } from "../../shared/helpers/response.helpers.js";
import { generateToken } from "./jwt.js";
import OTP_TYPES from "../../../config/auth/OTP_CODE.js";
import { Op } from "sequelize";
import { generateVerificationCode } from "./otp.helpers.js";
import orm from "../../../config/sequelize_app.js";

export const register = async (req, res) => {

    try {
        const checkExistingUser = await User.findOne({
            where: { [Op.or]: [{ email: req.body.email }, { phone: req.body.phone }], },
            attributes: ['id', 'email', 'phone']
        })

        if (checkExistingUser) {
            if (checkExistingUser.email === req.body.email) return res.status(409).json(conflict('That Email is already taken'));
            if (checkExistingUser.phone === req.body.phone) return res.status(409).json(conflict('That phone number is already taken'));
        }

        const body = { ...req.body, user_status_id: USER_STATUS.ACTIVE };

        const user = await User.create(body);



        try {
            const countMinutes = 5
            const { code, expiredAt } = await generateVerificationCode(6, 1000 * countMinutes * 60)

            /*             const userId = await User.scope('onlyId').findOne({ where: { email: req.body.email } })
             */
            if (!user) return res.status(400).json(notFound('User not found'))

            const otp = { code, expiredAt, user_id: user.id, type: OTP.EMAIL_VERIFICATION }


            await Otp.create(otp)

            // await Otp.upsert(otp) A utiliser si jamais une erreur de clés duplicité surgit.

            try {
                await sendTemplateEmail(
                    body.email,
                    'Inscription réussie',
                    'welcome',
                    {
                        username: `${body.lastname} ${body.firstname}`,
                        validatedCode: code,
                        countMinutes
                    }
                )
            }
            catch (e) {
                console.log(e.message)
            }
        } catch (error) {
            console.log(error);

        }



        return res.status(201).json(registered());
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.scope('withPassword').findOne({ where: { email } })

        if (!user) return res.status(400).json(fail('Invalid credentials'))

        const passwordMatch = await verifyPassword(password, user.password)

        if (!passwordMatch) return res.status(400).json(fail('Invalid credentials'))

        const token = generateToken({ id: user.id, email, phone: user.phone, role: user.role_id, userStatus: user.user_status_id, emailChecked: user.email_verified_at })

        user.set({ last_login_at: new Date() })
        user.save()

        return res.status(200).json({ token })
    }
    catch (e) {
        return res.status(500).json(error())
    }
}

export const logout = async (req, res) => { }

export const forgotPassword = async (req, res) => { }

export const resetPassword = async (req, res) => { }

export const verifyEmail = async (req, res) => {
    try {
        const { code, email } = req.body

        const user = await User.findOne({ where: { email } })

        if (!user) return res.status(404).json(notFound('User not found'))

        if (user.email_verified_at !== null) return res.status(400).json(fail('You have already verified your Email'))

        const userCode = await Otp.findOne({ where: { user_id: user.id, type: OTP_TYPES.EMAIL_VERIFICATION } })

        if (code != userCode.code) return res.status(400).json(fail('Invalid code'))

        if (userCode.expiredAt < (new Date())) return res.status(400).json(fail('Expired code'))

        //This function from claude is used to delete the Otp after change the email verification status of the user in the DB, and it avoid error of order of the execution of the script.
        await orm.transaction(async (params) => {
            await User.update(
                { email_verified_at: new Date() },
                { where: { id: user.id }, transaction: params }
            );
            await Otp.destroy({
                where: { user_id: user.id, type: OTP_TYPES.EMAIL_VERIFICATION },
                transaction: params,
            });
        });
        try {
            await sendTemplateEmail(
                user.email,
                'Verification de l\'émail réussie',
                'congratulation',
                {
                    username: `${user.lastname} ${user.firstname}`
                }
            )
        }
        catch (e) {
            console.log(e.message)
        }
        return res.status(200).json(verified())
    }
    catch (e) {
        return res.status(500).json({ message: e.message ?? 'An error occurred' })
    }
}

export const regenerateCode = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id)

        if (!user) return res.status(404).json(notFound('User not found'))

        if (user.email_verified_at !== null) return res.status(400).json(fail('You have already verified your Email'))
        const userOtp = await Otp.findOne({ where: { user_id: user.id, type: OTP_TYPES.EMAIL_VERIFICATION } })

        if (userOtp && userOtp.expiredAt > new Date()) return res.status(400).json(conflict('The last code is still valid'))

        const countMinutes = 5

        const { code, expiredAt } = await generateVerificationCode(6, 1000 * countMinutes * 60)

        await Otp.upsert({ code, expiredAt, type: OTP_TYPES.EMAIL_VERIFICATION, user_id: user.id })

        /*         await user.save()
         */
        try {
            await sendTemplateEmail(
                user.email,
                'Inscription réussie',
                'welcome',
                {
                    username: `${user.lastname} ${user.firstname}`,
                    validatedCode: code,
                    countMinutes
                }
            )
        }
        catch (e) {
            console.log(e.message)
        }

        return res.status(200).json({ status: true, message: 'Votre code a été regénéré !!!' })

    }
    catch (e) {
        return res.status(500).json({ message: e.message ?? 'An error occurred' })
    }
}

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) return res.status(404).json({ message: 'User not found' })
        return res.status(200).json(user)
    }
    catch (e) {
        return res.status(500).json({ message: e.message ?? 'An error occurred' })
    }
}