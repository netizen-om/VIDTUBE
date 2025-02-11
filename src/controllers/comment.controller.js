import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const GetAllCommentsOfAVideo = syncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new ApiError(404, "Video Not Found")
    }

    const pipeline = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "comment_owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1

                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                comment_owner: {
                    $arrayElemAt: ["$comment_owner", 0]
                }
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "liked_by"
            }
        },
        {
            $addFields: {
                TotalLikesonComment: {
                    $size: "$liked_by"
                }
            }
        },

        {
            $addFields: {
                isLikedByCurrentUser: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$liked_by.likedBy"]
                        },
                        then: true,
                        else: false

                    }
                }
            }
        },
        {

            $sort: {
                createdAt: -1
            }

        }

    ]
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    try {
        const AllComments = await Comment.aggregatePaginate(Comment.aggregate(pipeline), options)

        return res
            .status(200)
            .json(new ApiResponse(
                200,
                AllComments,
                "All Comments fetched Successfully"
            ))
    } catch (error) {
        throw new ApiError(401, "Error while Getting All comments")
    }
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
}