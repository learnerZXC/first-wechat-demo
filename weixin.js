'use strict'
 
var config = require('./wechat/config')
var Wechat = require('./wechat/wechat')
 
var wechatApi = new Wechat(config.wechat)

exports.reply = function*(next){
	var message = this.weixin
	

	if(message.MsgType === 'event'){
		if(message.Event === 'subscribe'){
			if(message.EventKey){
				console.log('扫描二维码进来：' + message.EventKey + ' ' + message
					.ticket)
			}

			this.body = '哈哈，你订阅了此号\r\n'
		}
		else if(message.Event === 'unsubscribe'){
			console.log('取消订阅')

			this.body = ' 啊啊啊'
		}
		else if(message.Event === 'LOCATION'){
			this.body = '您所处的地方是：' + message.Latitude + '/' + message
			.Longitude + '-' + message.Precision 
		}
		else if(message.Event === 'CLICK'){
			this.body = '您点击了菜单：' + message.EventKey
		}
		else if(message.Event === 'SCAN'){
			console.log('关注后扫二维码' + message.EventKey + ' ' + message.ticket)
			this.body = '又偷偷调皮'
		}
		else if(message.Event === 'VIEW'){
			this.body = '您点击了菜单中的链接：' + message.EventKey
		}
	}
	else if(message.MsgType === 'text'){
		var content = message.Content
		var reply = '(^_^),你说的 ' + message.Content + '我难以理解'
		
		if(content === '1'){
			 reply = '天下武功唯快不破'
		}
		else if(content === '2'){
			 reply = '太极以柔克刚'
		}
		else if(content === '3'){
			 reply = '少林真功夫'
		}
		else if(content === '4'){
			 reply = [{
			 	title: '知识改变命运',
			 	description: '好好学习天天向上',
			 	picUrl: 'https://image.baidu.com/search/detail?ct=503316480&z=0&ipn=d&word=%E7%86%8A%E7%8C%AB&hs=2&pn=1&spn=0&di=32001922830&pi=0&rn=1&tn=baiduimagedetail&is=0%2C0&ie=utf-8&oe=utf-8&cl=2&lm=-1&cs=3240141611%2C1323872591&os=29672363%2C1849865711&simid=0%2C0&adpicid=0&lpn=0&ln=30&fr=ala&fm=&sme=&cg=&bdtype=13&oriquery=%E7%86%8A%E7%8C%AB&objurl=http%3A%2F%2Fimgsrc.baidu.com%2Fimgad%2Fpic%2Fitem%2F0eb30f2442a7d93336fa3057a74bd11373f00140.jpg&fromurl=ippr_z2C%24qAzdH3FAzdH3Fooo_z%26e3Bq7wg3tg2_z%26e3Bv54AzdH3Ft42k7yAzdH3F7s8ab0-9m90_z%26e3Bip4s&gsm=0',
			 	url: 'https://www.baidu.com/'
			 },{
			 	title: '读书使人进步',
			 	description: '读好书好读书',
			 	picUrl: 'https://image.baidu.com/search/detail?ct=503316480&z=0&ipn=d&word=%E7%86%8A%E7%8C%AB&hs=2&pn=1&spn=0&di=32001922830&pi=0&rn=1&tn=baiduimagedetail&is=0%2C0&ie=utf-8&oe=utf-8&cl=2&lm=-1&cs=3240141611%2C1323872591&os=29672363%2C1849865711&simid=0%2C0&adpicid=0&lpn=0&ln=30&fr=ala&fm=&sme=&cg=&bdtype=13&oriquery=%E7%86%8A%E7%8C%AB&objurl=http%3A%2F%2Fimgsrc.baidu.com%2Fimgad%2Fpic%2Fitem%2F0eb30f2442a7d93336fa3057a74bd11373f00140.jpg&fromurl=ippr_z2C%24qAzdH3FAzdH3Fooo_z%26e3Bq7wg3tg2_z%26e3Bv54AzdH3Ft42k7yAzdH3F7s8ab0-9m90_z%26e3Bip4s&gsm=0',
			 	url: 'https://www.baidu.com/'
			 }
			 ]
		}
		else if(content === '5'){
		 	var data = yield wechatApi.uploadMaterial('image',__dirname + '/sources/2.jpg')
		 	
			 reply = {
			 	type: 'image',
			 	mediaId: data.media_id
			 }
		 }
		 
		else if(content === '6'){
			 var data = yield wechatApi.uploadMaterial('video',__dirname + '/sources/4.mp4')

			 reply = {
			 	type: 'video',
			 	title: '回复视频',
			 	description: '很有意思的视频',
			 	mediaId: data.media_id
			 }
		}
		else if(content === '7'){
			 var data = yield wechatApi.uploadMaterial('image',__dirname + '/sources/2.jpg')

			 reply = {
			 	type: 'music',
			 	title: '回复音乐',
			 	description: '很难听的音乐',
			 	musicUrl: 'http://music.163.com/#/playlist?id=694597332',
			 	thumbMediaId: data.media_id,
			 }
		}
		else if(content === '8'){
		 	var data = yield wechatApi.uploadMaterial('image',__dirname + '/sources/2.jpg',{type:'image'})
			 reply = {
			 	type: 'image',
			 	mediaId: data.media_id
			 }
		 }
		 else if(content === '9'){
		 	var data = yield wechatApi.uploadMaterial('vedio',__dirname + '/sources/2.jpg',{ type:'vedio',
		 		description:'{"title":"really a nice place", "introduction":"suibainxiede"}'})

		 	 console.log(data)
			 reply = {
			 	type: 'video',
			 	title: '回复视频',
			 	description: '很有意思的视频',
			 	mediaId: data.media_id
			 }
		 }
		 else if(content === '10'){
		 	var data = yield wechatApi.uploadMaterial('image',
		 		__dirname + '/sources/2.jpg',{})
		 	var media = {
		 		articles: [{
		 			title: 'tututu2',
		 			thumb_media_id: picData.media_id,
		 			author: 'xiaocai',
		 			digest: '这是摘要',
		 			show_cover_pic: 1,
		 			content: '这就是内容',
		 			content_source_url: 'https://www.baidu.com'
		 		},{
		 			title: 'tututu3',
		 			thumb_media_id: picData.media_id,
		 			author: 'xiaocai',
		 			digest: '这是摘要',
		 			show_cover_pic: 1,
		 			content: '这就是内容',
		 			content_source_url: 'https://www.baidu.com'
		 		}]
		 	}

		 	data = yield wechatApi.uploadMaterial('news',media,{})
		 	data = yield wechatApi.fetchMaterial(data.media_id,'news',{})

		 	console.log(data)
		 	
		 	var items = data.news_item
			var news = []

			items.forEach(function(item){
				news.push({
					title: item.title,
					description: item.description,
					picUrl: picData.url,
					url: item.url
				})
			})

			reply = items
		 }
		 else if(content === '11'){
		 	var counts = yield wechatApi.countMaterial()

		 	console.log(JSON.stringify(counts))

		 	var results = yield[
		 		wechatApi.batchMaterial({
			 		type: 'image', 
			 		offset: 0,
			 		count: 10
		 		}), 
		 		wechatApi.batchMaterial({
			 		type: 'video', 
			 		offset: 0,
			 		count: 10
			 	}),
			 	wechatApi.batchMaterial({
			 		type: 'voice', 
			 		offset: 0,
			 		count: 10
			 	}),
			 	wechatApi.batchMaterial({
		 		type: 'news', 
		 		offset: 0,
		 		count: 10
		 		})
		 	]

		 	console.log(JSON.stringify(results))
		 	reply = '1'
		 }
		 else if(content === '12'){
		 	var tag = yield wechatApi.createTag('wechat')

		 	console.log('新分组wechat',tag)

		 	var tags = yield wechatApi.fetchTags()

		 	console.log('加了wechat以后的分组列表',tags)
		 	var tags2 = yield wechatApi.checkTags(message.FromUserName)

		 	console.log('加了wechat以后的分组列表',tags2)

		 	reply = 'tag done!'
		 }

		this.body = reply
	}

	yield next
}