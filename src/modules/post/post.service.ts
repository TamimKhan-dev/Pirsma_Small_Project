import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
  ICreatePostPayload,
  IPostQuery,
  IUpdatePostPayload,
} from "./post.interface";

const createPostIntoDB = async (
  payload: ICreatePostPayload,
  userId: string,
) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });

  return result;
};

const getAllPostsFromDB = async (query: IPostQuery) => {
  const limit: number = query.limit ? Number(query.limit) : 10;
  const page: number = query.page ? Number(query.page) : 1;
  const skip: number = (page - 1) * limit;
  const sortBy: string = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder: string = query.sortOrder ? query.sortOrder : "desc";

  const tags = query.tags ? JSON.parse(query.tags as string) : null;

  const tagsArray = Array.isArray(tags) ? tags : [];

  const andConditions: PostWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          title: { contains: query.searchTerm, mode: "insensitive" },
        },
        {
          content: { contains: query.searchTerm, mode: "insensitive" },
        },
      ],
    });
  }

  if (query.title) {
    andConditions.push({
      title: query.title,
    });
  }

  if (query.content) {
    andConditions.push({
      content: query.content,
    });
  }

  if (query.authorId) {
    andConditions.push({
      authorId: query.authorId,
    });
  }

  if (query.isFeatured) {
    andConditions.push({
      isFeatured: Boolean(query.isFeatured),
    });
  }

  if (query.tags) {
    andConditions.push({
      tags: {
        hasSome: tagsArray,
      },
    });
  }

  if (query.status) {
    andConditions.push({
      status: query.status,
    });
  }

  const posts = await prisma.post.findMany({
    // Dynamic searching, Filtering
    where: {
      AND: andConditions,
    },
    // Dynamic Pagination and Sorting
    take: limit,
    skip: skip,

    orderBy: {
      [sortBy]: sortOrder,
    },

    include: { author: { omit: { password: true } }, comments: true },
  });

  return posts;
};

const getPostsStats = async () => {
  const transctionResult = await prisma.$transaction(async (tx) => {
    const [
      totalPosts,
      totalPublishedPosts,
      totalDraftPosts,
      totalArchivedPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPostViewsAggregate,
    ] = await Promise.all([
      await tx.post.count(),
      await tx.post.count({ where: { status: PostStatus.PUBLISHED } }),
      await tx.post.count({ where: { status: PostStatus.DRAFT } }),
      await tx.post.count({ where: { status: PostStatus.ARCHIVED } }),
      await tx.comment.count(),
      await tx.comment.count({ where: { status: CommentStatus.APPROVED } }),
      await tx.comment.count({ where: { status: CommentStatus.REJECTED } }),
      await tx.post.aggregate({ _sum: { views: true } }),
    ]);

    return {
      totalPosts,
      totalPublishedPosts,
      totalDraftPosts,
      totalArchivedPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPostViews: totalPostViewsAggregate._sum.views,
    };
  });

  return transctionResult;
};

const getMyPostsFromDB = async (authorId: string) => {
  const result = await prisma.post.findMany({
    where: { authorId },
    orderBy: { createdAt: "desc" },
    include: {
      comments: true,
      author: { omit: { password: true } },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return result;
};

const getPostByIdFromDB = async (postId: string) => {
  // await prisma.post.update({
  //   where: { id: postId },
  //   data: { views: { increment: 1 } },
  // });

  // const post = await prisma.post.findUniqueOrThrow({
  //   where: {
  //     id: postId,
  //   },
  //   include: {
  //     author: {
  //       omit: {
  //         password: true,
  //       },
  //     },
  //     comments: {
  //       where: {
  //         status: CommentStatus.APPROVED,
  //       },
  //       orderBy: {
  //         createdAt: "desc",
  //       },
  //     },
  //     _count: {
  //       select: { comments: true },
  //     },
  //   },
  // });

  // return post;

  const transactionResult = await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });

    const post = await tx.post.findUniqueOrThrow({
      where: {
        id: postId,
      },
      include: {
        author: {
          omit: {
            password: true,
          },
        },
        comments: {
          where: {
            status: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    return post;
  });

  return transactionResult;
};

const updatePostInDB = async (
  postId: string,
  payload: IUpdatePostPayload,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({ where: { id: postId } });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You are not the owner of this Post!");
  }

  const result = await prisma.post.update({
    where: { id: postId },
    data: payload,
    include: { author: { omit: { password: true } }, comments: true },
  });

  return result;
};

const deletePostFromDB = async (
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({ where: { id: postId } });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You are not the owner of this Post!");
  }

  const result = await prisma.post.delete({
    where: { id: postId },
  });
};

export const postService = {
  createPostIntoDB,
  getAllPostsFromDB,
  getPostsStats,
  getMyPostsFromDB,
  getPostByIdFromDB,
  updatePostInDB,
  deletePostFromDB,
};
