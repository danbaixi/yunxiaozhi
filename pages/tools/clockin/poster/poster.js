const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:'',
    loading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getPoster()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getPoster:function(){
    let _this = this
    wx.showLoading({
      title: '生成中...',
      mask: true
    })
    app.httpRequest({
      url:'clockin/getPoster',
      success:function(res){
        wx.hideLoading({
          complete: (res) => {},
        })
        _this.setData({
          loading:false
        })
        if(res.data.status == -1){
          app.msg(res.data.status)
          return
        }
        _this.setData({
          url:res.data.data.url
        })
      }
    })
  },
  save:function(){
    let _this = this
    if(_this.data.url == ''){
      app.msg('请先生成海报')
      return
    }
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success () {
              _this.downloadImage()
            }
          })
        }else{
          _this.downloadImage()
        }
      }
    })
  },
  downloadImage:function(){
    let _this = this
    wx.getImageInfo({
      src: _this.data.url,
      success(res) {
        wx.saveImageToPhotosAlbum({
            filePath: res.path,
            success(result) {
              app.msg("保存成功")
            },
            fail:function(){
              app.msg("保存失败")
            }
        })
      },
      fail:function(){
        app.msg('下载图片失败，请检查你的网络情况')
        return
      }
    })
  }
  
})