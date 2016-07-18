
var fwReg=angular.module('fwReg', ['facapp']);


fwReg.controller('regCtr',function($scope,$http,faConfig,fwToolbar){
		
		if(localStorage.getItem('token')!=null){
			chrome.tabs.getCurrent(function(tab){
				 chrome.tabs.update(tab.id,{url: chrome.extension.getURL("options.html")});
			});
		}

		var member=$scope.member={};
		
		member.submitReg=function(reg_form){
			
			 if(reg_form.$valid){
			 	member.dis = true;
				$http.post(faConfig.ajaxUrl+'index.php?r=member/create', {user_name:member.email,mail_code:member.email_code,pwd:member.pwd}).
				  success(function(data, status, headers, config) {
						//alert(data.code);
						if(data.code==1){
							 
							 localStorage.setItem('token',data.access_token);
							 localStorage.setItem('username',member.email);
							 localStorage.setItem('urls',angular.toJson(data.web_url_arr));
							 localStorage.setItem('ps',data.s);
                             localStorage.setItem('pss',data.ss);
							 localStorage.setItem('days',data.expire_days);
							 localStorage.setItem('version',data.version);
							 var d=new Date();
							 localStorage.setItem('logintime',d.getTime());
							 localStorage.setItem('hostname',data.host_name);
                             localStorage.setItem('mode',1);
							 fwToolbar.setPac(true);
							 chrome.tabs.getCurrent(function(tab){
									chrome.tabs.update(tab.id,{url: chrome.extension.getURL("options.html")});
							 });
							 chrome.browserAction.setIcon({path:"images/fw.png"},function(){});
							 //chrome.browserAction.setPopup({popup:'popup.html'});
							 //chrome.browserAction.setBadgeText({text: ""});
						}else{
							alert(data.msg);
                            member.dis = false;
							chrome.browserAction.setIcon({path:"images/icon-never.png"},function(){});
							//chrome.browserAction.setPopup({popup:''});
							//chrome.browserAction.setBadgeText({text: ""});
						}
						
				  }). error(function(data, status, headers, config) {});
				
			 }
		};
		member.sendCode=function(reg_form){
            member.code_msg='邮件正在发送中...';
			if(!reg_form.member_email.$valid){
				
				member.code_msg='请输入邮箱地址';
			}else{
				//console.log(reg_form.member_email.$viewValue);
				$http.post(faConfig.ajaxUrl+'index.php?r=member/ckmail', {user_name:reg_form.member_email.$viewValue}).
				  success(function(data, status, headers, config) {
				  	  if(data.code==1){
				  	  	member.code_msg='发送成功，请查收邮件';
				  	  }else{
				  	  	  member.code_msg=data.msg;
				  	  }
				  }). error(function(data, status, headers, config) {});
			}
		};
});