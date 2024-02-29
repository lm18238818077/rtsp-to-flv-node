//uninstall.js

const nodeWindow = require("node-windows")
const Service = nodeWindow.Service
const path = require("path")

let svc = new Service({
  name: "rtsp-to-flv-node", //名称
  script: path.resolve('./server.js'), //node执行入口文件
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
})

svc.on('uninstall', function () {
  if (!svc.exists) {
    console.log('服务卸载完成')
  }
})

svc.uninstall()

