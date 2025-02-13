import mongoose, {Aggregate, isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponce from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist
    const {name, description} = req.body
    
    const { videoId } = req.params

    if(!name || !description){
        throw new ApiError(400, "name and describtion required")
    }
    
    const createdPlaylist = await Playlist.create({
        name,
        description,
        owner : req.user?._id,
        videos : []
    })
    
    return res 
    .status(200)
    .json(new ApiResponce(200, createPlaylist, "playlist created successfull"))
    
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    
    if (!userId) {
      throw new ApiError(404, "user Id not found")
      
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(404, "User not found")
    }

    const UserPlaylists = await Playlist.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(userId)
          }
        },
        {
          $lookup: {
            from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videos",
          }
        },
        {
          $addFields: {
            TotalVideos: {
              $size: "$videos"
            }
          }
        },
        {
          $addFields: {
            TotalViews: {
              $sum : "$videos.views"
            }
          }
        },
        {
            $project:{
                TotalVideos:1,
                TotalViews:1,
                name:1,
                description:1,
                createdAt:1
            }
        }
        
      ])

      if(Array.isArray(UserPlaylists) && UserPlaylists.length === 0){
        return res
                .status(200)
                .json(new ApiResponce(
                    200,
                    [],
                    "User has 0 Playlists"
                ))
      }

      return res
      .status(200)
      .json(new ApiResponse(
        200,
        UserPlaylists,
        "All Playlists fetched successfully"
      ))


})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!playlistId) {
      throw new ApiError(404, "playlistId not found")
      
    }
    if (!isValidObjectId(playlistId)) {
      throw new ApiError(404, "playlist not found")
    }
    
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
      throw new ApiError(404, "Error fetching playlist") 
    }
    
    return res
            .status(200)
            .json(new ApiResponce(200, playlist, "Playlist found"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!playlistId) {
      throw new ApiError(404, "playlistId not found")
      
    }
    if (!isValidObjectId(playlistId)) {
      throw new ApiError(404, "playlist not found")
    }

    if (!videoId) {
      throw new ApiError(404, "videoId not found")
      
    }
    if (!isValidObjectId(videoId)) {
      throw new ApiError(404, "Video not found")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
      throw new ApiError(404, "Error fetching playlist") 
    }
    const videocheck = await Video.findById(videoId)

    if (!videocheck) {
        throw new ApiError(401, "Video Does not Exist")
    }

    playlist.videos.push(new mongoose.Types.ObjectId(videoId))
    const updatedPlaylist = await playlist.save()

    if (!updatedPlaylist) {
      throw new ApiError(401, "Unable to add video")
  }

    return res
        .status(200)
        .json(new ApiResponce(200, updatePlaylist, "Video added to playlist"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if (!playlistId) {
      throw new ApiError(404, "playlistId not found")
      
    }
    if (!isValidObjectId(playlistId)) {
      throw new ApiError(404, "playlist not found")
    }

    if (!videoId) {
      throw new ApiError(404, "videoId not found")
      
    }
    if (!isValidObjectId(videoId)) {
      throw new ApiError(404, "Video not found")
    }

    const videocheck = await Video.findById(videoId)

    if (!videocheck) {
        throw new ApiError(401, "Video Does not Exist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, 
      {
        $pull : {
          videos : {
            $in : [videoId]
          }
        }
      },
      { new : true}
    )


    if (!updatedPlaylist) {
      throw new ApiError(404, "Error fetching playlist") 
    }
    
    return res
        .status(200)
        .json(new ApiResponce(200, updatedPlaylist, "Video deleted from playlist"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!playlistId) {
      throw new ApiError(404, "playlistId not found")
      
    }
    if (!isValidObjectId(playlistId)) {
      throw new ApiError(404, "playlist not found")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!deletePlaylist){
      throw new ApiError(404, "Error deleting playlist")
    }

    return res
            .status(200)
            .json(new ApiResponce(200, deletePlaylist, "Playlist deleted"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!playlistId) {
      throw new ApiError(404, "playlistId not found")
      
    }
    if (!isValidObjectId(playlistId)) {
      throw new ApiError(404, "playlist not found")
    }

    if(!name || !description){
      throw new ApiError(401, "Name or description is required to update playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
      {
        $set : {
          name,
          description
        }
      },
      { new : true }
    )

    if(!updatePlaylist){
      throw new ApiError(401, "unable to update playlist")
    }

    return res
            .status(200)
            .json(new ApiResponce(200, updatePlaylist, "Playlisy updated"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}