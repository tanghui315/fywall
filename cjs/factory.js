var facapp=angular.module('facapp', []);
facapp.value('faConfig',{'ajaxUrl':'http://113.10.136.117/'});

facapp.factory('fwToolbar',function($http,faConfig){
	
	 var service={};
	 
	 service.getShortUrl = function(detailsUrl){
       detailsUrl=service.UrlDecode(detailsUrl);

       var urlRegex = /(https?:\/\/[^\s]+)\/?/gi;
       var m=detailsUrl.match(urlRegex);

         if(!m){
             return false;
         }
         detailsUrl=m[0];

	   if(detailsUrl.indexOf('.')==-1){
			return false;
	   }

	   var tmparr=new URL(detailsUrl).hostname.split('.');
	   //console.log(tmparr.slice(-1).toString());
	   if(tmparr.slice(-1).toString()!='cn')
	   {
		  
		   if(tmparr.length>2){
			   tmparr=tmparr.slice((tmparr.length-2));
		   }
		   if(tmparr.length==2){
			   var shortUrl=tmparr[0]+'.'+tmparr[1];
			   //console.log(shortUrl+'---'+new URL(details.url).hostname);
			  return shortUrl;
		   }
	   }
	   return false;
	 }
	 //检测token
	 service.cktokenServer=function(cToken){
	 		var username=localStorage.getItem('username');
	 		$http.post(faConfig.ajaxUrl+'index.php?r=option/ctoken', {token:cToken,username:username}).
				  		success(function(data, status, headers, config) {
							service.prOtherlogin(data);
							if(data.code!=1){
								localStorage.removeItem('token');
							}
			}). error(function(data, status, headers, config) {});

	 };
	 //发消息启动加密服务
	service.startEc=function(){
		var cToken=localStorage.getItem('token');
		if(cToken!=null){
			var username=localStorage.getItem('username');
			$http.post(faConfig.ajaxUrl+'index.php?r=option/ctoken', {token:cToken,username:username}).
				  		success(function(data, status, headers, config) {
							if(data.cdata.vipdays>0){ //证明是未过期用户
								var sconfig=localStorage.getItem("pss");
								sconfig=angular.fromJson(sconfig);
								
								//开始发消息启动
								
							}

			}). error(function(data, status, headers, config) {});
		}
	};

	//关闭加密服务
	service.stopEc=function(){

	};

	 //展示URL
	 service.getFullShortUrl=function(detailsUrl)
	 {
         detailsUrl=service.UrlDecode(detailsUrl);
         var urlRegex = /(https?:\/\/[^\s]+)\/?/gi;
         var m=detailsUrl.match(urlRegex);
         if(!m){
             return false;
         }
         detailsUrl=m[0];
	   if(detailsUrl.indexOf('.')==-1){
			return false;
	   }
	   var tmparr=new URL(detailsUrl).hostname.split('.');
	   
	    if(tmparr.length>=3){
			   tmparr=tmparr.slice((tmparr.length-3));
			   var shortUrl=tmparr[0]+'.'+tmparr[1]+'.'+tmparr[2];

			   return shortUrl;
		}
	
	    if(tmparr.length==2){
			  var shortUrl=tmparr[0]+'.'+tmparr[1];
			  return shortUrl;
		}

		return false;
	    
	 }
	 
	 service.prOtherlogin=function(data){
		 if(data.code==-2){
		 	localStorage.removeItem('token');
		 	localStorage.removeItem('username');
			localStorage.removeItem('urls');
            service.setPac(false);
			//chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
			//  function(tabs){
			//	 chrome.tabs.update(tabs[0].id,{url: chrome.extension.getURL("login.html")});
			//});
			return;
		 }
         if(data.cdata)
         {
             localStorage.setItem('days',data.cdata.vipdays);
             localStorage.setItem('version',data.cdata.version);
             //localStorage.setItem('ps',data.cdata.ps);
         }
	 };
	 
	 service.checkToken=function(cToken){
		 if(cToken==null){
				chrome.browserAction.setIcon({path:"images/icon-never.png"},function(){});
				//chrome.browserAction.setPopup({popup:''});
				chrome.browserAction.setBadgeText({text: ""});
				// chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
				//   function(tabs){	
				//   chrome.tabs.update(tabs[0].id,{url: chrome.extension.getURL("login.html")});
				// });
		 }		 
	 };
	 
	 service.inArray=function(userUrls,shortUrl){
		 var tmpt=false;
		 angular.forEach(userUrls,function(value, key){
			  if(value.web_url==shortUrl){
				  //console.log(value.web_url+'-----'+shortUrl);
				  tmpt=true;
				  return false;
			  }
		 });
		 //urlobj.web_url=shortUrl;
		 return tmpt;
	 };
	 
	 service.judgmentErr=function(tabId){
	
		 //console.log(localStorage.getItem('errUrls'+tabId));	
		 if(localStorage.getItem('errUrls'+tabId)){  //调错误出来
					var errUrlJosn=localStorage.getItem('errUrls'+tabId);
					var errUrlArr=angular.fromJson(errUrlJosn);
					if(errUrlArr.length>0){
						chrome.browserAction.setBadgeText({text: errUrlArr.length.toString()});
						//console.log('111');	
					}else{
						chrome.browserAction.setBadgeText({text: ''});
					}
				
		 }
	 };
	 
	 service.setUrlerrSpro=function(tabId,currentUrl){
		 var cToken=localStorage.getItem('token');
		 var errUrls=localStorage.getItem('errUrls'+tabId);
		 var username=localStorage.getItem('username');
		 if(errUrls!=null){
		  $http.post(faConfig.ajaxUrl+'index.php?r=option/addcollectm', {token:cToken,username:username,errurls:errUrls}).
					  success(function(data, status, headers, config) {
						  service.prOtherlogin(data);
						if(data.code==1){
							var errUrlArr=angular.fromJson(errUrls);
							if(errUrls!=null){
								var userUrls=angular.fromJson(localStorage.getItem('urls'));
								angular.forEach(errUrlArr, function(url, key){
									userUrls.push({'web_url':url});
								});
								localStorage.setItem('urls',angular.toJson(userUrls));
								service.setPac(true);	
							}
							
							chrome.tabs.update(tabId,{url:currentUrl});
						}
					  }). error(function(data, status, headers, config) {});
		 }
	 };
	 
	 service.pacg=function(){
         var pss=localStorage.getItem('pss');
         pss=angular.fromJson(pss);
		 var proxyString=pss.ss_way+" 127.0.0.1:"+pss.lc_port+";";
		 lines = [];
		 lines.push(['function Find', 'roxyForURL(url, host) {\n'].join('P')); 
		 lines.push("var D = \"DIRECT\";");
		 lines.push("var p='" + proxyString + "';\n");
		 lines.push("if (shExpMatch(host, '10.[0-9]+.[0-9]+.[0-9]+')) return D;");
		 lines.push("if (shExpMatch(host, '172.[0-9]+.[0-9]+.[0-9]+')) return D;");
		 lines.push("if (shExpMatch(host, '192.168.[0-9]+.[0-9]+')) return D;");
		 lines.push("if (dnsDomainIs(host, 'localhost')) return D;\n");
		 lines.push("if (dnsDomainIs(host, '127.0.0.1')) return D;");
		 lines.push("var node = " + localStorage.getItem('urls') + ";");
		 lines.push("if(host.indexOf('.')==-1){return D;}");
		 lines.push("var hostParts = host.toLowerCase().split('.');");
		 lines.push("var shortUrl='';");
		 lines.push("if(hostParts.slice(-1).toString()=='cn'){ return D; }");
		 lines.push("if(hostParts.length>2){ hostParts=hostParts.slice((hostParts.length-2)); }");
		 lines.push("if(hostParts.length==2){ shortUrl=hostParts[0]+'.'+hostParts[1]; }");
		 lines.push("if(shortUrl==''){ return D; }");
		 lines.push("for(var i=0;i<node.length;i++){if(node[i].web_url==shortUrl){return p; break;}}");
		 lines.push("return D;}");
		 var source = lines.join('\n');
		
		 return source
	 };
	 
	 service.setPac=function(p){
		
		 //var ps=localStorage.getItem('ps');

		 if(p==false){
			 chrome.proxy.settings.clear({});
			 return false;
		 } 
		 var source=service.pacg();
		 var config ={
					   mode: 'pac_script',
					   pacScript:{
							data:source
					   }
					  };
	
		chrome.proxy.settings.set(
          {value: config, scope: 'regular'},
          function() { 
		  // console.log('proxy_set_ok');
		  return null;});
		 
	 };

    service.setAlwaysPac=function(p){

        //var ps=localStorage.getItem('ps');
        if(p==false){
            chrome.proxy.settings.clear({});
            return false;
        }
        var source=service.alwaysPacg();
        var config ={
            mode: 'pac_script',
            pacScript:{
                data:source
            }
        };

        chrome.proxy.settings.set(
            {value: config, scope: 'regular'},
            function() {
                // console.log('proxy_set_ok');
                return null;});

    };

    service.alwaysPacg=function(){
        var pss=localStorage.getItem('pss');
        pss=angular.fromJson(pss);
        var proxyString=pss.ss_way+" 127.0.0.1:"+pss.lc_port+";";
        lines = [];
        lines.push(['function Find', 'roxyForURL(url, host) {\n'].join('P'));
        lines.push("var D = \"DIRECT\";");
        lines.push("var p='" + proxyString + "';\n");
        lines.push("if (shExpMatch(host, '10.[0-9]+.[0-9]+.[0-9]+')) return D;");
        lines.push("if (shExpMatch(host, '172.[0-9]+.[0-9]+.[0-9]+')) return D;");
        lines.push("if (shExpMatch(host, '192.168.[0-9]+.[0-9]+')) return D;");
        lines.push("if (dnsDomainIs(host, 'localhost')) return D;\n");
        lines.push("if (dnsDomainIs(host, '127.0.0.1')) return D;");
        lines.push("return p;}");
        var source = lines.join('\n');

        return source
    };
	 
	 service.testpac=function(){
		 var node=[{"web_url":"google.com"},{"web_url":"dwnews.com"},{"web_url":"ip138.com"}];
		 var testUrl="www.google.com";
		 if(testUrl.indexOf('.')==-1){
			 
			return false;
		 }
		 var tmparr=testUrl.toLowerCase().split('.');
		 var shortUrl='';
		 if(tmparr.slice(-1).toString()!='cn'){
		   if(tmparr.length>2){
			  tmparr=tmparr.slice((tmparr.length-2));
		   }
		   if(tmparr.length==2){
			    shortUrl=tmparr[0]+'.'+tmparr[1];
			   //console.log(shortUrl+'---'+new URL(details.url).hostname);
		   }
		 }
		// console.log(shortUrl);
		 if(shortUrl!='')
		 {
			 for(var i=0;i<node.length;i++){
				 if(node[i].web_url==shortUrl){
					 //console.log('ok');
					 break;
				 }
			 }
		 }
		 
	 };

	 service.getAllCollect=function(collect){
	 	 var cToken=localStorage.getItem('token');
	 	  var username=localStorage.getItem('username');
	 	 $http.post(faConfig.ajaxUrl+'index.php?r=option/allcollect', {token:cToken,username:username}).
				  success(function(data, status, headers, config) {
						//alert(data.code);
						service.prOtherlogin(data);
						collect.data=data.collect_data;
				  }). error(function(data, status, headers, config) {});
	 };

    service.UrlDecode=function(str){
        var ret="";
        for(var i=0;i<str.length;i++){
            var chr = str.charAt(i);
            if(chr == "+"){
                ret+=" ";
            }else if(chr=="%"){
                var asc = str.substring(i+1,i+3);
                if(parseInt("0x"+asc)>0x7f){
                    ret+=String.fromCharCode(parseInt("0x"+asc+str.substring(i+4,i+6)));
                    i+=5;
                }else{
                    ret+=String.fromCharCode(parseInt("0x"+asc));
                    i+=2;
                }
            }else{
                ret+= chr;
            }
        }
        return ret;
    };
	 
	 return service;
	
});

facapp.factory('optionProcess',function($http,faConfig,fwToolbar){
	
	var  service={};
	service.getTypeAll=function($scope,cToken){
		var username=localStorage.getItem('username');
		 $http.post(faConfig.ajaxUrl+'index.php?r=option/alltype', {token:cToken,username:username}).
				  success(function(data, status, headers, config) {
                        fwToolbar.prOtherlogin(data);
						$scope.type.data=data.type_data;
				  }). error(function(data, status, headers, config) {});
	};
	
	service.getOrderAll=function($scope,cToken){
		var username=localStorage.getItem('username');
		 $http.post(faConfig.ajaxUrl+'index.php?r=option/allorder', {token:cToken,username:username}).
				  success(function(data, status, headers, config) {
                        fwToolbar.prOtherlogin(data);
						$scope.order.data=data.order_data;
				  }). error(function(data, status, headers, config) {});
	};
	
	return service;
});


facapp.factory('fwConnect',function($http,faConfig,fwToolbar){
	var heartbeat_timer = 0;
	var last_health = -1;
	var health_timeout = 5000;
	
	var service={};
	service.keepalive=function(ws){
		var time = new Date();
		if( last_health != -1 && ( time.getTime() - last_health > health_timeout ) ){
				//console.log('服务器没有响应');
				ws.close();
		}
		else{
			//console.log('连接正常');
			if( ws.bufferedAmount == 0 ){
			   if(localStorage.getItem('token')!=null)	
				{
					ws.send(localStorage.getItem('token'));
					clearInterval( heartbeat_timer );
				}else{

					ws.send('notoken');
				}
				
			}
		}
	};
	
	service.wsConn=function(to_url){
			to_url = to_url || "";
			if( to_url == "" ){
				return false;
			}
			
			clearInterval( heartbeat_timer );
			//console.log('Connecting...');
			var ws = new WebSocket( to_url );

			ws.onopen=function(){
				//$("#statustxt").html("connected.");	
				//console.log('connected.');
				//var cToken=localStorage.getItem('token');
				//if(cToken!=null)
				//{  //判断如果不一致，清除登录凭证
					// var username=localStorage.getItem('username');
					// $http.post(faConfig.ajaxUrl+'index.php?r=option/ctoken', {token:cToken,username:username}).
				 //  		success(function(data, status, headers, config) {
					// 		if(data.code!=1){
					// 			localStorage.removeItem('token');
					// 		}
				 //  		}). error(function(data, status, headers, config) {});
					//ws.send(cToken);//心跳
				//}
				
			
				heartbeat_timer = setInterval( function(){service.keepalive(ws)}, health_timeout );
			}
			ws.onerror=function(){
		
				clearInterval( heartbeat_timer );
				//console.log('connect error.');
				
			}
			ws.onclose=function(){

				clearInterval( heartbeat_timer );
				//console.log('connect closed.');
			}
			
			ws.onmessage=function(msg){
				var time = new Date();
				//console.log(msg.data);
				rdata=angular.fromJson(msg.data);
				var ltime=localStorage.getItem('logintime');
				if( rdata.islogin == -1 ){  //登录的时候  加一个标记，并配上时间。可以防止不能正常登录
					if(ltime!=null)
					{
						if((time.getTime()-ltime)>600000)
						{
							localStorage.removeItem('token');
							localStorage.removeItem('username');
							localStorage.removeItem('urls');
						}

					}else{
						localStorage.removeItem('token');
						localStorage.removeItem('username');
						localStorage.removeItem('urls');
					}	
			
				}else{
					localStorage.setItem('days',rdata.vipdays);
					localStorage.setItem('version',rdata.version);
                    localStorage.setItem('ps',rdata.ps);
				}
				
				

				last_health = time.getTime();
				return;
			
				
			}
			
			return ws;

	};
	
	return service;


});	