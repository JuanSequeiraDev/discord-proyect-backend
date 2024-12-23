import ENVIROMENT from "../config/enviroment.js"
import AppError from "../errors/AppError.js"
import { FieldConfig } from "../helpers/builders/field_config.builder.js"
import ResponseBuilder from "../helpers/builders/response.builder.js"
import transporterEmail from "../helpers/emailTransporter.helpers.js"
import userRepository from "../repositories/user.respository.js"
import workspaceRepository from "../repositories/workspace.repository.js"
import { verifyMaxLength, verifyMinLength, verifyString } from "../utils/validations.js"
import jwt from 'jsonwebtoken'

export const createWorkspaceController = async (req, res, next) => {
    try {
        const { user_id } = req.params
        const { workspace_name, workspace_img } = req.body

        if (!Number(user_id)) {
            return next(new AppError('user_id malformado', 400, { user_id: user_id }, 'MISSING_DATA'))
        }

        const workspaceConfig = new FieldConfig()
            .setNewField('workspace_name', workspace_name)
            .setFieldValidations('workspace_name', [
                verifyString,
                (field_name, field_value) => verifyMinLength(field_name, field_value, 5),
                (field_name, field_value) => verifyMaxLength(field_name, field_value, 30)
            ])
            .validateFields()
            .build()

        if (workspaceConfig.hayErrores) {
            return next(new AppError('Uno de los campos tiene un formato invalido', 400, workspaceConfig, "VALIDATION_ERROR"))
        }

        const result = await workspaceRepository.createWorkspace({ owner_id: Number(user_id), workspace_name: workspaceConfig.workspace_name.value, workspace_img: workspace_img })

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setData({ workspace_credentials: result })
            .setMessage('Workspace created succesfully')
            .setCode('SUCCES')
            .build()

        return res.status(200).json(response)
    }
    catch (error) {
        return next(error)
    }
}

export const getWorkspaceChannelsController = async (req, res, next) => {
    try {
        const { workspace_id } = req.params

        if (!Number(workspace_id)) {
            return next(new AppError('workspace_id malformado', 400, { workspace_id: workspace_id }, 'MISSING_DATA'))
        }

        const result = await workspaceRepository.getWorkspaceChannels(Number(workspace_id))

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setData(result)
            .setMessage('Workspace channels gathered succesfully')
            .setCode('SUCCES')
            .build()

        return res.status(200).json(response)
    }
    catch (error) {
        return next(error)
    }
}

export const createWorkspaceChannelController = async (req, res, next) => {
    try {
        const { workspace_id } = req.params
        const { owner_id, channel_name } = req.body

        if (!Number(workspace_id)) {
            return next(new AppError('workspace_id malformado', 400, { workspace_id: workspace_id }, 'MISSING_DATA'))
        }
        if (!Number(owner_id)) {
            return next(new AppError('owner_id malformado', 400, { owner_id: owner_id }, 'MISSING_DATA'))
        }

        const channelConfig = new FieldConfig()
            .setNewField('channel_name', channel_name)
            .setFieldValidations('channel_name', [
                verifyString,
                (field_name, field_value) => verifyMinLength(field_name, field_value, 5),
                (field_name, field_value) => verifyMaxLength(field_name, field_value, 20)
            ])
            .validateFields()
            .build()

        if (workspaceConfig.hayErrores) {
            return next(new AppError('Uno de los campos tiene un formato invalido', 400, workspaceConfig, "VALIDATION_ERROR"))
        }

        const [is_owner] = await userRepository.isOwner(owner_id, workspace_id)

        if (!is_owner.is_owner) {
            return next(new AppError('Solo propietarios', 403, { owner_id: owner_id }, 'USER_INVALID'))
        }

        const result = await workspaceRepository.createChannel(workspace_id, channel_name)

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setData(result)
            .setMessage('Workspace channel created succesfully')
            .setCode('SUCCES')
            .build()

        return res.status(200).json(response)
    }
    catch (error) {
        next(error)
    }
}

export const sendChannelMessageController = async (req, res, next) => {
    try {
        const { channel_id } = req.params
        const { sender_id, message } = req.body

        if (!Number(channel_id)) {
            return next(new AppError('channel_id malformado', 400, { channel_id: channel_id }, 'MISSING_DATA'))
        }
        if (!Number(sender_id)) {
            return next(new AppError('sender_id malformado', 400, { sender_id: sender_id }, 'MISSING_DATA'))
        }

        const messageConfig = new FieldConfig()
            .setNewField('message', message)
            .setFieldValidations('message', [verifyString])
            .validateFields()
            .build()

        if (messageConfig.hayErrores) {
            return next(new AppError('formato de mensaje invalido', 400, messageConfig, 'VALIDATION_ERROR'))
        }

        const result = await workspaceRepository.createChannelMessage(channel_id, message, sender_id)

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setMessage('Message sent succesfully')
            .setCode('SUCCES')
            .setData({
                message_info: result
            })
            .build()

        res.status(200).json(response)
    }
    catch (error) {
        next(error)
    }
}

export const getChannelMessagesController = async (req, res, next) => {
    try {
        const { channel_id } = req.params

        if (!Number(channel_id)) {
            return next(new AppError('channel_id malformado', 400, { channel_id: channel_id }, 'MISSING_DATA'))
        }

        const result = await workspaceRepository.getChannelMessages(channel_id)

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setMessage('Messages gathered succesfully')
            .setCode('SUCCES')
            .setData({
                message_info: result
            })
            .build()

        res.status(200).json(response)
    }
    catch (error) {
        next(error)
    }
}

export const inviteUserToWorkspaceController = async (req, res, next) => {
    try {
        const { owner_id } = req.params
        const { username, workspace_id, workspace_name } = req.body

        if (!Number(owner_id)) {
            return next(new AppError('owner_id malformado', 400, { owner_id: owner_id }, 'MISSING_DATA'))
        }

        const [is_owner] = await userRepository.isOwner(owner_id, workspace_id)

        if (!is_owner.is_owner) {
            return next(new AppError('Solo propietarios', 403, { owner_id: owner_id }, 'USER_INVALID'))
        }

        const [user_to_invite] = await userRepository.getUserEmailAndIdByUsername(username)

        if (!user_to_invite) {
            return next(new AppError('Ningun usuario coincide', 404, { username: username }, 'USER_NOT_FOUND'))
        }

        if (owner_id == user_to_invite.user_id) {
            return next(new AppError('Este usuario eres tu!', 404, { username: username }, 'USER_NOT_FOUND'))
        }

        const validationToken = jwt.sign({ user_id: user_to_invite.user_id, workspace_id: workspace_id }, ENVIROMENT.SECRET_KEY, {
            expiresIn: '1d'
        })

        const redirectUrl = ENVIROMENT.BACKEND_URL + '/api/workspaces/join/' + validationToken

        await transporterEmail.sendMail({
            subject: 'Te han invitado a un servidor de discard!',
            to: user_to_invite.email,
            html: `
                <img style="width:200px; padding-left: 350px"src='https://ci3.googleusercontent.com/meips/ADKq_Nb5ax2Dw95owSyduMse6gWIZx_i1EsIfAvUeqb5rU5YhlXMLMEF5TYL8ATNnfQWN2dfeUixF4dVM-Zzau2o464U42jc-z3wuxkkcAGDHa-7iiaImXcT5Z3Lp4a5k2ozTo8a=s0-d-e1-ft#https://cdn.discordapp.com/email_assets/592423b8aedd155170617c9ae736e6e7.png'/>
                <br/>
                <h1 style="padding-left: 250px; font-size: 25px ">Te han invitado al servidor ${workspace_name}</h1>
                <p style="padding-left: 270px; color: #B5BAC1; width: 500px; font-size: 18px"> Para aceptar la invitacion cliquea <a href='${redirectUrl}'>aqui</a></p>
            `
        })

        const response = new ResponseBuilder()
            .setOk(true)
            .setCode('SUCCES')
            .setData({})
            .setMessage("User succesfully invited")
            .setStatus(200)
            .build()

        return res.json(response)
    }
    catch (error) {
        next(error)
    }
}

export const joinUserToWorkspaceController = async (req, res, next) => {
    try {
        const { invitation_token } = req.params

        const isValid = jwt.verify(invitation_token, ENVIROMENT.SECRET_KEY)
        
        if (!isValid) {
            return next(new AppError('Token de invitacion malformado o caducado', 404, { username: username }, 'USER_NOT_FOUND'))
        }

        const payload = jwt.decode(invitation_token)

        const result = await workspaceRepository.addUserToWorkspace(Number(payload.user_id), Number(payload.workspace_id))

        const response = new ResponseBuilder()
            .setOk(true)
            .setCode('SUCCES')
            .setData(result)
            .setMessage("User succesfully joined")
            .setStatus(200)
            .build()

        return res.json(response)
    }
    catch (error) {
        next(error)
    }
}