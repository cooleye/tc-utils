'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var crypto = require('crypto');
var net = require('net');


var extend = exports.extend = function(){
  var args = [].slice.call(arguments);
  var deep = true;
  var target = args.shift();
  if (isBoolean(target)) {
    deep = target;
    target = args.shift();
  }
  target = target || {};
  var length = args.length;
  var options, name, src, copy, copyAsArray, clone;
  for(var i = 0; i < length; i++){
    options = args[i] || {};
    for(name in options){
      src = target[name];
      copy = options[name];
      if (src && src === copy) {
        continue;
      }
      if (deep && copy && (isObject(copy) || (copyAsArray = isArray(copy) ))) {
        if (copyAsArray) {
          copyAsArray = false;
          clone = [];
        }else{
          clone = src && isObject(src) ? src : {}; 
        }
        target[name] = extend(deep, clone, copy);
      }else{
        target[name] = copy;
      }
    }
  }
  return target;
};


//Object上toString方法
var toString = Object.prototype.toString;

/**
 * 是否是boolean
 * @param  {[type]}  obj
 * @return {Boolean}
 */
var isBoolean = exports.isBoolean = function(obj){
  return toString.call(obj) === '[object Boolean]';
};
/**
 * 是否是数字
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
var isNumber = exports.isNumber = function(obj){
  return toString.call(obj) === '[object Number]';
};
/**
 * 是否是个对象
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
var isObject = exports.isObject = function(obj){
  if (isBuffer(obj)) {
    return false;
  }
  return toString.call(obj) === '[object Object]';
};
/**
 * 是否是字符串
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
var isString = exports.isString = function(obj){
  return toString.call(obj) === '[object String]';
};
/**
 * 是否是个function
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
var isFunction = exports.isFunction = function(obj){
  return typeof obj === 'function';
};
/**
 * 是否是日期
 * @return {Boolean} [description]
 */
var isDate = exports.isDate = function(obj){
  return util.isDate(obj);
};
/**
 * 是否是正则
 * @param  {[type]}  reg [description]
 * @return {Boolean}     [description]
 */
var isRegexp = exports.isRegexp = function(obj){
  return util.isRegExp(obj);
};
/**
 * 是否是个错误
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
var isError = exports.isError = function(obj){
  return util.isError(obj);
};
/**
 * 判断对象是否为空
 * @param  {[type]}  obj
 * @return {Boolean}
 */
var isEmpty = exports.isEmpty = function(obj){
  if (isObject(obj)) {
    var key;
    for(key in obj){
      return false;
    }
    return true;
  }else if (isArray(obj)) {
    return obj.length === 0;
  }else if (isString(obj)) {
    return obj.length === 0;
  }else if (isNumber(obj)) {
    return obj === 0;
  }else if (obj === null || obj === undefined) {
    return true;
  }else if (isBoolean(obj)) {
    return !obj;
  }
  return false;
};
/**
 * 是否是个标量
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
var isScalar = exports.isScalar = function(obj){
  return isBoolean(obj) || isNumber(obj) || isString(obj);
};
/**
 * 是否是个数组
 * @type {Boolean}
 */
var isArray = exports.isArray = Array.isArray;
/**
 * 是否是IP
 * @type {Boolean}
 */
exports.isIP = net.isIP;
exports.isIP4 = net.isIP4;
exports.isIP6 = net.isIP6;
/**
 * 是否是个文件
 * @param  {[type]}  p [description]
 * @return {Boolean}   [description]
 */
var isFile = exports.isFile = function(p){
  if (!fs.existsSync(p)) {
    return false;
  }
  var stats = fs.statSync(p);
  return stats.isFile();
};
/**
 * 是否是个目录
 * @param  {[type]}  p [description]
 * @return {Boolean}   [description]
 */
var isDir = exports.isDir = function(p){
  if (!fs.existsSync(p)) {
    return false;
  }
  var stats = fs.statSync(p);
  return stats.isDirectory();
};
/**
 * 是否是buffer
 * @type {Boolean}
 */
var isBuffer = exports.isBuffer = Buffer.isBuffer;
/**
 * 是否是个数字的字符串
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
var numberReg = /^((\-?\d*\.?\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
var isNumberString = exports.isNumberString = function(obj){
  return numberReg.test(obj);
};


/**
 * 判断一个文件或者目录是否可写
 * @param  {[type]}  p [description]
 * @return {Boolean}      [description]
 */
var isWritable = exports.isWritable = function(p){
  if (!fs.existsSync(p)) {
    return false;
  }
  var stats = fs.statSync(p);
  var mode = stats.mode;
  var uid = process.getuid ? process.getuid() : 0;
  var gid = process.getgid ? process.getgid() : 0;
  var owner = uid === stats.uid;
  var group = gid === stats.gid;
  return !!(owner && (mode & parseInt('00200', 8)) || 
      group && (mode & parseInt('00020', 8)) || 
      (mode & parseInt('00002', 8)));
};

/**
 * 递归创建目录，同步模式
 * @param  {[type]} p    [description]
 * @param  {[type]} mode [description]
 * @return {[type]}      [description]
 */
var mkdir = exports.mkdir = function(p, mode){
  mode = mode || '0777';
  if (fs.existsSync(p)) {
    chmod(p, mode);
    return true;
  }
  var pp = path.dirname(p);
  if (fs.existsSync(pp)) {
    fs.mkdirSync(p, mode);
  }else{
    mkdir(pp, mode);
    mkdir(p, mode);
  }
  return true;
};
/**
 * 递归的删除目录，返回promise
 * @param  string p       要删除的目录
 * @param  boolean reserve 是否保留当前目录，只删除子目录
 * @return Promise         
 */
var rmdir = exports.rmdir = function(p, reserve){
  if (!isDir(p)) {
    return getPromise();
  }
  var deferred = getDefer();
  fs.readdir(p, function(err, files){
    if (err) {
      return deferred.reject(err);
    }
    var promises = files.map(function(item){
      var filepath = path.normalize(p + '/' + item);
      if (isDir(filepath)) {
        return rmdir(filepath, false);
      }else{
        var deferred = getDefer();
        fs.unlink(filepath, function(err){
          return err ? deferred.reject(err) : deferred.resolve();
        })
        return deferred.promise;
      }
    })
    var promise = files.length === 0 ? getPromise() : Promise.all(promises);
    return promise.then(function(){
      if (!reserve) {
        var deferred = getDefer();
        fs.rmdir(p, function(err){
          return err ? deferred.reject(err) : deferred.resolve();
        })
        return deferred.promise;
      }
    }).then(function(){
      deferred.resolve();
    }).catch(function(err){
      deferred.reject(err);
    })
  })
  return deferred.promise;
}
/**
 * 修改目录或者文件权限
 * @param  {[type]} p    [description]
 * @param  {[type]} mode [description]
 * @return {[type]}      [description]
 */
var chmod = exports.chmod = function(p, mode){
  mode = mode || '0777';
  if (!fs.existsSync(p)) {
    return true;
  }
  return fs.chmodSync(p, mode);
};
/**
 * 获取文件内容
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
var getFileContent = exports.getFileContent = function(file, encoding){
  if (!fs.existsSync(file)) {
    return '';
  }
  return fs.readFileSync(file, encoding || 'utf8');
};
/**
 * 设置文件内容
 * @param  {[type]} file [description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
var setFileContent = exports.setFileContent = function(file, data){
  var filepath = path.dirname(file);
  mkdir(filepath);
  return fs.writeFileSync(file, data);
};
/**
 * 大写首字符
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
var ucfirst = exports.ucfirst = function(name){
  name = (name || '') + '';
  return name.substr(0,1).toUpperCase() + name.substr(1).toLowerCase();
};
/**
 * 获取字符串的md5
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
var md5 = exports.md5 = function(str){
  var instance = crypto.createHash('md5');
  instance.update(str + '');
  return instance.digest('hex');
};
/**
 * 获取随机整数
 * @return {[type]} [description]
 */
var rand = exports.rand = function(min, max){
  return Math.floor(min + Math.random() * (max - min + 1));
}

/**
 * 快速生成一个object
 * @param  {[type]} key   [description]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
var getObject = exports.getObject = function(key, value){
  var obj = {};
  if (!isArray(key)) {
    obj[key] = value;
    return obj;
  }
  key.forEach(function(item, i){
    obj[item] = value[i];
  });
  return obj;
};
/**
 * 将数组变成对象
 * @param  {[type]} arr       [description]
 * @param  {[type]} key       [description]
 * @param  {[type]} valueKeys [description]
 * @return {[type]}           [description]
 */
var arrToObj = exports.arrToObj = function(arr, key, valueKey){
  var result = {};
  var arrResult = [];
  arr.forEach(function(item){
    var keyValue = item[key];
    if (valueKey === null) {
      arrResult.push(keyValue);
    }else if (valueKey) {
      result[keyValue] = item[valueKey];
    }else{
      result[keyValue] = item;
    }
  })
  return valueKey === null ? arrResult : result;
}