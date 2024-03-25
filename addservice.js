var Service = require('node-windows').Service;
var svc = new Service({
 name:'SAMS SERVER',
 description: 'Node.js service description goes here.',
 script: 'C:\Users\Muneeb Baig\Desktop\projectgithub\fyp_backend\server.js'
});

svc.on('install',function(){
 svc.start();
});

svc.install();