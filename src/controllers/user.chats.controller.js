import AppError from "../errors/AppError.js"
import { FieldConfig } from "../helpers/builders/field_config.builder.js"
import ResponseBuilder from "../helpers/builders/response.builder.js"
import userChatsRepository from "../repositories/user.chats.repository.js"
import userRepository from "../repositories/user.respository.js"
import { verifyString } from "../utils/validations.js"


export const createUserChatController = async (req, res, next) => {
    try {
        const {username } = req.body
        const {user_id} = req.params

        if(!Number(user_id)){
            return next(new AppError('user_id malformado', 400, {user_id: user_id}, 'MISSING_DATA'))
        }

        const [user_to_contact_id] = await userRepository.getUserIdByUsername(username)

        if(!user_to_contact_id){
            return next(new AppError('Ningun usuario coincide', 404, {username: username}, 'USER_NOT_FOUND'))
        }

        if(user_id == user_to_contact_id.user_id){
            return next(new AppError('Este usuario eres tu!', 404, {username: username}, 'USER_NOT_FOUND'))
        }

        const result = await userChatsRepository.createUsersChat(Number(user_id), Number(user_to_contact_id.user_id))

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setMessage('Chat created succesfully')
            .setCode('SUCCES')
            .setData({
                user_chats: result
            })
            .build()

        res.status(200).json(response)
    }
    catch (error) {
        next(error)
    }
}   

export const getUserContactsInfo = async (req, res ,next) =>{
    try{
    const {user_id} = req.params

    if(!Number(user_id)){
        return next(new AppError('user_id malformado', 400, {user_id: user_id}, 'MISSING_DATA'))
    }

    const result = await userChatsRepository.getContactsInfo(Number(user_id))

    const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setMessage('User contacts gathered')
            .setCode('SUCCES')
            .setData({
                user_contacts: result
            })
            .build()

        res.status(200).json(response)
    }
    catch(error){
        return next(error)
    }
}

export const sendMessageController = async (req, res, next) =>{
    try{    
        const {chat_id} = req.params
        const {message, user_id} = req.body

        if(!Number(chat_id)){
            return next(new AppError('chat_id malformado', 400, {chat_id: chat_id}, 'MISSING_DATA'))
        }

        if(!Number(user_id)){
            return next(new AppError('user_id malformado', 400, {user_id: user_id}, 'MISSING_DATA'))
        }

        const messageConfig = new FieldConfig()
        .setNewField('message', message)
        .setFieldValidations('message', [verifyString])
        .validateFields()
        .build()

        if(messageConfig.hayErrores){
            return next(new AppError('formato de mensaje invalido', 400, messageConfig , 'VALIDATION_ERROR'))
        }

        const result = await userChatsRepository.createMessage(chat_id, message, user_id)

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
    catch(error){
        next(error)
    }
}

export const getChatMessagesController = async (req, res, next) =>{
    try{
        const {chat_id} = req.params

        if(!Number(chat_id)){
            return next(new AppError('chat_id malformado', 400, {chat_id: chat_id}, 'MISSING_DATA'))
        }

        const result = await userChatsRepository.getChatMessages(chat_id)

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setMessage('Messages gathered succesfully')
            .setCode('SUCCES')
            .setData(result)
            .build()

        res.status(200).json(response)
    }
    catch(error){
        next(error)
    }
}