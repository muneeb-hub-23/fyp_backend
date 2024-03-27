const Service = require('node-windows').Service

const svc = new Service({
    name:"SAMS",
    description:"backend of sams",
    script:"C:\Users\Muneeb Baig\Desktop\projectgithub\fyp_backend\server.js"
})

svc.on('install', function(){
    svc.start()
})
svc.install()