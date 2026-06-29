import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { postService } from "./post.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;

    const payload = req.body;

    const result = await postService.createPostIntoDB(payload, id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Post created successfully",
      data: result,
    });
  },
);

const getAllPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await postService.getAllPostsFromDB();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Posts Retrieved successfully",
      data: result,
    });
  },
);

const getPostsStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

const getMyPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;

    const result = await postService.getMyPostsFromDB(authorId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "My Posts Retrieved successfully",
      data: result,
    });
  },
);

const getPostById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;

    if (!postId) {
      throw new Error("Post ID is required In Params");
    }

    const result = await postService.getPostByIdFromDB(postId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Post Retrieved successfully",
      data: result,
    });
  },
);

const updatePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

const deletePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

export const postController = {
  createPost,
  getAllPosts,
  getPostsStats,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
};
