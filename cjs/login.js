
var fwLogin=angular.module('fwLogin', ['facapp']);


fwLogin.controller('loginCtr',function($scope,$rootScope,$http,fwToolbar,faConfig,fwConnect){
		if(localStorage.getItem('token')!=null){
			chrome.tabs.getCurrent(function(tab){
				 chrome.tabs.update(tab.id,{url: chrome.extension.getURL("options.html")});
			});
		}
		var login=$scope.login={};	
		login.submitLogin=function(login_form){
			 if(login_form.$valid){
			 	
			 	//3600000 
			 	login.dis = true;
				$http.post(faConfig.ajaxUrl+'index.php?r=member/login', {user_name:login.email,pwd:login.pwd}).
				  success(function(data, status, headers, config) {
					if(data.code==1){
							 localStorage.setItem('token',data.access_token);
							 localStorage.setItem('username',login.email);
							 localStorage.setItem('urls',angular.toJson(data.web_url_arr));
							 localStorage.setItem('ps',data.s);
                             localStorage.setItem('pss',data.ss);
							 localStorage.setItem('days',data.expire_days);
							 localStorage.setItem('version',data.version);
							 var d=new Date();
							 localStorage.setItem('logintime',d.getTime());
							 localStorage.setItem('hostname',data.host_name);
                             localStorage.setItem('mode',1);
							 //d.setHours (d.getHours() + 1);
							 fwToolbar.setPac(true);
							 chrome.tabs.getCurrent(function(tab){
									chrome.tabs.update(tab.id,{url: chrome.extension.getURL("options.html")});
							 });
							 chrome.browserAction.setIcon({path:"images/fw.png"},function(){});
							 //chrome.browserAction.setPopup({popup:'popup.html'});
							 //chrome.browserAction.setBadgeText({text: ""});
					}else{
						alert(data.msg);
                        login.dis = false;
						chrome.browserAction.setIcon({path:"images/icon-never.png"},function(){});
						//chrome.browserAction.setPopup({popup:''});
						//chrome.browserAction.setBadgeText({text: ""});
					}
						
				  }). error(function(data, status, headers, config) {  login.dis = false; });
				
			 }
		};
		
		login.toReg=function(){
			
			chrome.tabs.getCurrent(function(tab){
				chrome.tabs.update(tab.id,{url: chrome.extension.getURL("reg.html")});
			});
			
		};

        login.toForgot=function(){
            chrome.tabs.getCurrent(function(tab){
                chrome.tabs.update(tab.id,{url: chrome.extension.getURL("forgot.html")});
            });
        };
	
});