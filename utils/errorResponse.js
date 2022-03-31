class ErrorResponse extends Error {
    contructor(message,statusCode) {
       
        
        super.message = message;
        this.statusCode = statusCode;
       
     //   Error.captureStackTrace(this, this.constructor);
        
    }
}

module.exports = ErrorResponse;