const app = getApp()
const { getClockInPoster } = require('../../../api/other')
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

  getPoster:function(){
    let _this = this
    wx.showLoading({
      title: '生成中...',
      mask: true
    })
    getClockInPoster().then((res) => {
      if(res.status == 0){
        _this.setData({
          loading: false,
          url:res.data.url
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