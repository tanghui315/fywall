
var optapp=angular.module('optapp', ['ngRoute','facapp' ,'ngAnimate','ui.bootstrap']);

optapp.config(function($routeProvider, $locationProvider) {
  $routeProvider
   .when('/', {
    templateUrl: '/options/collect.html',
    controller: 'collCtr'
   
  }).when('/type', {
    templateUrl: '/options/type.html',
    controller: 'typeCtr'
   
  }).when('/order', {
    templateUrl: '/options/order.html',
    controller: 'orderCtr'
   
  }).when('/feedback', {
    templateUrl: '/options/feedback.html',
    controller: 'feedbackCtr'
   
  }).when('/agent', {
    templateUrl: '/options/agent.html',
    controller: 'agentCtr'
   
  }).when('/pay', {
    templateUrl: '/options/pay.html',
    controller: 'payCtr'
   
  });


});


optapp.run(function($rootScope, $location) {

    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
			
		 var cToken=localStorage.getItem('token');
			
				if(cToken==null){
					 chrome.browserAction.setIcon({path:"images/icon-never.png"},function(){});
					 //hrome.browserAction.setPopup({popup:''});
					 chrome.browserAction.setBadgeText({text: ""});
					  chrome.tabs.getCurrent(function(tab){
					 	chrome.tabs.update(tab.id,{url: chrome.extension.getURL("login.html")});
					 });
				}
		  
    });
});

//---工厂方法--处理AJAX--

//-----

optapp.controller('mainCtr',function($scope,$http,faConfig,fwToolbar,$uibModal, $location){

	var main=$scope.main={};
	main.username=localStorage.getItem('username');
	if(localStorage.getItem('hostname')!=null)
	main.baseUrl=localStorage.getItem('hostname');
	else
	main.baseUrl=faConfig.ajaxUrl;
	main.days=localStorage.getItem('days');
	var manifest = chrome.runtime.getManifest();
	main.version=manifest.version;
	main.versionServer=localStorage.getItem('version');
    main.token=localStorage.getItem('token');

    if(localStorage.getItem('pss')!=null)
    {
        var pss=localStorage.getItem('pss');
        main.pss=angular.fromJson(pss);
    }

	main.logOut=function(){
		var cToken=localStorage.getItem('token');
		var username=localStorage.getItem('username');
		if(cToken!=null){
			$http.post(faConfig.ajaxUrl+'index.php?r=member/loginout', {token:cToken,username:username}).
					  		success(function(data, status, headers, config) {
								localStorage.removeItem('token');
								localStorage.removeItem('username');
								localStorage.removeItem('urls');
								fwToolbar.setPac(false);
							 	chrome.tabs.getCurrent(function(tab){
									chrome.tabs.update(tab.id,{url: chrome.extension.getURL("login.html")});
								});
			}). error(function(data, status, headers, config) {});
	 	}
	
	};
    main.editPwd=function()
    {
      var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'editPwd.html',
            controller: 'ModalInstanceCtrl',
            size: 'sm',
            resolve: {
                main:main
            }
        });
    };

    main.editServer=function()
    {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'servList.html',
            controller: 'ModalServerCtrl',
            size: 'lg',
            resolve: {
                main:main
            }
        });

    };


	//main.username=localStorage.getItem('username');

	

});

optapp.controller('ModalServerCtrl',function($scope, $uibModalInstance,main,fwToolbar,$http,faConfig){
    $scope.showSMsg="服务器列表载入中...";
    var cToken=localStorage.getItem('token');
    var username=localStorage.getItem('username');
    $scope.current={
      host: main.pss.sshost
    };
    $http.post(faConfig.ajaxUrl+'index.php?r=option/allsserver', {token:cToken,username:username}).
        success(function(data, status, headers, config) {
            fwToolbar.prOtherlogin(data);
            $scope.sslist=data.sslist;
            $scope.showSMsg="";
        });

    $scope.toSEdit=function(){
        $scope.dis=true;
        var pss=localStorage.getItem('pss');
        pss=angular.fromJson(pss);
        if($scope.current.host==pss.sshost){
            $uibModalInstance.dismiss('cancel');
        }else{
            $scope.showSMsg="正在切换服务器，请稍后...";
            $http.post(faConfig.ajaxUrl+'index.php?r=option/setssserver', {token:cToken,username:username,sshost:$scope.current.host}).
                success(function(data, status, headers, config) {
                    fwToolbar.prOtherlogin(data);
                    if(data.code==1){
                        //localStorage.setItem('ps',data.s);
                        localStorage.setItem('pss',data.ss);
                        main.pss=angular.fromJson(data.ss);
                        if(localStorage.getItem('mode')!=null){
                            var mode=localStorage.getItem('mode');
                            if(mode==1){
                                fwToolbar.setPac(true);
                            }
                            if(mode==2){
                                fwToolbar.setAlwaysPac(true);
                            }
                            if(mode==3){
                                fwToolbar.setPac(false);
                                fwToolbar.setAlwaysPac(false);
                            }
                        }else{
                            fwToolbar.setPac(true);
                        }
                        $uibModalInstance.dismiss('cancel');
                    }else{
                        $scope.showSMsg="你的账号已过期，不能切换服务器";
                        $scope.dis=false;
                    }
                });
        }
       // console.log($scope.current.host);
    };
    $scope.cancelS = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
optapp.controller('ModalInstanceCtrl',function($scope, $uibModalInstance,main,fwToolbar,$http,faConfig){
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.showErr=false;
    $scope.showMsg="";
    $scope.toEdit=function(){

        if(typeof($scope.pwd1)=='undefined'||typeof($scope.pwd2)=='undefined'||typeof($scope.oldpwd)=='undefined')
        {
            $scope.showErr=true;
            $scope.showMsg="不能为空，长度必须6位";
            return false;
        }
        if($scope.pwd1!=$scope.pwd2)
        {
            $scope.showErr=true;
            $scope.showMsg="两次密码不一致";
            return false;
        }else{

            var cToken=localStorage.getItem('token');
            var username=localStorage.getItem('username');
            $http.post(faConfig.ajaxUrl+'index.php?r=option/editpwd', {token:cToken,username:username,pwd:$scope.pwd2,oldpwd:$scope.oldpwd}).
                success(function(data, status, headers, config) {
                    fwToolbar.prOtherlogin(data);
                    if(data.code==-3){
                        $scope.showErr=true;
                        $scope.showMsg=data.msg;
                        return false;
                    }else{
                        alert('修改成功');
                    }
                    $uibModalInstance.dismiss('cancel');
                }). error(function(data, status, headers, config) {});
        }
    }

});

// menu controller
optapp.controller('menuCtr',function($scope,$http,faConfig, $location){
	var menu = $scope.menu = {};

	// 导航栏状态
	menu.isActive = function (viewLocation) { 
        return viewLocation === $location.path();
    };
});


optapp.controller('collCtr',function($scope,$compile,$http,fwToolbar,optionProcess,faConfig){
	
	fwToolbar.setPac(true);	
	var collect=$scope.collect={};
	collect.showOk=false;
	var cToken=localStorage.getItem('token');
	$scope.type={};
	if(cToken!=null)
	{
		 fwToolbar.getAllCollect($scope.collect);
		  optionProcess.getTypeAll($scope,cToken);  
	}	
	collect.add=function(url_form){
	 if(url_form.$valid){
		 var typeid=0;
		 
		 if((typeof collect.type) !='undefined'){
			  typeid=collect.type.mwt_id;
		 }
		 if(collect.weburl.indexOf('http://')==-1){
		 		collect.weburl='http://'+collect.weburl;
		 }
		 var shorturl=fwToolbar.getShortUrl(collect.weburl);
		 var userUrls=angular.fromJson(localStorage.getItem('urls'));
		 if(fwToolbar.inArray(userUrls,shorturl)==true){
		 		alert('链接已经存在');
		 		return false;
		 }
         if(localStorage.getItem('hostname')!=null){
             var hname=localStorage.getItem('hostname');
             hname = fwToolbar.getShortUrl(hname);
             if(shorturl==hname)
             {
                 collect.weburl='';
                 alert('此域名不能加入科学上网规则');
                 return false;
             }

         }

		 var username=localStorage.getItem('username');
		 $http.post(faConfig.ajaxUrl+'index.php?r=option/addcollect', {token:cToken,username:username,web_url:shorturl,title:'custom',type_id:typeid}).
					  success(function(data, status, headers, config) {
					  	fwToolbar.prOtherlogin(data);
						if(data.code==1){
							
							userUrls.push({'web_url':shorturl});
							localStorage.setItem('urls',angular.toJson(userUrls));
							fwToolbar.setPac(true);	
							fwToolbar.getAllCollect($scope.collect);
							collect.weburl='';
						}
					  }). error(function(data, status, headers, config) {});  
	  }
	};
    collect.urledit=function(e,c){
    	if(collect.currentE!=null){
    		collect.urlblur();
    	}
    	//console.log(c);
    	collect.editId=c.user_web_id;
    	collect.editUrl=c.web_url;
    	collect.currentE=e;

    	angular.element(e.target).parent().parent().find('td').eq(0).html("<input type='test' ng-model='collect.editUrl'  />");
 		$compile(angular.element(e.target).parent().parent().find('td').eq(0).contents())($scope);
 		angular.element(e.target).parent().parent().find('td').eq(1).html('<select class="form-control" ng-model="collect.editType"  ng-options="t.type_name for t in type.data"><option value="" style="display:none" >默认</option></select>');
 		if(c.type_id!=0){
 			var index=0;
 			angular.forEach($scope.type.data,function(value, key){
 					if(value.mwt_id==c.type_id){
 						index=key;
 						collect.typeName=value.type_name;
 						return;
 					}
 			});
 			collect.editType=$scope.type.data[index];
 		}else{
 			collect.editType='';
 			collect.typeName='默认';
 		}
    	$compile(angular.element(e.target).parent().parent().find('td').eq(1).contents())($scope);
    	angular.element(e.target).parent().parent().find('td').eq(2).find('i').eq(0).css({'display':'none'});
    	angular.element(e.target).parent().parent().find('td').eq(2).find('i').eq(1).removeAttr('style');
    };
    collect.urlblur=function(){
    	//console.log(collect.editUrl);
    	angular.element(collect.currentE.target).parent().parent().find('td').eq(2).find('i').eq(0).removeAttr('style');
    	angular.element(collect.currentE.target).parent().parent().find('td').eq(2).find('i').eq(1).css({'display':'none'});
    	angular.element(collect.currentE.target).parent().parent().find('td').eq(0).text(collect.editUrl);

    	if(collect.editType!='')
    	angular.element(collect.currentE.target).parent().parent().find('td').eq(1).text(collect.editType.type_name);
    	else
    	angular.element(collect.currentE.target).parent().parent().find('td').eq(1).text(collect.typeName);
    };

    collect.okedit=function(c){

    	var typeid=0;
    	if(collect.editType!='')
    	{
    		typeid=collect.editType.mwt_id;
    	}
    	if(collect.editUrl=='')
    	{
    		alert('不能为空');
    		return;
    	}
    	c.web_url=collect.editUrl;
    	c.type_id=typeid;
    	c.type_name=collect.typeName;
    	//console.log(collect.editType);return;
    	var cToken=localStorage.getItem('token');
		var username=localStorage.getItem('username');
    	$http.post(faConfig.ajaxUrl+'index.php?r=option/editcollect',{token:cToken,username:username,user_web_id:collect.editId,web_url:collect.editUrl,type_id:typeid})
    	.success(function(data, status, headers, config){
    		fwToolbar.prOtherlogin(data);
    		if(data.code==1){
    				var userUrls=angular.fromJson(localStorage.getItem('urls'));		
					userUrls.push({'web_url':collect.editUrl});
					localStorage.setItem('urls',angular.toJson(userUrls));
					fwToolbar.setPac(true);				
			}

    	}).error(function(data, status, headers, config) {});

    	collect.urlblur();

    }

    
    collect.remove=function(wurl){
    	var removeState = confirm("确定移除当前域名？");
    	if (removeState==true)
		  {
			var cToken=localStorage.getItem('token');
			var username=localStorage.getItem('username');
			$http.post(faConfig.ajaxUrl+'index.php?r=option/rmcollect', {token:cToken,username:username,weburl:wurl}).
			success(function(data, status, headers, config) {
				fwToolbar.prOtherlogin(data);
			if(data.code==1){
				var userUrls=angular.fromJson(localStorage.getItem('urls'));
				var newUserUrls=[];
				angular.forEach(userUrls,function(uurl, key){
					if(uurl.web_url!=wurl){
						newUserUrls.push({'web_url':uurl.web_url});
					}
				});
				localStorage.setItem('urls',angular.toJson(newUserUrls));	
				fwToolbar.setPac(true);	
				
				fwToolbar.getAllCollect($scope.collect);
					optionProcess.getTypeAll($scope,cToken);  
			}
			//  $window.close();
			}).error(function(data, status, headers, config) {});
		  }
    };
	
	
});

optapp.controller('typeCtr',function($scope,$compile,$http,optionProcess,faConfig,fwToolbar){
	
	var type=$scope.type={};
	var cToken=localStorage.getItem('token');	
	optionProcess.getTypeAll($scope,cToken);
	  
	 type.add=function(type_form){
		 if(type_form.$valid){
		 		 var username=localStorage.getItem('username');
				 $http.post(faConfig.ajaxUrl+'index.php?r=option/addtype', {token:cToken,username:username,tname:type.name}).
					  success(function(data, status, headers, config) {
						fwToolbar.prOtherlogin(data);
						if(data.code==1){

							optionProcess.getTypeAll($scope,cToken);
							type.name=null;
						}else{
							alert(data.msg);
						}
							
					  }). error(function(data, status, headers, config) {});
			
		 }
	 };
	 type.edit=function(e,t){
	 	if(type.currentE!=null){
    		type.typeblur();
    	}
    	//console.log(c);
    	type.editId=t.mwt_id;
    	type.editTypeName=t.type_name;
    	type.currentE=e;

    	angular.element(e.target).parent().parent().find('td').eq(0).html("<input type='test' ng-model='type.editTypeName'  />");
 		$compile(angular.element(e.target).parent().parent().find('td').eq(0).contents())($scope);

    	angular.element(e.target).parent().parent().find('td').eq(1).find('i').eq(0).css({'display':'none'});
    	angular.element(e.target).parent().parent().find('td').eq(1).find('i').eq(1).removeAttr('style');
	 };

	 type.typeblur=function(){
    	angular.element(type.currentE.target).parent().parent().find('td').eq(1).find('i').eq(0).removeAttr('style');
    	angular.element(type.currentE.target).parent().parent().find('td').eq(1).find('i').eq(1).css({'display':'none'});
    	angular.element(type.currentE.target).parent().parent().find('td').eq(0).text(type.editTypeName);
    
     };

     type.okedit=function(t){

    
    	if(type.editTypeName=='')
    	{
    		alert('不能为空');
    		return;
    	}
    	t.type_name=type.editTypeName;
    	//console.log(collect.editType);return;
    	var cToken=localStorage.getItem('token');
		var username=localStorage.getItem('username');
    	$http.post(faConfig.ajaxUrl+'index.php?r=option/editype',{token:cToken,username:username,type_id:type.editId,type_name:type.editTypeName})
    	.success(function(data, status, headers, config){
    		fwToolbar.prOtherlogin(data);

    	}).error(function(data, status, headers, config) {});

    	type.typeblur();

     };



	 type.remove=function(mwt_id){
	 	var cToken=localStorage.getItem('token');
		var username=localStorage.getItem('username');
		     $http.post(faConfig.ajaxUrl+'index.php?r=option/rmtype', {token:cToken,username:username,mwtid:mwt_id}).
					  success(function(data, status, headers, config) {
						fwToolbar.prOtherlogin(data);
						if(data.code==1){
							optionProcess.getTypeAll($scope,cToken);
						}else{
							alert(data.msg);
						}
							
					  }). error(function(data, status, headers, config) {});
	 }
	
	
});

optapp.controller('orderCtr',function($scope,$http,optionProcess){
	
	var order=$scope.order={};
	var cToken=localStorage.getItem('token');	
	 optionProcess.getOrderAll($scope,cToken);

	  
	
});


optapp.controller('feedbackCtr',function($scope,$http,faConfig,fwToolbar){
	
	var feedback=$scope.feedback={};
	 feedback.types = [
      {tag:'1', name:'我就想吐槽'},
      {tag:'2', name:'充值未到账'},
      {tag:'3', name:'改进的建议'},
      {tag:'4', name:'其他的问题'}
    ];
    feedback.type=feedback.types[0];
	feedback.toSend=function(feedback_form){
		 if(feedback_form.$valid){

			var cToken=localStorage.getItem('token');
			var username=localStorage.getItem('username');
		     $http.post(faConfig.ajaxUrl+'index.php?r=option/sendfb', {token:cToken,username:username,type:feedback.type.name,msgcontent:feedback.msgcontent}).
					  success(function(data, status, headers, config) {
						fwToolbar.prOtherlogin(data);
						if(data.code==1){
							feedback.msgcontent="";
							alert('发送成功');
						}else{
							alert('发送失败');
						}
							
					  }). error(function(data, status, headers, config) {});
		 }
		
	}  
	
});

optapp.controller('agentCtr',function($scope,$http,faConfig,fwToolbar){
  var agent=$scope.agent={};

  var cToken=localStorage.getItem('token');	
  var username=localStorage.getItem('username');
  $http.post(faConfig.ajaxUrl+'index.php?r=option/allagent', {token:cToken,username:username}).
				  success(function(data, status, headers, config) {
				  	   fwToolbar.prOtherlogin(data);
					   $scope.agent.data=data.agent_data;
				  }). error(function(data, status, headers, config) {});

});

optapp.controller('payCtr',function($scope,$http,faConfig,fwToolbar,$uibModal,$location){
  var pay=$scope.pay={};
  pay.ebank = true;
  pay.payTab = function(param) {
        if(param === 'ebank') {
            pay.ebank = true;
            pay.alipay = pay.code = false;
        }
        if(param === 'alipay') {
            pay.alipay = true;
            pay.ebank = pay.code = false;
        }
        if(param === 'code') {
            pay.code = true;
            pay.alipay = pay.ebank = false;
        }
  };
  pay.username=localStorage.getItem('username');
  if(localStorage.getItem('hostname')!=null)
   pay.baseUrl=localStorage.getItem('hostname');
   else
    pay.baseUrl=faConfig.ajaxUrl;

    pay.toAlipay=function()
    {
        if(typeof(pay.tnumber)=='undefined'){
            alert('请输入交易号');
            return;
        }

      var cToken=localStorage.getItem('token'); 
      var username=localStorage.getItem('username');
      $http.post(faConfig.ajaxUrl+'index.php?r=pay/alipayorder', {token:cToken,username:username,orderid:pay.tnumber}).
                  success(function(data, status, headers, config) {
                       fwToolbar.prOtherlogin(data);
                       if(data.code==-3){
                            alert('订单不存在，请等待一分钟后重试');
                       }
                       if(data.code==-4){
                            alert('订单已结使用');
                       }
                       if(data.code==-5){
                            alert('你充值的金额低于1元');
                       }
                       if(data.code==1){
                          alert('充值成功');
                          //$location.path('/pay');
                          chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
                             function(tabs){
                              chrome.tabs.update(tabs[0].id,{url: chrome.extension.getURL("options.html#/pay")});
                            });
                       }
                       //window.location.href='/options.html#/pay';
                        
                       pay.tnumber='';
                       //$scope.agent.data=data.agent_data;
                  }). error(function(data, status, headers, config) {});

    };

    pay.showCode=function(){

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'showCode.html',
            controller: '',
            size: 'sm',
            resolve: {
            }
        });
    };

   $('.pay-btn').click(function(){
                var money=$(this).attr('money');
                var d=new Date();
                var orderid=d.getTime()+Math.floor(Math.random()*999+1);
                $('#orderNo').val(orderid);
                if(money!=0){
                    $("#amt").val(money);
                    $("#tradeSummary").val($(this).attr('proname'));
            
                    $("#alipayment").submit();
                }
    });
        $('#useCode').click(function(){
            $("#payment").attr('action',pay.baseUrl+'index.php?r=member/usecode');
                var opcode=encodeURIComponent($('#invitationCode').val());
                 $('#invitationCode').val(opcode);
                 var d=new Date();
                             var orderid=d.getTime()+Math.floor(Math.random()*999+1);
                             $('#corderNo').val(orderid);
                if(opcode!=""){
                    $(this).attr('disabled','disabled');
                    $("#payment").submit();

                }else{
                    alert('请输入体验码');
                }
             });

});
