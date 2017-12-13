'use strict'

var path = require('path')
var util = require('../libs/util')
var wechat_file = path.join(__dirname,'../config/wechat.txt') 
var wechat_ticket_file = path.join(__dirname,'../config/wechat_ticket.txt') 
var config = {
	wechat:{
		appId: 'wxa28ed122ac04ea5b',
		appSecret: '266c21cf81e7cfcd65a33fc0138b19d4',
		token: 'xiaocai',
		getAccessToken: function(){
			return util.readFileAsync(wechat_file)
		},
		saveAccessToken: function(data){
			data = JSON.stringify(data)
			return util.writeFileAsync(wechat_file,data)
		},
		getTicket: function(){
			return util.readFileAsync(wechat_ticket_file)
		},
		saveTicket: function(data){
			data = JSON.stringify(data)
			return util.writeFileAsync(wechat_ticket_file,data)
		}
	}
}

module.exports = config