// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import { app } from './app.js';

// dotenv.config(); 

// const MONGODB_URI = process.env.MONGO_URI;

// if (!MONGODB_URI) {
//     console.error(" MONGO_URI is not defined in .env file");
//     process.exit(1); 
// }

// mongoose.connect(MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
// .then(() => {
//     console.log("Connected to MongoDB");

//     // Start the server after DB connection
//     app.listen(process.env.PORT || 8080, () => {
//         console.log(`⚙️ Server is running at port: ${process.env.PORT || 8080}`);
//     });
// })
// .catch((err) => {
//     console.error("MongoDB connection failed:", err);
// });

import dotenv from "dotenv"
import mongoose from "mongoose"
import { app } from "./app.js"

dotenv.config();

const MONGODB_URI=process.env.MONGO_URI;

if(!MONGODB_URI){
    console.error("mongo db uri is not defined in .env file");
    process.exit(1);

}

mongoose.connect(MONGODB_URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
    
}).then(()=>{
    console.log("Mongo db connected");
    app.listen(process.env.PORT||8080,()=>{
        console.log(`Server is  running at port: ${process.env.PORT || 8080} `)
    })
}).catch((err)=>{
        console.error("Mongo db id not connected",err);
})