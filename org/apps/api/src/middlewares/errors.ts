import { ApiRequest, ApiResponse } from "../types/Api";
import { ERRORS } from '../constants/MESSAGE';
import { CustomError, usedCodesErrors } from '../helpers/error/CustomError';
import { Error } from 'mongoose';


export const errorHandler = (error: Error, req: ApiRequest, res: ApiResponse<undefined>) => {
  if (error instanceof CustomError) {
    const { statusCode, errors, logging } = error;
    if (logging && usedCodesErrors.includes(statusCode)) {
      console.error(JSON.stringify({
        code: statusCode,
        errors,
        stack: error.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params
      }, null, 2));
    }

    return res.status(statusCode).json({
      message: errors[0].message,
      status: "error"
    });
  }

  

  console.error({
    ...error,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  });

  res.status(500).json({
    message: ERRORS.INTERNAL_SERVER_ERROR,
    status: "error"
  });
}