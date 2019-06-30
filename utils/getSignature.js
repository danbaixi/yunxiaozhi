var CryptoJS = require('crypto');

function getSignature (once) {
  var that = this;
  var random = parseInt(Math.random() * Math.pow(2, 32));
  var now = parseInt(new Date().getTime() / 1000);
  var e = now + 60; //签名过期时间为当前+60s
  var path = ''; //多次签名这里填空
  var str = 'a=' + appid + '&k=' + sid + '&e=' + e + '&t=' + now + '&r=' + random +
    '&f=' + path + '&b=' + bucket;
  var sha1Res = CryptoJS.HmacSHA1(str, skey);//这里使用CryptoJS计算sha1值，你也可以用其他开源库或自己实现
  var strWordArray = CryptoJS.enc.Utf8.parse(str);
  var resWordArray = sha1Res.concat(strWordArray);
  var res = resWordArray.toString(CryptoJS.enc.Base64);
  return res;
}

module.exports = getSignature