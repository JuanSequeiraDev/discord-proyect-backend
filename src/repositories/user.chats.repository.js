import { query } from "express"
import pool from "../config/dbmysql.config.js"
import AppError from "../errors/AppError.js"


class userChatsRepository {

    static async createUsersChat(user_id, contact_id) {
        try {
            const query = `
                INSERT INTO user_contacts (user_id, user_contact_id)
                VALUES (?,?)
            `

            const [result] = await pool.execute(query, [user_id, contact_id])

            const [rows] = await pool.execute(`
            SELECT u.username, u.user_pfp, uc.chat_id, ucm.content AS last_message_content, ucm.created_at AS last_message_time
            FROM user_contacts AS uc 
            JOIN users AS u ON uc.user_contact_id = u.user_id 
            LEFT JOIN user_chat_messages AS ucm ON uc.chat_id = ucm.chat_id 
            AND ucm.created_at = (
                SELECT MAX(created_at) 
                FROM user_chat_messages 
                WHERE chat_id = uc.chat_id
            )
            WHERE uc.user_id = ? ;
            `, [user_id])

            if (result.affectedRows > 0) {
                return rows
            }
            else {
                throw new AppError('Error SQL al crear el contacto', 500, result, 'FATAL_ERROR')
            }
        }
        catch (error) {
            throw new AppError('SQL query error', 500, { error: error }, 'FATAL_ERROR')
        }
    }

    static async getContactsInfo(contact_id) {
        try {
            const query = `
            SELECT u.username, u.user_pfp, uc.chat_id, ucm.content AS last_message_content, ucm.created_at AS last_message_time
            FROM user_contacts AS uc 
            JOIN users AS u ON IF(uc.user_id = ?, uc.user_contact_id = u.user_id, uc.user_id = u.user_id ) 
            LEFT JOIN user_chat_messages AS ucm ON uc.chat_id = ucm.chat_id 
            AND ucm.created_at = (
            SELECT MAX(created_at) 
            FROM user_chat_messages 
            WHERE chat_id = uc.chat_id
            )
            WHERE uc.user_id = ? OR uc.user_contact_id = ?;
            `

            const [result] = await pool.execute(query, [contact_id, contact_id, contact_id])
            /* console.log(result) */

            return result

        }
        catch (error) {
            throw new AppError('SQL query error', 500, { error: error }, 'FATAL_ERROR')
        }
    }

    static async createMessage(chat_id, content, sender_id) {
        try {
            const query = `
        INSERT INTO user_chat_messages (chat_id, content, sender_id)
        VALUES (?,?,?)
        `

            const [result] = await pool.execute(query, [chat_id, content, sender_id])

            const [row] = await pool.execute(`
                SELECT m.created_at, m.content, u.username, uc.chat_id, u.user_pfp
                FROM user_chat_messages AS m
                JOIN users AS u ON m.sender_id = u.user_id
                JOIN user_contacts AS uc ON m.chat_id = uc.chat_id
                WHERE uc.chat_id = ?
                ORDER BY m.created_at DESC
                LIMIT 1
                `, [chat_id])

            if (result.affectedRows > 0) {
                return row
            }
            else {
                throw new AppError('Error SQL al crear el contacto', 500, result, 'FATAL_ERROR')
            }
        }
        catch (error) {
            throw new AppError('SQL query error', 500, { error: error }, 'FATAL_ERROR')
        }
    }

    static async getChatMessages(chat_id) {
        try {
            const query = `
                SELECT m.created_at, m.content, u.username, uc.chat_id, u.user_pfp
                FROM user_chat_messages AS m
                JOIN users AS u ON m.sender_id = u.user_id
                JOIN user_contacts AS uc ON m.chat_id = uc.chat_id
                WHERE uc.chat_id = ?
                ;
            `

            const [result] = await pool.execute(query, [chat_id])

            return result
        }
        catch (error) {
            throw new AppError('SQL query error', 500, { error: error }, 'FATAL_ERROR')
        }
    }

}

export default userChatsRepository