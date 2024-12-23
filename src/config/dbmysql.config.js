import mysql from 'mysql2/promise'
import ENVIROMENT from './enviroment.js'

const pool = mysql.createPool({
    host: ENVIROMENT.MYSQL.HOST,
    user: ENVIROMENT.MYSQL.USERNAME,
    password: ENVIROMENT.MYSQL.PASSWORD,
    database: ENVIROMENT.MYSQL.DATABASE
})

pool.getConnection().then(
    (connection) =>{
        console.dir('Se ha establecido conexion con la DB de SQL')
        connection.release()
    }
)
.catch(
    error =>{
        console.error(error)
    }
)

export default pool