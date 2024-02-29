# rtsp-to-flv-node
利用node.js + ffmpeg + websokect + flv.js 实现 浏览器播放rtsp流媒体视频

# 安装前端包
执行yarn  或者  npm install

# 启动

- node server.js (开发调试时使用)  或者 npm run start

- public/**/* 这种通配符写法，表示public下所有文件都被打包进去了; assets表示静态资源相关配置，scritps表示需要配置才能打包的js脚本

- node install.js 添加为服务
- node uninstall.js 卸载服务
