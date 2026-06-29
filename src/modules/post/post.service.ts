import { prisma } from "../../lib/prisma";
import { ICreatePostPayload } from "./post.interface";

const createPostIntoDB = async (payload: ICreatePostPayload, userId: string) => {
    const result = await prisma.post.create({ 
        data: {
            ...payload,
            authorId: userId
        }
    });

    return result;
};

const getAllPostsFromDB = async () => {
    const posts = await prisma.post.findMany({
        include: { author: { omit: { password: true } }, comments: true }
    });

    return posts;
};

const getPostsStats = async () => {};

const getMyPostsFromDB = async () => {};

const getPostByIdFromDB = async () => {};

const updatePostInDB = async () => {};

const deletePostFromDB = async () => {};

export const postService = {
    createPostIntoDB,
    getAllPostsFromDB,
    getPostsStats,
    getMyPostsFromDB,
    getPostByIdFromDB,
    updatePostInDB,
    deletePostFromDB
};