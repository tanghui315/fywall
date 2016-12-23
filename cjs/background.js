var fwapp=angular.module('fwapp', ['facapp']);



	
	
	
fwapp.controller('bgctr',function($scope,$rootScope,fwConnect,fwToolbar){
	
	var ws=null;	
	var cToken=localStorage.getItem('token');	
	localStorage.setItem('errUrls',"[]");
	//chrome.browserAction.onClicked.addListener(function(tab){
			//chrome.tabs.update(tab.id,{url: chrome.extension.getURL("login.html")});
	//});
	//fwToolbar.testpac();
	chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
		
		if(localStorage.getItem('token')==null){
				return false;
		}
        if(localStorage.getItem('mode')!=null){
            var mode=localStorage.getItem('mode');
            if(parseInt(mode)==3||parseInt(mode)==2){//模式2和3的不变化
                return false;
            }
        }
		  //console.log(changeInfo.status);
		//判断当前请求的URL是否在科学上网列表内，让图标变绿色.
	        if (changeInfo.status == "complete") {
				 //console.log(tab.url);
				//chrome.tabs.get(tabId, function(subTab){
				//console.log(subTab.url);
				//});
                var userUrls=angular.fromJson(localStorage.getItem('urls'));
				var shortUrl=fwToolbar.getShortUrl(tab.url);
				if(fwToolbar.inArray(userUrls,shortUrl)==true){
					fwToolbar.setUrlerrSpro(tabId,tab.url);
				}
				
		    }else{
				
				
				var shortUrl=fwToolbar.getShortUrl(tab.url);
				var userUrls=angular.fromJson(localStorage.getItem('urls'));
				if(fwToolbar.inArray(userUrls,shortUrl)==false){
					chrome.browserAction.setIcon({path:"images/fw.png"},function(){});
				}else{
					chrome.browserAction.setIcon({path:"images/icon-auto-active.png"},function(){});	
				}
				//localStorage.setItem('errUrls',"[]");
				//chrome.browserAction.setBadgeText({text: ""});
				localStorage.removeItem('errUrls'+tabId);
				chrome.browserAction.setBadgeText({text: ""});
			}
	
		
	});



	
	chrome.tabs.onActivated.addListener(function(activeInfo){
        if(localStorage.getItem('token')==null){
            return false;
        }
        if(localStorage.getItem('mode')!=null){
            var mode=localStorage.getItem('mode');
            if(parseInt(mode)==3||parseInt(mode)==2){//模式2和3的不变化
                return false;
            }
        }
		chrome.tabs.get(activeInfo.tabId, function(stab){
			var shortUrl=fwToolbar.getShortUrl(stab.url);
			var userUrls=angular.fromJson(localStorage.getItem('urls'));
			
			if(fwToolbar.inArray(userUrls,shortUrl)==false){
				chrome.browserAction.setIcon({path:"images/fw.png"},function(){});
				chrome.browserAction.setBadgeText({text: ''});
			}else{
				chrome.browserAction.setIcon({path:"images/icon-auto-active.png"},function(){});
				//fwToolbar.judgmentErr(activeInfo.tabId);
				fwToolbar.setUrlerrSpro(activeInfo.tabId,stab.url);
			}
		});
	});
	
	chrome.tabs.onRemoved.addListener(function(tabId,removeInfo){
		localStorage.removeItem('errUrls'+tabId);
	});
	//监听update操作，在页面刷新完成的时候检查用户的token数据
	chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
		 if (changeInfo.status == "complete") {
			 var cToken=localStorage.getItem('token');
			 if(cToken==null){ //没登录就不检查了
				 return false;
			 }
			 var shortUrl=fwToolbar.getShortUrl(tab.url);
			 if(shortUrl){
				fwToolbar.cktokenServer(cToken);

			 }
		 }
	});
	
	chrome.webRequest.onErrorOccurred.addListener(function(details){
		//处理错误的访问，可能是受限站
		 
		if(localStorage.getItem('token')==null){
				return false;
		}
        if(localStorage.getItem('mode')!=null){
            var mode=localStorage.getItem('mode');
            if(parseInt(mode)==3||parseInt(mode)==2){//模式2和3的不变化
                return false;
            }
        }
		
		var shortUrl=fwToolbar.getShortUrl(details.url);
        //console.log(details.url);
		chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},function(tabs){

			if(details.tabId!=tabs[0].id){  //不是当前标签的
				return false;
			}
			
			if(shortUrl){
				var tabShortUrl=fwToolbar.getShortUrl(tabs[0].url);

				if(tabShortUrl){
				        var userUrls=angular.fromJson(localStorage.getItem('urls'));
						if(!fwToolbar.inArray(userUrls,tabShortUrl))    //如果没有在科学上网列表，不走下面流程
						{
							return false;
						}
					if(tabShortUrl!=shortUrl){  //不要等于当前标签的URL，这些才能放入错误URL列表
						//判断当前标签URl 如果未在收藏列表，也不走下面流程
						//console.log(shortUrl+'----'+fwToolbar.inArray(userUrls,shortUrl)+'------');
						//console.log(details.tabId+'---'+shortUrl+'----');						
					   
					   //console.log(fwToolbar.inArray(userUrls,shortUrl));
					   if(!fwToolbar.inArray(userUrls,shortUrl)){
						 //  console.log(details.tabId+'---'+shortUrl+'----');
						//console.log(shortUrl+'====2222');
						  if(localStorage.getItem('errUrls'+tabs[0].id)!=null){
					
							var errUrlJosn=localStorage.getItem('errUrls'+tabs[0].id);
							var errUrlArr=angular.fromJson(errUrlJosn);
							
							if(errUrlArr.indexOf(shortUrl)==-1){
								
									errUrlArr.push(shortUrl);
									localStorage.setItem('errUrls'+tabs[0].id,angular.toJson(errUrlArr));	
							}
						 }else{
							 var errUrlArr=[];
							 errUrlArr.push(shortUrl);
							 localStorage.setItem('errUrls'+tabs[0].id,angular.toJson(errUrlArr));
							 
						 }
					  }
				   }
				}
			}
		});
		
			
	},{urls: ["<all_urls>"]});
	
	
	//ws= fwConnect.wsConn("ws://114.119.36.231:9558");

	if(cToken!=null){	

		//判断如果不一致，清除登录凭证
		fwToolbar.cktokenServer(cToken);

		fwToolbar.setPac(true);		 
		chrome.browserAction.setIcon({path:"images/fw.png"},function(){});
		//chrome.browserAction.setPopup({popup:'popup.html'});
	}else{
		fwToolbar.setPac(false);
		chrome.browserAction.setIcon({path:"images/icon-never.png"},function(){});
		//chrome.browserAction.setPopup({popup:''});
		return false;
	}
	
	
});