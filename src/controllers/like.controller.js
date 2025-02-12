import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponce from "../utils/ApiResponse.js"
import { Like } from "../models/like.models.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
    const {videoId} = req.params
    if(!videoId){
        return res
                .status(401)
                .json(new ApiError(401, "Video not found"))
    }
    
    const isLikedVideo = await Like.findOne({ video : videoId, likedBy: req.user?._id })
    if(isLikedVideo){
        const deletedLike = await Like.findOneAndDelete({ video : videoId, likedBy: req.user?._id })
        return res
                .status(200)
                .json(new ApiResponce(200, deletedLike, "Liked removed succesfully"))
    } else {
        const likedVideo = await Like.create({
            video : videoId,
            likedBy : req.user?._id
        })
        if(!likedVideo){
            throw new ApiError(401, "Unable to Like the Video")
        }

        return res
                .status(200)
                .json(new ApiResponce("200", likedVideo, "Video Liked Successfully"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId){
        return res
                .status(401)
                .json(new ApiError(401, "Comment not found"))
    }
    
    const isLikedComment = await Like.findOne({ comment : commentId, likedBy : req.user?._id })
    if(isLikedComment){
        const deletedLike = await Like.findOneAndDelete({ comment : commentId, likedBy : req.user?._id })
        return res
                .status(200)
                .json(new ApiResponce(200, deletedLike, "Liked removed succesfully"))
    } else {
        const likedComment = await Like.create({
            comment : commentId,
            likedBy : req.user?._id
        })
        if(!likedComment){
            throw new ApiError(401, "Unable to Like the Comment")
        }

        return res
                .status(200)
                .json(new ApiResponce("200", likedVideo, "Comment Liked Successfully"))
    }


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId){
        return res
                .status(401)
                .json(new ApiError(401, "Tweet not found"))
    }
    
    const isLikedTweet = await Like.findOne({ tweet : tweetId, likedBy : req.user?._id })
    if(isLikedComment){
        const deletedLike = await Like.findOneAndDelete({ tweet : tweetId, likedBy : req.user?._id })
        return res
                .status(200)
                .json(new ApiResponce(200, deletedLike, "Liked removed succesfully"))
    } else {
        const likedTweet = await Like.create({
            tweet : tweetId,
            likedBy : req.user?._id
        })
        if(!likedTweet){
            throw new ApiError(401, "Unable to Like the Tweet")
        }

        return res
                .status(200)
                .json(new ApiResponce("200", likedVideo, "Tweet Liked Successfully"))
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}