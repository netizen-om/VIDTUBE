// id string pk
// username string
// email string
// fullName string
// avatar string
// coverImage string
// watchHistory ObjectId[] videos
// password string
// refreshToken string
// createdAt Date
// updatedAt Date

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
        username: {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true ,
            index : true
        },
        email: {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true 
        },
        fullName : {
            type : String,
            required : true,
            trim : true ,
            index : true
        },
        avatar : {
            type : String, //cloudnary URL
            required : true,
        },
        coverImage : {
            type : String, //cloudnary URL
        },
        watchHistory : [
            {
                type : Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password : {
            type : String ,
            required : [true , "Password is required"]
        },
        refreshToken : {
            type : String
        }
    },
    { timestamps : true}
)

UserSchema.pre("save" , async function(next) {

    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password , 10)
    next();
})

UserSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password,this.password)
}

UserSchema.methods.generateAccessToken = function() {
    //short lived acess JWT token
    return jwt.sign({ 
        id : this._id,
        username : this.username,
        email : this.email,
        fullName : this.fullName
     },
     process.env.ACCESS_TOKEN_SECRET,
    { expiresIn : process.env.ACCESS_TOKEN_EXPIRY});
}

UserSchema.methods.generateRefreshToken = function() {
    return jwt.sign({ 
        id : this._id,
     },
     process.env.REFRESH_TOKEN_SECRET,
    { expiresIn : process.env.REFRESH_TOKEN_EXPIRY});
}

export const User = mongoose.model("User", UserSchema)