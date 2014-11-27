var http = require("http");
var fs = require('fs');
var queryString = require("querystring");

http.createServer(function (request, response) {

    if (request.method == 'POST') {
        console.log("NodeLevelSaver | incoming POST request | processing");
        var body = '';

        request.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            /*if (body.length > 1e6) {
                console.log("NodeLevelSaver | incoming POST request | Too much POST data, killing connection");
                request.connection.destroy();
            }*/
        });
        request.on('end', function () {
            var post = queryString.parse(body);
            console.log("NodeLevelSaver | incoming POST request | processing success, name : ", post.name);

            var path = "level/" + getDateTime() + "_" + post.name;
            writeFile(post, path + ".json");
            writeImage(post.toDataURL, path + ".png");
        });
    } else {
        console.log("NodeLevelSaver | incoming GET request | ignoring");
    }

}).listen(8888);

console.log("NodeLevelSaver | server online");

function writeFile(levelData, path) {
    fs.open(path, "w", function(err, fd) {
        if (err) {
            console.log("NodeLevelSaver | writeFile | open error : ", err);
        } else {
            fs.writeFile(path, levelData.data, function(werr) {
                if (werr) {
                    console.log("NodeLevelSaver | writeFile | write error : ", werr);
                } else {
                    console.log("NodeLevelSaver | writeFile | File " + path + " was saved!");
                }
            });
        }
    });
}

function writeImage(data, path) {
    //base64Data = base64Data.replace(/^data:image\/png;base64,/, "");

    var base64Data =  data.replace(/^data:image\/png;base64,/, "");
    base64Data += base64Data.replace('+', ' ');
    var binaryData =  new Buffer(base64Data, 'base64').toString('binary');

    fs.writeFile(path, binaryData, "binary", function(err) {
        if (err) {
            console.log("NodeLevelSaver | writeImage | write error : ", err);
        } else {
            console.log("NodeLevelSaver | writeImage | Image " + path + " was saved!");
        }
    });
}

var date;
var monthDict = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function getDateTime() {
    date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth();// + 1;
    month = monthDict[month];//(month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return day + month + "_" + hour + "h" + min + "m" + sec + "s";
}