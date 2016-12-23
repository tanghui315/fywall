
var popapp=angular.module('popapp', ['ngRoute','facapp', 'ngAnimate']);

popapp.config(function($routeProvider, $locationProvider) {
  $routeProvider
   .when('/', {
    templateUrl: '/popup/default.html',
    controller: 'popCtr'
   
  }).when('/login', {
    templateUrl: '/popup/login.html',
    controller: 'loginCtr'
   
  }).when('/reg', {
    templateUrl: '/popup/reg.html',
    controller: 'regCtr'
   
  });


});



popapp.controller('popCtr',function($scope,$http,fwToolbar,$location,optionProcess,$window,faConfig){
	
	var popup=$scope.popup={};
    $scope.type={};
    popup.mode={
        demand:true,
        always:false,
        close:false
    };
	// var port = chrome.runtime.connect("phnhfldfidaialdcjoegaochilgenaji");
    // console.dir(port);
	// port.postMessage({msg:"test"});
	// chrome.runtime.sendMessage("phnhfldfidaialdcjoegaochilgenaji",{msg:"test"},function(response){
	// 	console.dir(response);
	// });
    var cToken=localStorage.getItem('token');
	if(cToken==null){
					chrome.browserAction.setIcon({path:"images/icon-never.png"},function(){});
					$location.path('/login');
					popup.isoption=true;
					return false;
	}
	fwToolbar.checkToken(cToken);
	popup.username=localStorage.getItem('username');
    if(localStorage.getItem('hostname')!=null)
        popup.baseUrl=localStorage.getItem('hostname');
    else
        popup.baseUrl=faConfig.ajaxUrl;
	popup.days=localStorage.getItem('days');
	optionProcess.getTypeAll($scope,cToken);
	chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
	  function(tabs){
	  popup.currentTabId=tabs[0].id;
	  popup.currentUrl=tabs[0].url;
	  popup.shortUrl=fwToolbar.getShortUrl(tabs[0].url);
	  popup.fullShortUrl=fwToolbar.getFullShortUrl(tabs[0].url);
	  popup.titleUrl=tabs[0].title;
	  popup.favIconUrl=tabs[0].favIconUrl;
	  popup.isHave=false;
	  popup.isoption=false;
          if(popup.days==0){
              popup.shortUrl=false;
          }
	  if(popup.shortUrl){
		   var userUrls=angular.fromJson(localStorage.getItem('urls'));
		    if(fwToolbar.inArray(userUrls,popup.shortUrl)==true){
				popup.isHave=true;
			}
	  }else{
		  popup.isoption=true;
	  }
	  popup.errUrlArr=angular.fromJson(localStorage.getItem('errUrls'+tabs[0].id));
	  
	  popup.isErrHave=false;
          popup.oldIsHave=popup.isHave;
          popup.oldIsErrHave=popup.isErrHave;
	  //if(popup.isHave==true&&popup.errUrlArr.length>0){
	  //	  popup.isErrHave=true;
	  // }
          if(localStorage.getItem('mode')!=null) {
              var mode = localStorage.getItem('mode');

              if (parseInt(mode) == 3 || parseInt(mode) == 2) {//模式2和3的不变化
                  popup.isHave = true;
                  //console.log(popup.isHave);
                  popup.isErrHave = true;
              }
          }
	  
    });
    //初始化模式
    if(localStorage.getItem('mode')!=null)
    {
        var mode=localStorage.getItem('mode');
        if(parseInt(mode)==1){
            popup.mode={
                demand:true,
                always:false,
                close:false
            };
        }
        if(parseInt(mode)==2){
            popup.mode={
                demand:false,
                always:true,
                close:false
            };
        }
        if(parseInt(mode)==3){
            popup.mode={
                demand:false,
                always:false,
                close:true
            };
        }

    }


	
	 popup.toAdd=function(){
		
		 var cToken=localStorage.getItem('token');
		 var typeid=0;
		 
		 if((typeof popup.type) !='undefined'){
			  typeid=popup.type.mwt_id;
		 }
		
		 var username=localStorage.getItem('username');
         if(localStorage.getItem('hostname')!=null){
            var hname=localStorage.getItem('hostname');
              hname = fwToolbar.getShortUrl(hname);
             if(popup.shortUrl==hname)
             {
                 popup.msg="此域名不能加入科学上网规则";
                 return false;
             }

         }

		 $http.post(faConfig.ajaxUrl+'index.php?r=option/addcollect', {token:cToken,username:username,web_url:popup.shortUrl,title:popup.titleUrl,type_id:typeid}).
					  success(function(data, status, headers, config) {
					  	fwToolbar.prOtherlogin(data);
						if(data.code==1){ 
							var userUrls=angular.fromJson(localStorage.getItem('urls'));
							userUrls.push({'web_url':popup.shortUrl});
							localStorage.setItem('urls',angular.toJson(userUrls));
							fwToolbar.setPac(true);	
							chrome.tabs.update(popup.currentTabId,{url:popup.currentUrl});
						}
						 // $window.close();
					  }). error(function(data, status, headers, config) {});  
		 //'index.php/fwmembers?fields=user_id,user_name'
		 //'index.php/fwmembers/view/9'
		 //index.php/fwmembers/create

	 };
	 
	 popup.remove=function(){
		  var cToken=localStorage.getItem('token');
		  var username=localStorage.getItem('username');
		  $http.post(faConfig.ajaxUrl+'index.php?r=option/rmcollect', {token:cToken,username:username,weburl:popup.shortUrl}).
					  success(function(data, status, headers, config) {
					  	fwToolbar.prOtherlogin(data);
						if(data.code==1){
							var userUrls=angular.fromJson(localStorage.getItem('urls'));
							var newUserUrls=[];
							angular.forEach(userUrls,function(uurl, key){
								if(uurl.web_url!=popup.shortUrl){
									newUserUrls.push({'web_url':uurl.web_url});
								}
							});
							localStorage.setItem('urls',angular.toJson(newUserUrls));	
							fwToolbar.setPac(true);	
							chrome.tabs.reload(popup.currentTabId);
						}
						//  $window.close();
					  }). error(function(data, status, headers, config) {});
	 };
	 
	 popup.toAddAll=function(){
		 
		 var cToken=localStorage.getItem('token');
		 var errUrls=localStorage.getItem('errUrls'+popup.currentTabId);
		  var username=localStorage.getItem('username');
		  $http.post(faConfig.ajaxUrl+'index.php?r=option/addcollectm', {token:cToken,username:username,errurls:errUrls}).
					  success(function(data, status, headers, config) {
					  	fwToolbar.prOtherlogin(data);
						if(data.code==1){
							var errUrlArr=angular.fromJson(errUrls);
							if(errUrls!=null){
								var userUrls=angular.fromJson(localStorage.getItem('urls'));
								angular.forEach(errUrlArr, function(url, key){
									userUrls.push({'web_url':url});
								});
								localStorage.setItem('urls',angular.toJson(userUrls));
								fwToolbar.setPac(true);	
							}

							chrome.tabs.update(popup.currentTabId,{url:popup.currentUrl});
						}
						// $window.close();
					  }). error(function(data, status, headers, config) {});
	 }
	 
	 popup.toSet=function(){
		 chrome.tabs.update(popup.currentTabId,{url:chrome.extension.getURL("options.html")});
		 $window.close();
	 };

	 popup.toppay=function(){
	 	chrome.tabs.update(popup.currentTabId,{url:chrome.extension.getURL("options.html#/pay")});
		 $window.close();
	 };

	 popup.logOut=function(){
	 	localStorage.removeItem('token');
	 	chrome.tabs.update(popup.currentTabId,{url:chrome.extension.getURL("login.html")});
	 	$window.close();
	 };
    popup.onDemand=function(){
        popup.mode={
            demand:true,
            always:false,
            close:false
        };
        localStorage.setItem('mode',1);
        fwToolbar.setPac(true);
        popup.isHave=popup.oldIsHave;
        popup.isErrHave=popup.oldIsErrHave;
    };
    popup.onAlways=function(){
        popup.mode={
            demand:false,
            always:true,
            close:false
        };
        localStorage.setItem('mode',2);
        chrome.browserAction.setIcon({path:"images/icon-auto-active.png"},function(){});
        fwToolbar.setAlwaysPac(true);
        popup.isHave=true;
        popup.isErrHave=true;
    };
    popup.onClose=function(){
        popup.mode={
            demand:false,
            always:false,
            close:true
        };
        fwToolbar.setPac(false);
        fwToolbar.setAlwaysPac(false);
        chrome.browserAction.setIcon({path:"images/fw.png"},function(){});
        localStorage.setItem('mode',3);
        popup.isHave=true;
        popup.isErrHave=true;
    };
	
});


popapp.controller('loginCtr',function($scope,$http,fwToolbar,faConfig,fwConnect,$location,$window){

		var login=$scope.login={};	
		login.submitLogin=function(login_form,e){
			 if(login_form.$valid){
			 	login.dis = true;
				$http.post(faConfig.ajaxUrl+'index.php?r=member/login', {user_name:login.email,pwd:login.pwd}).
				  success(function(data, status, headers, config) {
					 
					if(data.code==1){
							 localStorage.setItem('token',data.access_token);
							 localStorage.setItem('username',login.email);
							 localStorage.setItem('urls',angular.toJson(data.web_url_arr));
							 //localStorage.setItem('flag',data.s);
							 console.dir(data);
                             localStorage.setItem('pss',data.ss);
							 localStorage.setItem('days',data.expire_days);
							 localStorage.setItem('version',data.version);
                             localStorage.setItem('mode',1);
							 var d=new Date();
							 localStorage.setItem('logintime',d.getTime());
							 localStorage.setItem('hostname',data.host_name);
							 fwToolbar.setPac(true);
							 chrome.browserAction.setIcon({path:"images/fw.png"},function(){});
							 
							 chrome.browserAction.setBadgeText({text: ""});
							 $location.path('/');
					}else{
						alert(data.msg);
                        login.dis = false;
						chrome.browserAction.setIcon({path:"images/icon-never.png"},function(){});
						
						chrome.browserAction.setBadgeText({text: ""});
					}
						
				  }). error(function(data, status, headers, config) {});
				
			 }
		};

    login.toForgot=function(){
        chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
            function(tabs){
                chrome.tabs.update(tabs[0].id,{url: chrome.extension.getURL("forgot.html")});
            });
        $window.close();
    };
	
});


popapp.controller('regCtr',function($scope,$http,faConfig,fwToolbar,$location){
		

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
							 //localStorage.setItem('ps',data.s);
                             localStorage.setItem('pss',data.ss);
							 localStorage.setItem('days',data.expire_days);
							 localStorage.setItem('version',data.version);
							 localStorage.setItem('hostname',data.host_name);
                             localStorage.setItem('mode',1);
							 var d=new Date();
							 localStorage.setItem('logintime',d.getTime());
							 fwToolbar.setPac(true);
						
							 chrome.browserAction.setIcon({path:"images/fw.png"},function(){});
						
							 chrome.browserAction.setBadgeText({text: ""});
							 $location.path('/');
						}else{
							alert(data.msg);
                            member.dis = false;
							chrome.browserAction.setIcon({path:"images/icon-never.png"},function(){});
						
							chrome.browserAction.setBadgeText({text: ""});
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