const mongoose = require("mongoose");

const uri = process.env.MONGO_URI_MAIN;

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};
if(process.env.NODE_ENV == "production") {
    // Connect to aws documentDB
    const conn = mongoose.connect(uri, 
        {
            tlsCAFile: `global-bundle.pem`, //Specify the DocDB; cert
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
        function(err, client) {
            if(err) {
                throw err;
            }
        }
    );
    module.exports = conn
}
else {
    // Connect MongoDB Atlas using mongoose connect method
    const conn = mongoose.connection;
    conn.openUri(uri, options).then(() => {
        console.log("Database connection established!");
    },
    err => {
        {
            console.log("Error connecting Database instance due to:", err);
        }
    }
    );
    module.exports = conn
}   

// mongoose.connect(uri, options).then(() => {
//     console.log("Database connection established!");
// },
//     err => {
//         {
//             console.log("Error connecting Database instance due to:", err);
//         }
//     });
// const db = mongoose.connection;
// //    console.log(db);
// module.exports = db;

