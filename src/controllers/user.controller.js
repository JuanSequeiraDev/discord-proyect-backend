import ENVIROMENT from "../config/enviroment.js"
import AppError from "../errors/AppError.js"
import { FieldConfig } from "../helpers/builders/field_config.builder.js"
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import transporterEmail from '../helpers/emailTransporter.helpers.js'
import userRepository from "../repositories/user.respository.js"
import ResponseBuilder from "../helpers/builders/response.builder.js"
import { verifyEmail, verifyMaxLength, verifyMinLength, verifyString } from "../utils/validations.js"
import userChatsRepository from "../repositories/user.chats.repository.js"
import workspaceRepository from "../repositories/workspace.repository.js"

export const loginController = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const loginConfig = new FieldConfig()
            .setNewField('email', email)
            .setFieldValidations('email',
                [
                    verifyEmail,
                    (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
                ]
            )
            .setNewField('password', password)
            .setFieldValidations('password',
                [
                    verifyString,
                    (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
                ]
            )
            .validateFields()
            .build()

        if (loginConfig.hayErrores) {
            return next(new AppError('Uno de los campos tiene un formato invalido', 400, loginConfig, "VALIDATION_ERROR"))
        }

        const user = await userRepository.getUserByEmail(email)

        if (!user) {
            return next(new AppError('Email no registrado', 404, { user: user }, 'USER_NOT_FOUND'))
        }

        const isValidPassword = await bcryptjs.compare(password, user.passwordHash)

        if (!isValidPassword) {
            return next(new AppError('La contraseña no coincide con el usuario', 400, { validacionContraseña: isValidPassword }, 'PASSWORD_INCORRECT'))
        }

        if (!user.emailVerified) {
            return next(new AppError('El email no fue validado ', 400, { emailVerified: user.emailVerified }, 'EMAIL_NOT_VERIFIED'))
        }

        const acces_token = jwt.sign({
            name: user.username,
            email: user.email,
            user_id: user.user_id
        }, ENVIROMENT.SECRET_KEY,
            {
                expiresIn: '60m' //Duracion de la sesion
            })

            const user_contacts = await userChatsRepository.getContactsInfo(Number(user.user_id))
            const user_workspaces = await workspaceRepository.getUserWorkspaces(Number(user.user_id))

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setMessage('Login Succes')
            .setCode('SUCCES')
            .setData({
                acces_token: acces_token,
                user_info: {
                    user_pfp: user.user_pfp,
                    name: user.username,
                    email: user.email,
                    user_id: user.user_id
                },
                loginConfig: loginConfig,
                user_contacts: user_contacts,
                user_workspaces: user_workspaces
            })
            .build()

        res.status(200).json(response)

    }
    catch (error) {
        next(error)
    }
}

export const registerController = async (req, res, next) => {
    try {
        const { name, password, email } = req.body

        const registerConfig = new FieldConfig()
            .setNewField('email', email)
            .setFieldValidations('email',
                [
                    verifyEmail,
                    (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
                ]
            ).setNewField('name', name)
            .setFieldValidations('name',
                [
                    verifyString,
                    (field_name, field_value) => verifyMinLength(field_name, field_value, 5),
                    (field_name, field_value) => verifyMaxLength(field_name, field_value, 15)
                ]
            )
            .setNewField('password', password)
            .setFieldValidations('password',
                [
                    verifyString,
                    (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
                ]
            )
            .validateFields()
            .build()

        if (registerConfig.hayErrores) {
            return next(new AppError('Uno de los campos tiene un formato invalido', 400, registerConfig, "VALIDATION_ERROR"))
        }

        const passwordHash = await bcryptjs.hash(password, 10)

        const validationToken = jwt.sign({ email: email }, ENVIROMENT.SECRET_KEY, {
            expiresIn: '1d'
        })

        const redirectUrl = ENVIROMENT.BACKEND_URL + '/api/user/verify-email/' + validationToken

        await transporterEmail.sendMail({
            subject: 'Valida tu email',
            to: email,
            html: `
                <img style="width:200px; padding-left: 350px"src='https://ci3.googleusercontent.com/meips/ADKq_Nb5ax2Dw95owSyduMse6gWIZx_i1EsIfAvUeqb5rU5YhlXMLMEF5TYL8ATNnfQWN2dfeUixF4dVM-Zzau2o464U42jc-z3wuxkkcAGDHa-7iiaImXcT5Z3Lp4a5k2ozTo8a=s0-d-e1-ft#https://cdn.discordapp.com/email_assets/592423b8aedd155170617c9ae736e6e7.png'/>
                <br/>
                <h1 style="padding-left: 300px; font-size: 25px ">Valida tu email en discard</h1>
                <p style="padding-left: 250px; color: #B5BAC1; width: 500px; font-size: 18px"> Para seguir con la validacion de tu email cliquea <a href='${redirectUrl}'>aqui</a></p>
            `
        })

        const userCreated = await userRepository.createUser(
            {
                username: name,
                email: email,
                passwordHash: passwordHash
            })

        const response = new ResponseBuilder()
            .setOk(true)
            .setCode('SUCCES')
            .setData({
                username: userCreated.username,
                email: userCreated.email,
                user_id: userCreated.user_id
            })
            .setMessage("User succesfully created")
            .setStatus(201)
            .build()

        return res.json(response)
    }
    catch (error) {
        return next(error)
    }
}



export const verifyEmailController = async (req, res, next) => {
    try {
        const { verification_token } = req.params

        if (!verification_token) {
            return next(new AppError('No se recibio ningun token por los params', 400, { token: verification_token }, 'MISSING_DATA'))
        }

        const { email } = jwt.decode(verification_token)

        if (!email) {
            return next(new AppError('token malformado, no contiene ningun email', 400, { email: email }, 'MISSING_DATA'))
        }

        const user = await userRepository.verifyUserByEmail(email)

        if (!user) {
            return next(new AppError('No se encontro ningun usuario con este email en la DB', 404, { user: user }, 'USER_NOT_FOUND'))
        }

        const response = new ResponseBuilder()
            .setOk(true)
            .setCode('SUCCES')
            .setMessage('User succesfully verified')
            .setStatus(201)
            .build()

        return res.redirect(ENVIROMENT.FRONTEND_URL + '/')
    }
    catch (error) {
        next(error)
    }
}

export const forgotPasswordController = async (req, res, next) => {
    try {
        const { email } = req.body

        const dataConfig = new FieldConfig()
            .setNewField('email', email)
            .setFieldValidations('email', [verifyEmail])
            .validateFields()
            .build()

        if (dataConfig.hayErrores) {
            return next(new AppError('El email recibido no tiene un formato valido', 400, dataConfig, 'VALIDATION_ERROR'))
        }

        const user = await userRepository.getUserByEmail(email)
    
        if (!user) {
            return next(new AppError('Ningun usuario coincide con este email', 404, { user: user }, "USER_NOT_FOUND"))
        }

        if (!user.emailVerified) {
            return next(new AppError('El usuario aun no se ha validado', 400, {}, "EMAIL_NOT_VERIFIED"))
        }

        const reset_token = jwt.sign({ email: user.email }, ENVIROMENT.SECRET_KEY,
            {
                expiresIn: '1d'
            })

        const redirectUrl = ENVIROMENT.FRONTEND_URL + '/reset-password/' + reset_token

        const result = await transporterEmail.sendMail({
            subject: 'Recuperar contraseña en Discard',
            to: dataConfig.email.value,
            html: `
                <img style="width:200px; padding-left: 350px"src='https://ci3.googleusercontent.com/meips/ADKq_Nb5ax2Dw95owSyduMse6gWIZx_i1EsIfAvUeqb5rU5YhlXMLMEF5TYL8ATNnfQWN2dfeUixF4dVM-Zzau2o464U42jc-z3wuxkkcAGDHa-7iiaImXcT5Z3Lp4a5k2ozTo8a=s0-d-e1-ft#https://cdn.discordapp.com/email_assets/592423b8aedd155170617c9ae736e6e7.png'/>
                <br/>
                <h1 style="padding-left: 250px; font-size: 25px ">Hola, ${user.username}:</h1>

                <p style="padding-left: 250px; color: #B5BAC1; width: 500px; font-size: 18px ">Para recuperar tu contraseña da click <a href='${redirectUrl}'>aqui</a> y continua el proceso de recuperación en la pagina.</p>
            `
        })

        const response = new ResponseBuilder()
            .setOk(true)
            .setData({
                dataConfig: dataConfig
            })
            .setCode('SUCCES')
            .setStatus(200)
            .setMessage('Email sent succesfully')
            .build()

        return res.status(200).json(response)
    }
    catch (error) {
        next(error)
    }
}

export const resetPasswordController = async (req, res, next) => {
    try {
        const { reset_token } = req.params
        const { password } = req.body

        const { email } = jwt.decode(reset_token)

        const dataConfig = new FieldConfig()
            .setNewField('password', password)
            .setFieldValidations('password',
                [
                    verifyString,
                    (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
                ]
            )
            .validateFields()
            .build()

        if (dataConfig.hayErrores) {
            return next(new AppError('La contraseña recibido no tiene un formato valido', 400, dataConfig, 'VALIDATION_ERROR'))
        }

        const user = await userRepository.getUserByEmail(email)

        const isSamePassword = await bcryptjs.compare(password, user.passwordHash)

        if (isSamePassword) {
            return next(new AppError('La contraseña ya esta en uso', 400, dataConfig, 'MATCHING_PASSWORD'))
        }

        const passwordHash = await bcryptjs.hash(password, 10)

        await userRepository.updateUserById(user.user_id, {passwordHash: passwordHash})

        const response = new ResponseBuilder()
            .setOk(true)
            .setData({})
            .setCode('SUCCES')
            .setStatus(200)
            .setMessage('User password changed')
            .build()

        return res.status(200).json(response)
    }
    catch (error) {
        next(error)
    }
}

export const deleteUserController = async (req, res, next) => {
    try {
        const { user_id } = req.params

        if (!user_id) {
            return next(new AppError('Id no recibido por parametros', 400, { user_id: user_id }, 'MISSING_DATA'))
        }

        const deletedUser = await userRepository.deleteUserById(user_id)

        const response = new ResponseBuilder()
        .setOk(true)
        .setStatus(200)
        .setCode('SUCCES')
        .setMessage('User eliminado correctamente')
        .setData({user: deletedUser})
        .build()

        return res.json(response)
    }
    catch (error) {
        return next(error)
    }
}