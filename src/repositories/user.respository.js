import pool from "../config/dbmysql.config.js";
import AppError from "../errors/AppError.js";


class userRepository {
    static async createUser(new_user_data) {
        try {
            const {
                username,
                email,
                passwordHash
            } = new_user_data

            let user_img_default = 'data:image/png;base64,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'

            const query = `
                INSERT INTO users (username, email, passwordHash, user_pfp)
                VALUES (?,?,?,?)
            `

            const [result] = await pool.execute(query, [username, email, passwordHash, user_img_default])

            if (result.affectedRows > 0) {
                return {
                    username: username, email: email, user_id: result.insertId
                }
            }
            else {
                //Podemos manejar el error
                throw new AppError('Error SQL al crear el usuario', 500, result, 'FATAL_ERROR')
            }
        }
        catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                if (error.message.includes('username')) {
                    throw new AppError("El username ya esta en uso", 400, {}, 'USERNAME_DB_MATCH_ERROR')
                }
                if (error.message.includes('email')) {
                    throw new AppError("El email ya esta registrado", 400, {}, 'EMAIL_DB_MATCH_ERROR')
                }
            }
            console.error(error)
        }
    }

    static async getAllUsers() {
        const [rows] = await pool.execute(`SELECT * FROM users WHERE activo = true`)
        return rows
    }

    static async isOwner(owner_id, workspace_id) {
        const [result] = await pool.execute(`
            SELECT CASE WHEN owner_id = ? THEN TRUE ELSE FALSE END AS is_owner
            FROM workspaces
            WHERE workspace_id = ?;
        `, [owner_id, workspace_id])
        
        return result
    }

    static async getUserIdByUsername(username) {
        const [rows] = await pool.execute(`SELECT user_id FROM users WHERE username = ?`, [username])
        return rows
    }

    static async getUserEmailAndIdByUsername(username) {
        const [rows] = await pool.execute(`SELECT user_id, email FROM users WHERE username = ?`, [username])
        return rows
    }

    static async getUserByEmail(email) {
        const [rows] = await pool.execute(`SELECT * FROM users WHERE email = ?`, [email])
        return rows.length > 0 ? rows[0] : null
    }

    static async verifyUserByEmail(email) {
        try {
            await pool.execute(`
            UPDATE users SET emailVerified = true WHERE email = ?
            `, [email])

            const [rows] = await pool.execute(`SELECT * FROM users WHERE email = ?`, [email])
            return rows
        }
        catch (error) {
            throw new AppError('Backend Error', 500, error, 'FATAL_ERROR')
        }
    }

    static async deleteUserById(user_id) {
        try {
            await pool.execute(`
            UPDATE users SET active = false WHERE user_id = ?
            `, [user_id])

            const [rows] = await pool.execute(` SELECT * FROM users WHERE user_id = ?`, [user_id])
            return rows
        }
        catch (error) {
            throw new AppError('Backend Error', 500, error, 'FATAL_ERROR')
        }
    }

    static async updateUserById(user_id, new_user_data) {
        try {
            const required_values = ['username', 'email', 'passwordHash']

            let requirements_present = false

            required_values.forEach(value => {
                if (new_user_data.hasOwnProperty(value)) {
                    requirements_present = true
                }
            })

            if (!requirements_present) {
                throw new AppError('No se ha recibido ninguno de los campos requeridos', 400, { new_user_data: new_user_data }, 'MISSING_DATA')
            }

            const values = []
            let query_values = ``

            for (let key in new_user_data) {
                if (new_user_data[key]) {
                    values.push(new_user_data[key])
                    query_values = query_values + `${key} = ?,`
                }
            }
            values.push(user_id)

            await pool.execute(`UPDATE users SET ${query_values} activo = true WHERE user_id = ?`, values)

            const [rows] = await pool.execute('SELECT * FROM users WHERE user_id = ?', [user_id])
            return rows
        }
        catch (error) {
            throw new AppError('Backend Error', 500, error, 'FATAL_ERROR')
        }
    }
}

export default userRepository