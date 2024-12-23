import { query } from "express"
import pool from "../config/dbmysql.config.js"
import AppError from "../errors/AppError.js"


class workspaceRepository {

    static async createWorkspace(new_workspace_data) {
        try {
            const { owner_id, workspace_name, workspace_img } = new_workspace_data

            let workspace_img_default = 'data:image/png;base64,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'

            const [result] = await pool.execute(`
            INSERT INTO workspaces (owner_id, workspace_img, workspace_name)
            VALUES (?, ?, ?)
            `, [owner_id, workspace_img ? workspace_img : workspace_img_default, workspace_name])

            await pool.execute(`
            INSERT INTO workspace_members (workspace_id, user_id)
            VALUES (?, ?)
        `, [result.insertId, owner_id])

            const [rows] = await pool.execute(`
            INSERT INTO workspace_channels (workspace_id, channel_name)
            VALUES (?, ?)
        `, [result.insertId, 'General'])

            if (rows.affectedRows > 0) {
                return {
                    workspace_id: result.insertId, workspace_name: workspace_name, workspace_img: workspace_img
                }
            }
            else {
                throw new AppError('Error SQL al crear el workspace', 500, result, 'FATAL_ERROR')
            }
        }
        catch (error) {
            throw new AppError('SQL query error', 500, { error: error }, 'FATAL_ERROR')
        }
    }

    static async getUserWorkspaces(user_id) {
        try {
            const query = `
                SELECT w.workspace_name, w.workspace_img, w.workspace_id 
                FROM workspaces AS w 
                JOIN workspace_members AS wm ON w.workspace_id = wm.workspace_id
                JOIN users AS u ON u.user_id = wm.user_id
                WHERE u.user_id = ? AND w.activo = true;
            `

            const [result] = await pool.execute(query, [user_id])

            return result
        }
        catch (error) {
            throw new AppError('SQL query error', 500, { error: error }, 'FATAL_ERROR')
        }
    }

    static async getWorkspaceChannels(workspace_id) {
        try {
            const query = `
            SELECT c.channel_name, c.channel_id
            FROM workspace_channels AS c
            WHERE c.workspace_id = ? AND activo = true
            `

            const [result] = await pool.execute(query, [workspace_id])

            return result
        }
        catch (error) {
            throw new AppError('SQL query error', 500, { error: error }, 'FATAL_ERROR')
        }
    }

    static async createChannel(workspace_id, channel_name) {
        try {
            const query = `
            INSERT INTO workspace_channels (workspace_id, channel_name)
            VALUES (?, ?)
            `

            const [result] = await pool.execute(query, [workspace_id, channel_name])

            if (result.affectedRows > 0) {
                return {
                    channel_id: result.insertId, channel_name: channel_name
                }
            }
            else {
                throw new AppError('Error SQL al crear el workspace', 500, result, 'FATAL_ERROR')
            }
        }
        catch (error) {
            throw new AppError('SQL query error', 500, { error: error }, 'FATAL_ERROR')
        }
    }

    static async getChannelMessages(channel_id) {
        try {
            const query = `
            SELECT cm.message_id, cm.created_at, cm.content, u.username, u.user_pfp 
            FROM channel_messages AS cm 
            JOIN users AS u ON cm.sender_id = u.user_id 
            WHERE cm.channel_id = ? AND activo = true;
            `

            const [result] = await pool.execute(query, [channel_id])

            return result
        }
        catch (error) {
            throw new AppError('SQL query error', 500, { error: error }, 'FATAL_ERROR')
        }
    }

    static async createChannelMessage(channel_id, content, sender_id) {
        try {
            const query = `
                INSERT INTO channel_messages(channel_id, content, sender_id)
                VALUES(?,?,?)
            `

            const [result] = await pool.execute(query, [channel_id, content, sender_id])

            const [row] = await pool.execute(`
                SELECT cm.created_at, cm.content, u.username, cm.message_id, u.user_pfp
                FROM channel_messages AS cm
                JOIN users AS u ON cm.sender_id = u.user_id
                WHERE cm.channel_id = ?
                ORDER BY cm.created_at DESC
                LIMIT 1
                `, [channel_id])

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

    static async addUserToWorkspace(user_id, workspace_id){
        try{
            const query = `
                INSERT INTO workspace_members(user_id, workspace_id)
                VALUES(?,?)
            `

            const [result] = await pool.execute(query, [user_id, workspace_id])

            if (result.affectedRows > 0) {
                return {user_id: user_id, workspace_id: workspace_id}
            }
            else {
                throw new AppError('Error SQL al crear el contacto', 500, result, 'FATAL_ERROR')
            }
        }
        catch (error) {
            throw new AppError('SQL query error', 500, { error: error }, 'FATAL_ERROR')
        }
    }
}

export default workspaceRepository