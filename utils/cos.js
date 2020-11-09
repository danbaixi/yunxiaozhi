const COS = require('./cos-wx-sdk-v5')
const BUCKET_NAME = 'yunxiaozhi-1251388077'
const REGION = 'ap-guangzhou';
const app = getApp()

const cos = new COS({
  getAuthorization: function (options, callback) {
    // 异步获取临时密钥
    app.httpRequest({
        url: 'cos/getTempKey',
        success: function (result) {
          var data = result.data.data.credentials;
          var credentials = data && data.credentials;
          if (!data || !credentials) return console.error('credentials invalid');
          callback({
              TmpSecretId: credentials.tmpSecretId,
              TmpSecretKey: credentials.tmpSecretKey,
              XCosSecurityToken: credentials.sessionToken,
              StartTime: data.startTime, // 时间戳，单位秒，如：1580000000
              ExpiredTime: data.expiredTime, // 时间戳，单位秒，如：1580000900
          });
        }
    });
  }
})

//上传文件
function uploadFile(filePath, fileName,dirName) {
  cos.postObject({
    Bucket: BUCKET_NAME,
    Region: REGION,
    Key: dirName + '/' + fileName,
    FilePath: filePath,
    onProgress: function (info) {
      console.log(JSON.stringify(info));
    }
  }, function (err, data) {
      if(err){
        console.log('upload error:' + JSON.stringify(err))
        return false
      }
      return true
  });
}

//删除文件
function delFile(fileName){
  cos.deleteObject({
    Bucket: BUCKET_NAME,
    Region: REGION,
    Key: fileName
  }, function(err, data) {
    if(err){
      return false
    }
    return true
  });
}

module.exports = {
  uploadFile,
  delFile
}