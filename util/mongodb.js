import mongoose from "mongoose";

let uri = process.env.MONGODB_URI;
let dbName = process.env.MONGODB_DB;

const connection = {};

export default async function connectToDatabase() {
  if (connection.isConnected) {
    return;
  }

  const db = await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  connection.isConnected = db.connections[0].readyState;

  console.log(connection.isConnected);
}
