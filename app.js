const config = require('./config/environments');
const nodeCron = require('node-cron');
const scrapeAndStore = require('./controllers/opportunities.controller')
// console.log(process.env);
const path = require('path');

require("./config/db/mongo");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

//require routes
const testRoutes = require("./routes/test.route");
const apiRoutes = require("./routes/index");
const app = express();

console.log(`NODE_ENV=${process.env.NODE_ENV}`);


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

app.use("/tests", testRoutes);
app.use("/api/v1/", apiRoutes);
/* 
if (process.env.NODE_ENV.trim() == 'production') {
    console.log('setting up link to angular');
    console.log(path.join(__dirname, 'dist/web-frontend'));
    app.use(express.static(path.join(__dirname, 'dist/web-frontend')));
    app.get('*', function (req, res) {
        res.sendFile(path.join(__dirname, 'dist/web-frontend/index.html'));
    });
}


*/



app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}`);
});





module.exports = app;