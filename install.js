//install.js

const nodeWindow = require("node-windows")
const Service = nodeWindow.Service
const path = require("path")

let svc = new Service({
  name: "rtsp-to-flv-node", //名称
  description: "流媒体服务", //描述
  script: path.resolve("./server.js"), //node执行入口文件
  nodeOptions: ["--harmony", "--max_old_space_size=4096"]
})

svc.on("install", function () {
  svc.start()
  if(svc.exists){
    console.log('服务安装成功')
  }
})

svc.install()
