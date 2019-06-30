var CryptoJS = require('crypto');
var REGION = 'gz';
var APPID = '1251388077';
var BUCKET_NAME = 'yunxiaozhi';
var SID = 'AKID79ze7PUSL7kBTZRIxUq1A9WoupbBaphT'
var SKEY = 'mNm061lJiBmhYEkBQUN5bwA4tW0JWkoh'
var appid = APPID;
var bucket = BUCKET_NAME;
var region = REGION;
var sid = SID;
var skey = SKEY;
var getSignature = function (once) {
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
};
/**
 * 上传方法
 * filePath: 上传的文件路径
 * fileName： 上传到cos后的文件名
 */
function upload(filePath, fileName,dir_name) {
    //设置目录
    var DIR_NAME = dir_name;
    //上传目录
    var cosUrl = "https://" + REGION + ".file.myqcloud.com/files/v2/" + APPID + "/" + BUCKET_NAME + "/" + DIR_NAME
    // 鉴权获取签名
    var signature = getSignature(false);
    // 头部带上签名，上传文件至COS
    wx.uploadFile({
        url: cosUrl + '/' + fileName,
        filePath: filePath,
        header: {
            'Authorization': signature
        },
        name: 'filecontent',
        formData: {
            op: 'upload'
        },
        success: function(uploadRes){
          if(uploadRes.code == 0){
            return fileName;
          }
        },
        fail: function(e) {
          console.log(e);
            wx.showToast({
              title: '上传图片失败',
              icon:'loading'
            })
        }
    })
}

function OCR(filePath, fileName, dir_name){
  //设置目录
  var DIR_NAME = dir_name;
  //上传目录
  var cosUrl = "https://" + REGION + ".file.myqcloud.com/files/v2/" + APPID + "/" + BUCKET_NAME + "/" + DIR_NAME
  // 鉴权获取签名
  var signature = getSignature(false);
  // 头部带上签名，上传文件至COS
  wx.uploadFile({
    url: cosUrl + '/' + fileName,
    filePath: filePath,
    header: {
      'Authorization': signature
    },
    name: 'filecontent',
    formData: {
      op: 'upload'
    },
    success: function (uploadRes) {
      var url = 'http://yunxiaozhi-1251388077.file.myqcloud.com/certificates/' + fileName;
      var signature = getSignature(false);
      wx.request({
        url: 'https://recognition.image.myqcloud.com/ocr/general',
        header: {
          'Authorization': signature,
          'content-type': 'application/json'
        },
        data: {
          appid: APPID,
          bucket: BUCKET_NAME,
          url: url
        },
        method: "POST",
        success: function (res) {
          console.log(res);
        },
        fail: function (res) {
          console.log(res);
        }
      })
    },
    fail: function (e) {
      console.log(e);
      wx.showToast({
        title: '上传图片失败',
        icon: 'loading'
      })
    }
  })

}
module.exports = {
  upload: upload,
  OCR: OCR,
}