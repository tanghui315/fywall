var fs = require('fs');
var uglify = require('uglify-js');
 
//js文件压缩方法
function jsMinify(flieIn, fileOut) {
    var flieIn=Array.isArray(flieIn)? flieIn : [flieIn];
	var result = uglify.minify(flieIn,{
		mangle:false
	});
    fs.writeFileSync(fileOut, result.code, 'utf8');
}

//调用压缩js的方法
jsMinify(['./oa/lib/controller/apply.js',
 './oa/lib/controller/apply_from_edit.js', 
 './oa/lib/controller/attendance.js',
  './oa/lib/controller/boardroomCtrl.js', 
  './oa/lib/controller/directives.js', 
  './oa/lib/controller/editform.js', 
  './oa/lib/controller/form_set.js',
   './oa/lib/controller/formSetStep.js', 
   './oa/lib/controller/logins.js',
    './oa/lib/controller/main_ctrl.js',
     './oa/lib/controller/myInfoCtrl.js',
     './oa/lib/controller/noticeCtrl.js', 
     './oa/lib/controller/permissionCtrl.js', 
     './oa/lib/controller/pointCtrl.js', 
     './oa/lib/controller/project.js', 
     './oa/lib/controller/skillCtrl.js',
      './oa/lib/controller/skillpoint.js',
       './oa/lib/controller/task.js', 
       './oa/lib/controller/tile.js', 
       './oa/lib/controller/top.js', 
       './oa/lib/controller/user.js', 
       './oa/lib/controller/workmateCtrl.js'], './oa/lib/controller/controller.min.js');