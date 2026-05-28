import mongoose from "mongoose";

let connectionPromise;

function connect(){
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is required");
    }

    if (mongoose.connection.readyState === 1) {
        return Promise.resolve(mongoose.connection);
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = mongoose.connect(process.env.MONGODB_URI).then(() => {
        console.log("Connected to MongoDBs");
        return mongoose.connection;
    }).catch(err => {
        console.log(err);
        connectionPromise = null;
        throw err;
    });

    return connectionPromise;
}


export default connect;
