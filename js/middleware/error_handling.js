'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const HttpStatus = require('http-status-codes');
const errors_1 = require('../errors');
function errorHandler(err, _req, res, next) {
    // If you call next() with an error after you have started writing the response
    // (for example, if you encounter an error while streaming the response to the client)
    // the Express default error handler closes the connection and fails the request.
    if (res.headersSent) {
        return next(err);
    }
    if (err.isRelayerError) {
        const relayerError = err;
        if (relayerError.statusCode === HttpStatus.BAD_REQUEST) {
            const badRequestError = relayerError;
            if (badRequestError.generalErrorCode === errors_1.GeneralErrorCodes.VALIDATION_ERROR) {
                const validationError = badRequestError;
                const errorBody = {
                    code: badRequestError.generalErrorCode,
                    reason: errors_1.generalErrorCodesReasons[badRequestError.generalErrorCode],
                    validationErrors: validationError.validationErrors,
                };
                res.status(relayerError.statusCode).send(errorBody);
            } else if (badRequestError.generalErrorCode === errors_1.GeneralErrorCodes.MALFORMED_JSON) {
                const errorBody = {
                    code: badRequestError.generalErrorCode,
                    reason: errors_1.generalErrorCodesReasons[badRequestError.generalErrorCode],
                };
                res.status(relayerError.statusCode).send(errorBody);
            }
        } else {
            const errorBody = {
                reason: HttpStatus.getStatusText(relayerError.statusCode),
            };
            res.status(relayerError.statusCode).send(errorBody);
        }
    } else {
        return next(err);
    }
}
exports.errorHandler = errorHandler;