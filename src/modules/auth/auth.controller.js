import { User, Otp } from "../../database/models/index.js";
import { generateVerificationCode } from "../../shared/helpers/helpers.js";
import { sendTemplateEmail } from "../../shared/helpers/sendMail.js";
import { verifyPassword } from "./password.js";
import { generateToken } from "./jwt.js";
import OTP from '../../../config/auth/OTP_CODE.js'
import USER_STATUS from "./userStatus.js";

export const register = async (req, res) => {

    try {
        const body = { ...req.body, user_status_id: USER_STATUS.ACTIVE };

        const user = await User.create(body);

        const countMinutes = 5
        const { code, expiredAt } = await generateVerificationCode(6, 1000 * countMinutes * 60)

        try {

            const userId = await User.scope('onlyId').findOne({ where: { email: req.body.email } })

            const otp = { code, expiredAt, user_id: userId.id, type: OTP.EMAIL_VERIFICATION }


            await Otp.create(otp)

        } catch (error) {
            console.log(error);

        }

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

        return res.status(201).json(user);
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.scope('withPassword').findOne({ where: { email } })

        if (!user) return res.status(400).json({ message: 'Invalid credentials' })

        const status = await verifyPassword(password, user.password)

        if (!status) return res.status(400).json({ message: 'Invalid credentials' })

        const token = generateToken({ id: user.id, email, phone: user.phone, roles: user.roles })

        return res.status(200).json({ token })
    }
    catch (e) {
        return res.status(500).json({ message: e.message ?? 'An error occurred' })
    }
}

export const logout = async (req, res) => { }

export const forgotPassword = async (req, res) => { }

export const resetPassword = async (req, res) => { }

export const verifyEmail = async (req, res) => {
    try {
        const { code } = req.body

        const user = await User.scope('withCode').findByPk(req.user.id)

        if (!user) return res.status(404).json({ message: 'User not found' })

        if (code !== user.code) return res.status(400).json({ message: 'Invalid code' })

        if (user.expiredAt < (new Date())) return res.status(400).json({ message: 'Expired code' })

        await user.set({ code: null, expiredAt: null, verified: true, status: true })

        await user.save()

        return res.status(200).json({ status: true })
    }
    catch (e) {
        return res.status(500).json({ message: e.message ?? 'An error occurred' })
    }
}

export const regenerateCode = async (req, res) => {
    try {
        const user = await User.scope('withCode').findByPk(req.user.id)

        if (!user) return res.status(404).json({ message: 'User not found' })

        const countMinutes = 5

        const { code, expiredAt } = await generateVerificationCode(6, 1000 * countMinutes * 60)

        await user.set({ code, expiredAt })

        await user.save()

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