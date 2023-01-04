const ffmpegPath = require("@ffmpeg-installer/ffmpeg"); // 自动为当前node服务所在的系统安装ffmpeg
const ffmpeg = require("fluent-ffmpeg");
const express = require("express");
const webSocketStream = require("websocket-stream/stream");
const expressWebSocket = require("express-ws");

ffmpeg.setFfmpegPath(ffmpegPath.path);

/**
 * 创建一个后端服务
 */
function createServer() {
    const app = express();
    app.use(express.static(__dirname));
    expressWebSocket(app, null, {
        perMessageDeflate: true,
    });
    app.ws("/audio/", rtspToFlvHandle);
    app.ws("/video/", rtspToFlvHandle);

    app.get("/", (req, response) => {
        response.send("当你看到这个页面的时候说明rtsp流媒体服务正常启动中......");
    });

    app.listen(8100, () => {
        console.log("转换rtsp流媒体服务启动了，服务端口号为8100");
    });
}

/**
 * rtsp 转换 flv 的处理函数
 * @param ws
 * @param req
 */
function rtspToFlvHandle(ws, req) {
    let duration = 0
    let t = null
    let command = null
    const stream = webSocketStream(ws, {
        binary: true,
    });
    const url = new Buffer(req.query.url, "base64").toString();
        let wucha = req.url.includes('audio') ? 5 : 1.5
        ffmpeg(url)
        .ffprobe((err, metadata) => {
            console.log(metadata.format.duration);
            command = ffmpeg(url)
            .on("start", (commandLine) => {
                // commandLine 是完整的ffmpeg命令
                console.log(commandLine, "转码 开始");
            })
            .on("codecData", function (data) {
                console.log(data, "转码中......");
            })
            .on("progress", function (progress) {
                duration = 0
                console.log(progress, "转码进度");
            })
            .on("error", function (err) {
                console.log(url, "转码 错误: ", err);
            })
            .on("end", function () {
                console.log(url, "转码 结束!");
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
            .duration(metadata.format.duration - wucha)
            .pipe(stream)
        })
        

        // console.log(3333)
        // setTimeout(() => {
        //     console.log(command, 123123)
        // }, 15000);
        // t = setInterval(() => {
        //     duration += 1
        //     if(duration > 5) {
        //         clearInterval(t)
        //         command._events.prefinish()
        //     console.log(duration, command)
        //     }
        // }, 1000)

}


createServer();