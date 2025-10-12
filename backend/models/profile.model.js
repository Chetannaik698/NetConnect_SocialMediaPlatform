import mongoose, { Schema } from "mongoose";

const educationschema = new Schema({
    school: {
        type: String,
        default: ''
    },
    degree: {
        type: String,
        default: ''
    },
    fieldOfStudy: {
        type: String,
        default: ''
    },
})

const workSchema = new Schema({
    company: {
        type: String,
        default: ''
    },
    position: {
        type: String,
        default: ''
    },
    years: {
        type: String,
        default: ''
    },
})

const ProfileSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    bio: {
        type: String,
        default: ''
    },
    currPost: {
        type: String,
        default: ''
    },
    pastWork: {
        type: [workSchema],
        default: []
    },
    education: {
        type: [educationschema],
        default: []
    }
})

const Profile = mongoose.model("Profile", ProfileSchema)
export default Profile