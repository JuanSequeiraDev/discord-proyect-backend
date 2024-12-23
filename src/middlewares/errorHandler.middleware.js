import AppError from "../errors/AppError.js";

const errorHandlerMiddleware = (err, req, res, next) =>{
    err.status_code = err.status_code || 500
    err.status = err.status || 'error'

    if(err.status_code !== 500){
        err.is_operational = true
    }

    if(err.is_operational){
        return res.json({
            status: err.status_code,
            message: err.message,
            data: err.data,
            code: err.code
        })
    }

    console.error('FATAL_ERROR |', err)

    return res.status(500).json({
        code: 'FATAL_ERROR',
        message: 'Backend Error'
    })
}   

export default errorHandlerMiddleware