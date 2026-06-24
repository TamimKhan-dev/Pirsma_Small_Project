import express, { Application, Request, Response } from "express";
import config from "./config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRouter } from "./modules/users/user.route";
import { authRoutes } from "./modules/auth/auth.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", async (req: Request, res: Response) => {
  res.status(200).json({
    message: `Express Server is running on Port: ${config.port}`,
    author: "Tamim Khan",
    learningTopic: "Prisma",
  });
});

app.use("/api/users", userRouter);
app.use("/api/auth", authRoutes);

export default app;
