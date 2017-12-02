'use strict'

var Promise = require('bluebird')
var _ = require('lodash')
var request = Promise.promisify(require('request'))
var util = require('./util')
var fs = require('fs')

var prefix = 'https://api.weixin.qq.com/cgi-bin/'
 var api = {
 	accessToken: prefix + 'token?grant_type=client_credential',
 	temporary: {
 		upload: prefix + 'media/upload?',
 		fetch: prefix + 'media/get?'

 	},
 	permanent: {
 		upload: prefix + 'material/add_material?',
 		uploadNews: prefix + 'material/add_news?',
 		uploadNewsPic: prefix + 'media/uploadimg?',
 		fetch: prefix + 'material/get_material?',
 		del: prefix + 'material/del_material?',
 		update: prefix + 'material/update_news?',
 		count: prefix + 'material/get_materialcount?',
 		batch: prefix + 'material/batchget_material?'
 	},
 	tag: {
 		create: prefix + 'tags/create?',
 		fetch: prefix + 'tags/get?',
 		update: prefix + 'tags/update?',
 		delete: prefix + 'tags/delete?',
 		fans: prefix + 'user/tag/get?',
 		check: prefix + 'tags/getidlist?',
 		batchtag: prefix + 'tags/members/batchtagging?',
 		batchuntag: prefix + 'tags/members/batchuntagging?'
 	},
 	user: {
 		remark: prefix + 'user/info/updateremark?',
 		fetch: prefix + 'user/info?',
 		batchFetch: prefix + 'user/info/batchget?',
 		list: prefix + 'user/get?'
 	}
 }

 function Wechat(opts){
 	var that = this
 	this.appId = opts.appId
 	this.appSecret = opts.appSecret
 	this.getAccessToken = opts.getAccessToken
 	this.saveAccessToken = opts.saveAccessToken
 	this.fetchAccessToken()

 }

 Wechat.prototype.fetchAccessToken = function(data){
 	var that = this

 	if(this.access_token & this.expires_in){
 		if(this.isValidAccessToken(this)){
 			return Promise.resolve(this)
 		}
 	}

 	return this.getAccessToken()
 		.then(function(data){
 			try{
 				data = JSON.prase(data)
 			}
 			catch(e){
 				return that.updateAccessToken()
 			}

 			if(that.isValidAccessToken(data)){
 				return Promise.resolve(data)
 			}
 			else{
 				return that.updateAccessToken()
 			}
 		})
 		.then(function(data){
 			that.access_Token = data.access_Token
 			that.expires_in = data.expires_in

 			that.saveAccessToken(data)
 		
 			return Promise.resolve(data)

 		})

 }

 
 Wechat.prototype.isValidAccessToken = function(data) {
 	if (!data || !data.access_Token || !data.expires_in) {
 		return false
 	}

 	var access_Token = data.access_Token
 	var expires_in = data.expires_in
 	var now = new date().getTime()

 	if(now < expires_in){
 		return true
 	}
 	else{
 		return false
 	}
 }

 Wechat.prototype.updateAccessToken = function() {
 	var appId = this.appId
 	var appSecret = this.appSecret
 	var url = api.accessToken + '&appid=' + appId + '&secret=' + appSecret


 	return new Promise(function(resolve,reject){
 		request({url:url, json:true}).then(function(response){
 		var data = response.body
 		var now = (new Date().getTime())
 		var expires_in = now +(data.expires_in - 20) * 1000

 		data.expires_in = expires_in

 		resolve(data)
 	})
 	})
 }

 Wechat.prototype.uploadMaterial = function(type,meterial,permanent) {
 	var that = this
 	var form = {}
 	var uploadUrl = api.temporary.upload

 	if(permanent){
 		uploadUrl = api.permanent.upload

 		_.extend(form, permanent)
 	}

 	if(type === 'pic'){
 		uploadUrl = api.permanent.uploadNewsPic
 	}

 	if(type === 'news'){
 		uploadUrl = api.permanent.uploadNews
 		form = meterial
 	}
 	else{
 		form.media = fs.createReadStream(meterial)
 	}

 	

 	return new Promise(function(resolve,reject){
 		that
 			.fetchAccessToken()
 			.then(function(data){
 				var url = uploadUrl + 'access_token=' + data.access_token

 				if(!permanent){
 					url += '&type=' + type
	 			}
	 			else{
	 				url += '&type=' + type
	 				form.access_token = data.access_token
	 			}

 			var options = {
 				method: 'POST',
 				url: url,
 				json: true
 			}

 			if(type === 'news'){
 				options.body = form
 			}
 			else{
 				options.formData = form
 			}
 			
	 		request(options).then(function(response){
	 		var _data = response.body
	 		
	 		if(_data){
	 			resolve(_data)
	 		}
	 		else {
	 			throw new Error('Upload material fails')
	 		}
	 		})
	 		.catch(function(err){
	 			reject(err)
	 		})
	 	})
	 })
 }

 Wechat.prototype.fetchMaterial = function(mediaId,type,permanent) {
 	var that = this
 	var fetchUrl = api.temporary.fetch

 	if(permanent){
 		fetchUrl = api.permanent.fetch

 	}


 	return new Promise(function(resolve,reject){
 		that
 			.fetchAccessToken()
 			.then(function(data){
 				var url = fetchUrl + 'access_token=' + data.access_token 
 				var options = {
 					method: 'POST', 
 					url: url, 
 					json: true
 				}
 				var form = {}
 				
 				if(permanent){
 					form.media_id = mediaId
 					form.access_token = data.access_token
 					options.body = form
 				}
 				else{
 					if(type === 'video'){
 						url = url.replace('https://','http://')
 					}
 					url += '&media_id=' + mediaId
 				}

 				if(type === 'news' || type === 'video'){
 					request(options).then(function(response){
			 		var _data = response.body
			 		
			 		if(_data){
			 			resolve(_data)
			 		}
			 		else {
			 			throw new Error('Delete material fails')
			 		}
			 		})
			 		.catch(function(err){
			 			reject(err)
			 		})
 				}
 				else{
 					resolve(url)
 				}
	 	})
	 })
 }

 Wechat.prototype.deleteMaterial = function(mediaId) {
 	var that = this
 	var form = {
 		media_id: mediaId
 	}

 	return new Promise(function(resolve,reject){
 		that
 			.fetchAccessToken()
 			.then(function(data){
 				var url = api.permanent.del + 'access_token=' + data.access_token + 
 					'&media_id=' + mediaId

 			request({method: 'POST', url: url, body: form, json: true}).then(function(response){
	 		var _data = response.body
	 		
	 		if(_data){
	 			resolve(_data)
	 		}
	 		else {
	 			throw new Error('Delete material fails')
	 		}
	 		})
	 		.catch(function(err){
	 			reject(err)
	 		})
	 	})
	 })
 }


 Wechat.prototype.updateMaterial = function(mediaId,news) {
 	var that = this
 	var form = {
 		media_id: mediaId
 	}

 	_.extend(form, news)

 	return new Promise(function(resolve,reject){
 		that
 			.fetchAccessToken()
 			.then(function(data){
 				var url = api.permanent.update + 'access_token=' + data.access_token + 
 					'&media_id=' + mediaId

 			request({method: 'POST', url: url, body: form, json: true}).then(function(response){
	 		var _data = response.body
	 		
	 		if(_data){
	 			resolve(_data)
	 		}
	 		else {
	 			throw new Error('Update material fails')
	 		}
	 		})
	 		.catch(function(err){
	 			reject(err)
	 		})
	 	})
	 })
 }

 Wechat.prototype.countMaterial = function() {
 	var that = this

 	return new Promise(function(resolve,reject){
 		that
 			.fetchAccessToken()
 			.then(function(data){
 				var url = api.permanent.count + 'access_token=' + data.access_token 
 			
 			request({method: 'GET', url: url,  json: true}).then(function(response){
	 		var _data = response.body
	 		
	 		if(_data){
	 			resolve(_data)
	 		}
	 		else {
	 			throw new Error('Count material fails')
	 		}
	 		})
	 		.catch(function(err){
	 			reject(err)
	 		})
	 	})
	 })
 }

 Wechat.prototype.batchMaterial = function(options) {
 	var that = this
 	options.type = options.type || 'image'
 	options.offset = options.offset || 0
 	options.count = options.count || 1


 	return new Promise(function(resolve,reject){
 		that
 			.fetchAccessToken()
 			.then(function(data){
 				var url = api.permanent.batch + 'access_token=' + data.access_token 

 			request({method: 'POST', url: url, body: options, json: true}).then(function(response){
	 		var _data = response.body
	 		
	 		if(_data){
	 			resolve(_data)
	 		}
	 		else {
	 			throw new Error('Batch material fails')
	 		}
	 		})
	 		.catch(function(err){
	 			reject(err)
	 		})
	 	})
	 })
 }

 Wechat.prototype.createTag = function(name) {
 	var that = this

 	return new Promise(function(resolve,reject){
 		that
 			.fetchAccessToken()
 			.then(function(data){
 				var url = api.tag.create + 'access_token=' + data.access_token  

 				var form = {
 					tag: {
 						name: name
 					}
 				}

 			request({method: 'POST', url: url, body: form, json: true}).then(function(response){
	 		var _data = response.body
	 		
	 		if(_data){
	 			resolve(_data)
	 		}
	 		else {
	 			throw new Error('Create tag fails')
	 		}
	 		})
	 		.catch(function(err){
	 			reject(err)
	 		})
	 	})
	 })
 }

 Wechat.prototype.fetchTags = function() {
 	var that = this

 	return new Promise(function(resolve,reject){
 		that
 			.fetchAccessToken()
 			.then(function(data){
 				var url = api.tag.fetch + 'access_token=' + data.access_token  

 			request({url: url, json: true}).then(function(response){
	 		var _data = response.body
	 		
	 		if(_data){
	 			resolve(_data)
	 		}
	 		else {
	 			throw new Error('Fetch Tags fails')
	 		}
	 		})
	 		.catch(function(err){
	 			reject(err)
	 		})
	 	})
	 })
 }

 Wechat.prototype.checkTags = function(openId) {
 	var that = this

 	return new Promise(function(resolve,reject){
 		that
 			.fetchAccessToken()
 			.then(function(data){
 				var url = api.tag.check + 'access_token=' + data.access_token 
 				var form = {
					openId: openId
 				} 

 			request({method:'POST', url: url, body: form, json: true}).then(function(response){
	 		var _data = response.body
	 		
	 		if(_data){
	 			resolve(_data)
	 		}
	 		else {
	 			throw new Error('Check tags fails')
	 		}
	 		})
	 		.catch(function(err){
	 			reject(err)
	 		})
	 	})
	 })
 }

 Wechat.prototype.updateTag = function(id, name) {
 	var that = this

 	return new Promise(function(resolve,reject){
 		that
 			.fetchAccessToken()
 			.then(function(data){
 				var url = api.tag.update + 'access_token=' + data.access_token 
 				var form = {
 					tag: {
 						id: id,
 						name: name
 					}
 				} 

 			request({method:'POST', url: url, body: form, json: true}).then(function(response){
	 		var _data = response.body
	 		
	 		if(_data){
	 			resolve(_data)
	 		}
	 		else {
	 			throw new Error('Update tag fails')
	 		}
	 		})
	 		.catch(function(err){
	 			reject(err)
	 		})
	 	})
	 })
 }

 Wechat.prototype.deleteTag = function(id) {
 	var that = this

 	return new Promise(function(resolve,reject){
 		that
 			.fetchAccessToken()
 			.then(function(data){
 				var url = api.tag.delete + 'access_token=' + data.access_token 
 				var form = {
 					tag: {
 						id: id
 					}
 				} 

 			request({method:'POST', url: url, body: form, json: true}).then(function(response){
	 		var _data = response.body
	 		
	 		if(_data){
	 			resolve(_data)
	 		}
	 		else {
	 			throw new Error('Update tag fails')
	 		}
	 		})
	 		.catch(function(err){
	 			reject(err)
	 		})
	 	})
	 })
 }

 Wechat.prototype.getFans = function(tagId, next_openid) {
 	var that = this

 	return new Promise(function(resolve,reject){
 		that
 			.fetchAccessToken()
 			.then(function(data){
 				var url = api.tag.fans + 'access_token=' + data.access_token 
 				var form = {
 						tagid: tagId,
 						next_openid: next_openid
 				} 

 			request({method:'GET', url: url, body: form, json: true}).then(function(response){
	 		var _data = response.body
	 		
	 		if(_data){
	 			resolve(_data)
	 		}
	 		else {
	 			throw new Error('getFans  fails')
	 		}
	 		})
	 		.catch(function(err){
	 			reject(err)
	 		})
	 	})
	 })
 }

 Wechat.prototype.batchTagMembers = function(openIds, tagId) {
 	var that = this

 	return new Promise(function(resolve,reject){
 		that
 			.fetchAccessToken()
 			.then(function(data){
 				var url = api.tag.batchtag + 'access_token=' + data.access_token 
 				var form = {
 						openid_list: openIds,
 						tagid: tagId
 				} 

 			request({method:'GET', url: url, body: form, json: true}).then(function(response){
	 		var _data = response.body
	 		
	 		if(_data){
	 			resolve(_data)
	 		}
	 		else {
	 			throw new Error('batchTagMembers  fails')
	 		}
	 		})
	 		.catch(function(err){
	 			reject(err)
	 		})
	 	})
	 })
 }

 Wechat.prototype.batchUntagMembers = function(openIds, tagId) {
 	var that = this

 	return new Promise(function(resolve,reject){
 		that
 			.fetchAccessToken()
 			.then(function(data){
 				var url = api.tag.batchuntag + 'access_token=' + data.access_token 
 				var form = {
 						openid_list: openIds,
 						tagid: tagId
 				} 

 			request({method:'POST', url: url, body: form, json: true}).then(function(response){
	 		var _data = response.body
	 		
	 		if(_data){
	 			resolve(_data)
	 		}
	 		else {
	 			throw new Error('batchUntagMembers  fails')
	 		}
	 		})
	 		.catch(function(err){
	 			reject(err)
	 		})
	 	})
	 })
 }

Wechat.prototype.remarkUser = function(openIds, remark) {
 	var that = this

 	return new Promise(function(resolve,reject){
 		that
 			.fetchAccessToken()
 			.then(function(data){
 				var url = api.user.remark + 'access_token=' + data.access_token 
 				var form = {
 						openid: openId,
 						remark: remark
 				} 

 			request({method:'POST', url: url, body: form, json: true}).then(function(response){
	 		var _data = response.body
	 		
	 		if(_data){
	 			resolve(_data)
	 		}
	 		else {
	 			throw new Error('Remark user  fails')
	 		}
	 		})
	 		.catch(function(err){
	 			reject(err)
	 		})
	 	})
	 })
 }

 Wechat.prototype.batchFetchUsers = function(openIds,lang) {
 	var that = this
 	lang = lang || 'zh_CN'

 	return new Promise(function(resolve,reject){
 		that
 			.fetchAccessToken()
 			.then(function(data){
 				var options = {
 					json: true
 				}

 				if(_.isArray(openIds)){
 					options.url = api.user.batchFetch + 'access_token=' + data.access_token 
 					options.body = {
 						user_list: openIds
 					} 
 					options.method = 'POST'
 				}
 				else{
 					options.url = api.user.fetch + 'access_token=' + data
 					.access_token + '&openid='+ openIds + '&lang=' + lang
 				}

 				
	 			request(options).then(function(response){
		 		var _data = response.body
		 		
		 		if(_data){
		 			resolve(_data)
		 		}
		 		else {
		 			throw new Error('Batch fetch user  fails')
		 		}
		 		})
		 		.catch(function(err){
		 			reject(err)
		 		})
	 	})
	 })
 }

 Wechat.prototype.listUsers = function(openId) {
 	var that = this

 	return new Promise(function(resolve,reject){
 		that
 			.fetchAccessToken()
 			.then(function(data){
 				var url = api.user.list + 'access_token=' + data.access_token
 				if(openId){
 					url += '&next_openid=' + openId

 				}
 				
 			request({url: url, json: true}).then(function(response){
	 		var _data = response.body
	 		
	 		if(_data){
	 			resolve(_data)
	 		}
	 		else {
	 			throw new Error('List user  fails')
	 		}
	 		})
	 		.catch(function(err){
	 			reject(err)
	 		})
	 	})
	 })
 }

 Wechat.prototype.reply = function(){
 	var content = this.body
 	var message = this.weixin
 	var xml = util.tpl(content,message)

 	this.status = 200
 	this.type = 'application/xml'
 	this.body = xml
 	console.log('huifu:'+this.body)
 	
 }
 module.exports = Wechat