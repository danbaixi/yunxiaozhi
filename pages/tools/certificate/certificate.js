var uploadFn = require('../../../utils/upload.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  select:function(){
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        var filePath = tempFilePaths[0];
        var dir_name = 'certificates';
        // 获取文件名
        var fileName = filePath.match(/(wxfile:\/\/)(.+)/);
        fileName = fileName[2];
        // 文件上传cos
        uploadFn.OCR(filePath, fileName, dir_name);

      }
    })
  }
})