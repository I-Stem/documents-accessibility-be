const conn = require("../config/db/mongo");
conn.once().then(result=>console.log("open"))
.catch(err=>console.log(err));
