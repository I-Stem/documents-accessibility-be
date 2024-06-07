
const httpStatusCodes = {
    200: {
        code: 200,
        flag: "OK",
        message: "Process successful"
    },
    201: {
        code: 201,
        flag: "Created",
        message: "Created successfully"
    },
    202: {
        code: 202,
        flag: "Not created",
        message: "Could not create"
    },
    204: {
        code: 204,
        flag: "No content",
        message: "Server processed request successfully and there is no data to return"
    },
    400: {
        code: 400,
        flag: "Bad Request",
        message: "The server could not process the request due to a bad request"
    },
    401: {
        code: 401,
        flag: "Unauthorised",
        message: "Unauthorised access"
    },
    403: {
        code: 403,
        flag: "Forbidden",
        message: "Forbidden request"
    },
    404: {
        code: 404,
        flag: "Not found",
        message: "The requested resource could not be found"
    },
    500: {
        code: 500,
        flag: "Internal server error",
        message: "An internal server error occured"
    }
};

module.exports = httpStatusCodes;