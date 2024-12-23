import express from 'express'
import userRouter from './routers/user.router.js'
import errorHandlerMiddleware from './middlewares/errorHandler.middleware.js'
import cors from 'cors'
import pool from './config/dbmysql.config.js'
import { customCorsMiddleware } from './middlewares/cors.middleware.js'
import workspaceRouter from './routers/workspace.router.js'
import userChatsRouter from './routers/user.chats.router.js'

const PORT = 4237
const app = express()


app.use(customCorsMiddleware)

app.use(cors())
app.use(express.json())

app.use('/api/user', userRouter)
app.use('/api/workspaces', workspaceRouter)
app.use('/api/chats', userChatsRouter)

app.use(errorHandlerMiddleware)


app.listen(PORT, ()=>{
    console.dir('La aplicacion se esta escuchando en el puerto ' + PORT)
})
