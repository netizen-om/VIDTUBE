import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadCloudinary} from "../utils/cloudnary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if(!title || !description){
        throw new ApiError(400, "title or description is required")
    }
    
    const videoLocalPath = req.files?.video[0].path
    
    if(!videoLocalPath) {
        throw new ApiError(400, "video not found")
    }
    
    const uploadedVideo = await uploadCloudinary(videoLocalPath)
    
    if(!uploadedVideo) {
        throw new ApiError(400, "Unable to upload video")
    }

    const coverImageLocalPath = req.files?.coverImage[0].path  
    
    if(!coverImageLocalPath) {
        throw new ApiError(400, "coverImage not found")
    }
    
    const uploadedCoverImage = await uploadCloudinary(coverImageLocalPath)
    
    if(!uploadedCoverImage) {
        throw new ApiError(400, "Unable to upload cover Image")
    }
    
    const createdVideo = await Video.create({
        videoFile : {
            url : uploadedVideo.url,
            public_id : uploadedVideo.public_id
        },
        thumbnail : {
            url : uploadedCoverImage.url,
            public_id : uploadedCoverImage.public_id
        },
        title,
        description,
        isPublished: true,
        owner: req.user?._id
    })
    
    if(!createdVideo) {
        throw new ApiError(400, "Unable to upload Video")
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200, createdVideo, "Video uploaded"))
    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    
    if(!videoId) {
        throw new ApiError(400, "Video ID not available")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Video ID is not valid Object ID")
    }
    
    const video = await Video.findById(videoId)
    
    if(!video){
        throw new ApiError(400, "Video not found")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, video, "Video found"))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}