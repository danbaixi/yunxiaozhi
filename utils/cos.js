const COS = require('./cos-wx-sdk-v5')
const app = getApp()

var cos = new COS({
  getAuthorization: function (options, callback) {
    // 异步获取临时密钥
    app.httpRequest({
        url: 'cos/getTempKey',
        success: function (result) {
          console.log(result)
          var data = result.data;
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

export default cos