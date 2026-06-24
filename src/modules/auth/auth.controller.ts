import { NextFunction, Request, Response } from "express";
import { catchAync } from "../../utils/catchAsync";
import { authService } from "./auth.service";
import httpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse";

const loginUser = catchAync(async (req: Request, res: Response, next: NextFunction) => {
   const payload = req.body;

   const loginResult = await authService.loginUserIntoDB(payload);


   sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User logged in successfully!",
    data: loginResult
   });
});


export const authController = {
    loginUser
}