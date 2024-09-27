import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
};
const connection: ConnectionObject = {};

async function connectDB() : Promise<void> {
    if (connection.isConnected) {
        console.log("Already connected with DB");
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "", {});
        connection.isConnected = db.connections[0].readyState;
        console.log("Connected with DB");
        return;
    } catch (error) {
        console.log("Error connecting with DB", error);
        process.exit(1);
    }
}

export default connectDB;