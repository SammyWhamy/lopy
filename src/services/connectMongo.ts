import mongoose from "mongoose";

export async function connectMongo() {
    if(!process.env.MONGO_URI) {
        throw Error(`No Database URI provided.`);
    }

    mongoose.connection.on('connecting', () => {
        console.debug(`[Mongo] Database connecting`);
    });

    mongoose.connection.on('connected', () => {
        console.info(`[Mongo] Database connected`);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn(`[Mongo] Database disconnected`);
    });

    mongoose.connection.on('reconnected', () => {
        console.info(`[Mongo] Database reconnected`);
    });

    mongoose.connection.on('error', (err) => {
        console.error(`[Mongo] Database error\n\n${err}`);
    });

    mongoose.set('strictQuery', true);
    await mongoose.connect(process.env.MONGO_URI);
}
