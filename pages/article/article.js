// pages/article-1/article-1.js
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
    this.setData({
      src: decodeURIComponent(options.src),
      img: options.img === undefined ? '' : decodeURIComponent(options.img),
      title: options.title || '云小智'
    })
    if(options.title !== undefined){
      wx.setNavigationBarTitle({
        title:options.title
      })
    }
  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.title,
      imageUrl: this.data.img,
      path: "pages/article/article?src=" + encodeURIComponent(this.data.src) + "&title=" + this.data.title + "&img=" + this.data.img
    }
  }
})