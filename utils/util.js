function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatTime2(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}

/** 自定义 */
function formatTime3(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

/**
 * 时间戳转换为时间格式
 */
function formatTime(number, format) {
  var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  var returnArr = [];
  var date = new Date(number * 1000);
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));
  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));
  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}
/**
 * 模拟登录加密
 */
var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function encodeInp(input) {
  var output = "";
  var chr1, chr2, chr3 = "";
  var enc1, enc2, enc3, enc4 = "";
  var i = 0;
  do {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);
    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;
    if (isNaN(chr2)) {
      enc3 = enc4 = 64
    } else if (isNaN(chr3)) {
      enc4 = 64
    }
    output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
    chr1 = chr2 = chr3 = "";
    enc1 = enc2 = enc3 = enc4 = ""
  } while (i < input.length);
  return output
}

//数字补零
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//函数防抖
function debounce(fn,delay,immediate){
  let timeout,result
  return function(){
    let context = this
    let args = arguments

    if(timeout){
      clearTimeout(timeout)
    }
    if(immediate){
      let callNow = !timeout
      timeout = setTimeout(function(){
        timeout = null
      },delay)
      if(callNow){
        result = fn.apply(context,args)
      }
    }else{
      timeout = setTimeout(function(){
        fn.apply(context,args)
      },delay)
    }
    return result
  }
}

//判断滑动方向
function getTouchData(endX, endY, startX, startY) {
  let turn = "";
  let length = 50
  if (endX - startX > length && Math.abs(endY - startY) < length) {
    turn = "right";
  } else if (endX - startX < -length && Math.abs(endY - startY) < length) {
    turn = "left";
  }
  return turn;
}
  //星期几转换
function num2Week(num){
  let weeks = ['日','一','二','三','四','五','六']
  return weeks[num]
}

//格式化课表地址
function formatAddress(address){
  address = address.replace('-', '_')//把-换成_
  var temp = address.split('_');
  if (temp.length > 1) {
    address = temp[0] + temp[1];
  } else {
    address = temp[0];
  }
  return address
}

//判断是否是默认昵称
function isDefaultNickname(nickname){
  return nickname.indexOf('yxz_') === -1 ? false : true
}

//获取配置，支持使用“.”
//key为空，返回全部
function getConfig(key){
  let configs = wx.getStorageSync('configs')
  if(key){
    let keyArr = key.split('.')
    let result = ""
    if(configs.hasOwnProperty(keyArr[0])){
      result = configs[keyArr[0]]
    }
    if(keyArr.length == 1){
      return result
    }
    for(let i=1;i<keyArr.length;i++){
      if(result.hasOwnProperty(keyArr[i])){
        result = result[keyArr[i]]
      }else{
        return false
      }
    }
    return result
  }
  return configs
}

//是否是tab页
function isTabPage(page){
  let pages = [
    '/pages/index/index',
    '/pages/course/course',
    '/pages/tool/tool',
    '/pages/my/my',
  ]
  if(!page){
    return false
  }
  if(pages.indexOf(page) === -1){
    return false
  }
  return true
}

module.exports = {
  formatTime: formatTime,
  formatTime2: formatTime2,
  formatTime3: formatTime3,
  encodeInp: encodeInp,
  debounce: debounce,
  getTouchData: getTouchData,
  num2Week:num2Week,
  formatAddress:formatAddress,
  isDefaultNickname:isDefaultNickname,
  getConfig:getConfig,
  isTabPage:isTabPage
}
