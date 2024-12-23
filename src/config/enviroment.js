import dotenv from 'dotenv'

dotenv.config()

const ENVIROMENT = {
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
    EMAIL_USER: process.env.EMAIL_USER || '',
    SECRET_KEY: process.env.SECRET_KEY || '',
    FRONTEND_URL: process.env.FRONTEND_URL || '',
    BACKEND_URL: process.env.BACKEND_URL || '',
    MYSQL: {
        HOST: process.env.MYSQL_HOST,
        DATABASE: process.env.MYSQL_DATABASE,
        USERNAME: process.env.MYSQL_USERNAME,
        PASSWORD: process.env.MYSQL_PASSWORD
    }
}

export default ENVIROMENT