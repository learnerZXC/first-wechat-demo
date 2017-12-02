'use strict'

var path = require('path')
var util = require('../libs/util')
var wechat_file = path.join(__dirname,'../config/wechat.txt') 
var config = {
	wechat:{
		appId: 'wx2242a3b826e2f4e6',
		appSecret: '90493468937b9c6354aaa1ee6da9beeb',
		token: 'xiaocai',
		getAccessToken: function(){
			return util.readFileAsync(wechat_file)
		},
		saveAccessToken: function(data){
			data = JSON.stringify(data)
			return util.writeFileAsync(wechat_file,data)
		},
	}
}

module.exports = config