import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
    name: String,
    grade: Number,
});

const subjectSchema = new mongoose.Schema({
    name: String,
    grade: Number,
    lessons: [lessonSchema],
});

const studySchema = new mongoose.Schema({
    userId: String,
    age: Number,
    system: String,
    subjects: [subjectSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("StudyProfile", studySchema);
