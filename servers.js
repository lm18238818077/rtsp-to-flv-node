const ffmpegPath = require("@ffmpeg-installer/ffmpeg"); // 自动为当前node服务所在的系统安装ffmpeg
const ffmpeg = require("fluent-ffmpeg");
const express = require("express");
const path = require("path");
const https = require('https');
const fs = require('fs')
const webSocketStream = require("websocket-stream/stream");
const expressWebSocket = require("express-ws");


ffmpeg.setFfmpegPath(ffmpegPath.path);

const requestConf = require(path.join(process.cwd(), 'conf.js'));

/**
 * 创建一个后端服务
 */
function createServer() {
    const app = express();
    app.use(express.static(__dirname));
    const options = {
        key: fs.readFileSync(path.join(__dirname, "221-204-213-61.key")),
        cert: fs.readFileSync(path.join(__dirname, "221-204-213-61.crt")),
    };
    const server = https.createServer(options, app);
    expressWebSocket(app, server);
    app.ws("/video/", rtspToFlvHandle);
    app.get("/", (req, response) => {
        response.send("当你看到这个页面的时候说明rtsp流媒体服务正常启动中......");
    });
    server.listen(requestConf.port, () => {
        console.log(`转换rtsp流媒体服务启动了，服务端口号为${requestConf.port}`);
    });

    
}

/**
 * rtsp 转换 flv 的处理函数
 * @param ws
 * @param req
 */
function rtspToFlvHandle(ws, req) {
    let WAITTIME = 30
    let duration = 0
    let t = null
    let command = null
    const stream = webSocketStream(ws, {
        binary: true,
    });
    const closed = (type) => {
        if(type) {
            command._events.close[0]()
        }
        if(t) {
            clearInterval(t)
        }
        duration = 0
    }
    const url = req.query.url
        command = ffmpeg(url)
            .on("start", (commandLine) => {
                console.log(commandLine, 'commandLine')
            // commandLine 是完整的ffmpeg命令
        })
        .on("codecData", function (data) {
            console.log(data, 'data')
            t = setInterval(() => {
                duration += 1
                if(duration > WAITTIME) {
                    closed(true)
                }
            }, 1000)
        })
        .on("progress", function (progress) {
            duration = 0
        })
            .on("error", function (err) {
            console.log(err)
            closed()
        })
        .on("end", function () {
            closed()
        })
        .addOutputOption(
            "-threads",
            "4", // 一些降低延迟的配置参数
            "-tune",
            "zerolatency",
            "-preset",
            "superfast"
        )
        .audioCodec("aac")
        .outputFormat("flv")
        .videoCodec("libx264") // ffmpeg无法直接将h265转换为flv的，故需要先将h265转换为h264，然后再转换为flv
        // .withSize('50%') // 转换之后的视频分辨率原来的50%, 如果转换出来的视频仍然延迟高，可按照文档上面的描述，自行降低分辨率
        //.noAudio() // 去除声音
        .pipe(stream, {end: true})

}


createServer();