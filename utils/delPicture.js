var CryptoJS = require('crypto');
var REGION = 'gz';
var APPID = '1251388077';
var BUCKET_NAME = 'yunxiaozhi';
var SID = 'AKID79ze7PUSL7kBTZRIxUq1A9WoupbBaphT'
var SKEY = 'mNm061lJiBmhYEkBQUN5bwA4tW0JWkoh'
// var cosSignatureUrl = 'https://www.tianyae.com/yxz/yunquan/jianquan.php' 
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
 * 删除cos照片
 */
function delPicture(fileName,dir_name) {
    //设置目录
    var DIR_NAME = dir_name;
    //上传目录
    var cosUrl = "https://" + REGION + ".file.myqcloud.com/files/v2/" + APPID + "/" + BUCKET_NAME + "/" + DIR_NAME
    //fileid
    var fileid = "/" + APPID + "/" + BUCKET_NAME + "/" + dir_name + "/" + fileName
    // 鉴权获取签名
    // wx.request({
    //     url: cosSignatureUrl,
    //     data:{
    //       singe:'singe',
    //       fileid: fileid,
    //     },
    //     success: function(cosRes) {
    var signature = getSignature(true);
            //var signature = cosRes.data
            wx.request({
                url: cosUrl + '/' + fileName,
                header: {
                  'Authorization': signature
                },
                data: {
                  op: 'delete'
                },
                method:"POST",
                success: function(res){
                  if (res.code == 0) {
                    return true;
                  }
                  return false
                },
                fail: function(e) {
                    wx.showToast({
                      title: '删除图片失败',
                      icon:'loading'
                    })
                }
            })
    //     }
    // })
}
module.exports = delPicture