'use strict'

var Koa = require('koa')
var path = require('path')
var wechat = require('./wechat/g')
var util = require('./libs/util')
var config = require('./wechat/config')
var reply = require('./wx/reply')
var wechat_file = path.join(__dirname,'./config/wechat.txt') 
var ejs = require('ejs')
var heredoc = require('heredoc')
var crypto = require('crypto')
var Wechat = require('./wechat/wechat')

var app = new Koa()
var tpl = heredoc(function(){/*
<!DOCTYPE html>
<html>
	<head>
		<title>搜电影</title>
		<meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1">
	</head>
	<body>
		<h1>点击标题，开始录音翻译</h1>
		<p id = "title"></p>
		<div id="director"></div>
		<div id="year"></div>
		<div id="poster"></div>
		<script src="http://zeptojs.com/zepto-docs.min.js"></script>
		<script src="http://res.wx.qq.com/open/js/jweixin-1.2.0.js"></script>
		<script>
			wx.config({
			    debug: true,
			    appId: 'wxa28ed122ac04ea5b', 
			    timestamp: <%= timestamp %>,
			    nonceStr: '<%= noncestr %>',
			    signature: '<%= signature %>',
			    jsApiList: [
					'startRecord',
					'stopRecord',
					'onVoiceRecordEnd',
					'translateVoice',
					'onMenuShareTimeline',
					'onMenuShareAppMessage',
					'onMenuShareQQ',
					'onMenuShareWeibo',
					'onMenuShareQZone',
					'previewImage'
			    ] 
			})

			wx.ready(function(){
				wx.checkJsApi({
	    			jsApiList: ['onVoiceRecordEnd'],
	    			success: function(res) {
	    				console.log(res)
	    			}
				})
				
				var shareContent = {
					title: '这可是我搜到的', 
				    desc: '这可是我搜到了', 
				    link: 'https//baidu.com', 
				    imgUrl: 'http://static.mukewang.com/static/img/common/logo.png',
				    success: function () { 
						window.alert('分享成功')
				    },
				    cancel: function () { 
						window.alert('分享失败')
				    }
				}
				wx.onMenuShareAppMessage(shareContent)

				

				var slides
				var isRecording = false
				$('#poster').on('tap',function(){
					wx.previewImage(slides)
				})


				$('h1').on('tap',function(){
					if(!isRecording){
						isRecording = true
						wx.startRecord({
							cancel: function(){
								window.alert('不要搜了么')
							}
						})
						return	
					}
				
					isRecording = false
					wx.stopRecord({
						success: function (res) {
	   						var localId = res.localId
							
							wx.translateVoice({
   								localId: localId,
							    isShowProgressTips: 1, 
							    success: function (res) {
							        var  result = res.translateResult

							        $.ajax({
										type: 'get',
										url: 'https://api.douban.com/v2/movie/search?q=' + result,
										dataType: 'jsonp',
										jsonp: 'callback',
										success: function(data){
											var subject = data.subjects[0]
											
											$('#title').html(subject.title)
											$('#year').html(subject.year)
											$('#director').html(subject.directors[0].name)
											$('#poster').html('<img src="' + subject.images.large +'"/>')

											shareContent = {
												title: subject.title, 
											    desc: '搜到了' + subject.title, 
											    link: 'https//baidu.com', 
											    imgUrl: subject.images.large,
											    success: function () { 
													window.alert('分享成功')
											    },
											    cancel: function () { 
													window.alert('分享失败')
											    }
											}

											var slides = {
												current: subject.images.large,
												urls: [subject.images.large]
											}

											data.subjects.forEach(function(item){
												slides.urls.push(item.images.large)
											})

											wx.onMenuShareAppMessage(shareContent)
										}
							        })
							    }
							})
						}
					})
				})
			})
		</script>
	</body>
</html */})

var createNonce = function(){
	return Math.random().toString(36).substr(2,15)
}
var createTimestamp = function(){
	return parseInt(new Date().getTime() / 1000, 10) + ''
}

var _sign = function(noncestr, ticket, timestamp, url){
	var params = [
		'noncestr=' + noncestr,
		'jsapi_ticket=' + ticket,
		'timestamp=' +timestamp,
		'url=' +url
	]
	var str = params.sort().join('&')
	var shasum = crypto.createHash('sha1')

	shasum.update(str)
	return shasum.digest('hex')
}

function sign(ticket,url){
	var noncestr = createNonce()
	var timestamp = createTimestamp()
	var signature = _sign(noncestr, ticket, timestamp, url)
	return{
		noncestr: noncestr,
		timestamp: timestamp,
		signature: signature
	}
}

app.use(function*(next){
	if(this.url.indexOf('/movie') > -1){
		var wechatApi = new Wechat(config.wechat)
		var data = yield wechatApi.fetchAccessToken()
		var access_token = data.access_token
		var ticketData = yield wechatApi.fetchTicket(access_token)
		var ticket = ticketData.ticket
		var url = this.href
		var params = sign(ticket,url)
		console.log(params)
		
		this.body = ejs.render(tpl,params)

		return next
	}

	yield next
})

app.use(wechat(config.wechat,reply.reply))

app.listen(1234)
console.log('listening: 1234')