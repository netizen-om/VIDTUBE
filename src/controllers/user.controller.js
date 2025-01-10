import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"
import { uploadCloudinary, deleteFromCloudinary } from "../utils/cloudnary.js"
import jwt from "jsonwebtoken"


const registerUser = asyncHandler(async (req, res) => {
    console.log("I'm in user controller");

    const { fullName, email, username, password } = req.body

    //validation is on our side we can use other library and etc.
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        console.log("Full name :", fullName);
        console.log("Email :", email);
        console.log("user name :", username);
        console.log("password :", password);

        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError("409", "User with email or username already exists")
    }

    console.log(req.files);


    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverLocalPath = req.files?.coverImage?.[0]?.path;


    if (!avatarLocalPath) {
        throw new ApiError("400", "Avatar file is missing")
    }

    // const avatar = await uploadCloudinary(avatarLocalPath)
    // let coverImage = ""
    // if(coverLocalPath){
    //     coverImage = await uploadCloudinary(coverLocalPath)
    // }

    let avatar;
    try {
        avatar = await uploadCloudinary(avatarLocalPath)
        console.log("Avatar uploaded : ", avatar);
    } catch (error) {
        console.log("Error uploading avatar", error);
        throw new ApiError("500", "Failed to upload avatar")
    }

    let coverImage;
    try {
        coverImage = await uploadCloudinary(coverLocalPath)
        console.log("coverImage uploaded : ", coverImage);
    } catch (error) {
        console.log("Error uploading coverImage", error);
        throw new ApiError("500", "Failed to upload coverImage")
    }

    try {
        const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            username: username.toLowerCase(),
            password
        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if (!createdUser) {
            throw new ApiError(500, "Somenting went wrong while registering user")
        }

        return res
            .status(201)
            .json(new ApiResponse(200, createdUser, "User register succesfully"))
    } catch (error) {
        console.log("User creation Failed");
        console.log(error);

        if (avatar) {
            await deleteFromCloudinary(avatar.public_id)
        }
        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id)
        }

        throw new ApiError(500, "Somenting went wrong while registering user and Images are Deleted")
    }

})

const generateAccessAndRefreshToken = async (userid) => {
    try {
        const user = await User.findById(userid)

        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        user.refreshToken = refreshToken
        await user.save({ ValidateBeforeSave: false })

        return { refreshToken, accessToken }
    } catch (error) {
        throw new ApiError(500, "Something wet wrong while generating Refresh Token and Access Token")
    }
}

const loginUser = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body

    if (!email) {
        throw new ApiError(400, "Email is required")
    }

    const user = await User.findOne({
        $or: [{ username, email }]
    })

    if (!user) {
        throw new ApiError(400, "User not found")
    }

    const isUserValid = await User.isPasswordCorrect(password)

    if (!isUserValid) {
        throw new ApiError(400, "Invalid User Credentials")
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)

    const loggendInUser = await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res.status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(new ApiResponse(
            200,
            { user: loggendInUser, accessToken, refreshToken },
            "User logged in successfuly"
        ))

})

const logOutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const option = {
        httpOnly : true,
        secure : process.env.NODE_ENV !== "production"
    }

    return res
            .status(200)
            .clearCookie("accessToken" , option)
            .clearCookie("refreshToken" , option)
            .json(new ApiResponse(200, {} , "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken 

    if(!incomingRefreshToken){
        throw new ApiError(401, "Refresh Token is required")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
        
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Invalid refresh token")
        }

        const option = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }

        const { accessToken , refreshToken : newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
                .status(200)
                .cookie("accessToken", accessToken, option)
                .cookie("refreshToken", newRefreshToken, option)
                .json(new ApiResponse(
                    200,
                    { accessToken , refreshToken : newRefreshToken  },
                    "Access Tokem Refresed successfully"
                ))
    } catch (error) {
        throw new ApiError(500 , "Something went wrong whlie refreshing access token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {newPasword , oldPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordValid =  await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid){
        throw new ApiError(401 , "Old Password is Invalid")
    }

    user.password = newPasword
    await user.save({ ValidateBeforeSave : false })

    return res
            .status(200)
            .json(new ApiResponse(200, {} , "Password change succesfully"))
})

const getCurentUser = asyncHandler(async(req,res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user , "Current user details"))
})

const updateAccountDetails = asyncHandler(async(req,res) => {
    const {fullName , email , username} = req.body

    if(!fullName || !email || !username){
        throw new ApiError(400, "All fields are required")
    }

    const user = User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                fullName,
                email,
                username
            },  
        },
        {
            new : true
        }
    ).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200, user , "User details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res) => {
    const avatarLocalPath = req.files?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }
    
    const avatar = await uploadCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(500, "Failed to upload avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                avatar : avatar.url
            }
        },
        {
            new : true
        }
    ).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200, user , "User avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async(req,res) => {
    const coverLocalPath = req.flies?.path

    if(!coverLocalPath){
        throw new ApiError(400, "Cover Image is missing")
    }

    const coverImage = await uploadCloudinary(coverLocalPath)

    if(!coverImage.url){
        throw new ApiError(500, "Failed to upload Cover image")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                coverImage : coverImage.url
            }
        },
        { new : true }
    ).select("-password -refreshToken")

    return res
            .status(200)
            .json(new ApiResponse(200 , user , "Cover Image updated successfully"))

})

const getUserChannelProfile = asyncHandler(async(req,res) => {
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400, "Username is required")
    }

    const channel = await User.aggregate(
        [
            {
                $match : {
                    username : username.toLowerCase()
                }
            },
            {
                $lookup : {
                    from : "subscriptions",
                    localField : "_id",
                    foreignField : "channel",
                    as : "subscribers"
                }
            },
            {
                $lookup : {
                    from : "subscriptions",
                    localField : "_id",
                    foreignField : "subscriber",
                    as : "subscriberedTo"
                }
            },
            {
                $addFields : {
                    subscriberCount : {
                        $size : "$subscribers"
                    },
                    channelsSubscribedToCount : {
                        $size : "$subscriberedTo"
                    },
                    isSubscribed : {
                        $if : {$in : [req.user?._id , "$subscribers.subscriber"]},
                        then : true,
                        else : false
                    }
                        
                }
            },
            {
                //projetc only the neccessary Data
                $project : {
                    fullName : 1,
                    username : 1,
                    avatar : 1,
                    subscriberCount : 1,
                    channelsSubscribedToCount : 1,
                    isSubscribed : 1,
                    coverImage : 1,
                    email : 1
                }
            }
        ]
    )

    if(!channel?.length){
        throw new ApiError(404, "Channel not found")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, channel[0] , "Channel profile fetched successfully"))
})

const getWatchHistory = asyncHandler(async(req,res) => {
    const user = await User.aggregate(
        [
            {
                $match : {
                    //Never use "req.user._id" directly in Aggregation pipeline as It always require specific Mongoose ObjectID Only.
                    _id : new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $lookup : {
                    from : "videos",
                    localField : "watchHistory",
                    foreignField : "_id",
                    as : "watchHistory",
                    pipeline : [
                        {
                            $lookup : {
                                from : "users",
                                localField : "owner",
                                foreignField : "_id",
                                as : "owner",
                                pipeline : [
                                    {
                                        $project : {
                                            fullName : 1,
                                            username : 1,
                                            avatar : 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields : {
                                owner : { 
                                    $first : "$owner"
                                }
                            }
                        }
                    ]
                        
                }
            }
        ]
    )

    if(!user?.length){
        throw new ApiError(404, "User not found")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, user[0]?.watchHistory , "Watch history fetched successfully"))
})    

export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logOutUser,
    changeCurrentPassword,
    getCurentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory 
}