class AppError extends Error{
    constructor(message, status_code, data, code){
        super(message)
        this.status_code = status_code

        this.status = String(status_code).startsWith('4') ? 'fail' : 'error'

        this.data = data
        this.code = code
        this.is_operational

        Error.captureStackTrace(this, this.constructor)
    }
}

export default AppError