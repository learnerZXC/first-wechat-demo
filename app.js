'use strict'

var Koa = require('koa')
var path = require('path')
var wechat = require('./wechat/g')
var util = require('./libs/util')
var config = require('./wechat/config')
var reply = require('./wx/reply')
var wechat_file = path.join(__dirname,'./config/wechat.txt') 


var app = new Koa()

app.use(wechat(config.wechat,reply.reply))

app.listen(1234)
console.log('listening: 1234')