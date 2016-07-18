/**
 * Created by tanghui on 2015/12/21.
 */
var fwForgot=angular.module('fwForgot', ['facapp']);

fwForgot.controller('forgotCtr',function($scope,$http,fwToolbar,faConfig,fwConnect){
    if(localStorage.getItem('token')!=null){
        chrome.tabs.getCurrent(function(tab){
            chrome.tabs.update(tab.id,{url: chrome.extension.getURL("options.html")});
        });
    }

    var forgot=$scope.forgot={};

    forgot.toSend=function(forgot_form){
        if(forgot_form.$valid){
            forgot.dis = true;
            forgot.msg="密码邮件发送中...";
            $http.post(faConfig.ajaxUrl+'index.php?r=member/forgot', {user_name:forgot_form.forgot_email.$viewValue}).
                success(function(data, status, headers, config) {
                    forgot.dis = false;
                    if(data.code==1){
                        forgot.msg='发送成功，请查收邮件';
                        forgot.email="";
                    }else{
                        forgot.msg=data.msg;
                    }
                }).error(function(data, status, headers, config) {});
        }
    };

});