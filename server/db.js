import mongoose from "mongoose";

export const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.warn("⚠️  MONGO_URI not found. MongoDB features will be disabled.");
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        // Don't exit process, allow server to run for other features
    }
};
