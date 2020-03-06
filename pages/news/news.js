var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ['云小智','热点新闻', '校园快讯','学校通知'],
    current:0,
    loading:true,
    finish:false,
    p:1,
    length:10,
    article:[],
    types: ['yunxiaozhi','baiyunxinwen', 'xykx','xinxigonggao']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.getList(that.data.types[0],20);
    if (wx.getStorageSync('showRedDot') != 1) {
      wx.hideTabBarRedDot({
        index: 2
      })
      wx.setStorageSync('showRedDot', 1)
    }
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
    if (this.data.current == 0 && !this.data.finish){
      this.setData({
        p: this.data.p + 1
      })
      this.getList('yunxiaozhi')
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share()
  },

  /** 获取新闻列表 */
  getList: function (type) {
    var that = this;
    if(type != 'yunxiaozhi'){
      app.httpRequest({
        url: 'news/getNews',
        data: {
          type: type,
          num: 20,
        },
        needLogin:false,
        success: function (res) {
          wx.hideLoading();
          if (res.data.status == 1001) {
            var data = {};
            var key = type + "_list";
            data[key] = res.data.data;
            that.setData(data);
          } else {
            app.msg("获取资讯失败")
          }
        }
      })
    }
    app.httpRequest({
      url: 'article/getList',
      data: {
        p: that.data.p,
        length: that.data.length,
      },
      needLogin: false,
      success: function (res) {
        wx.hideLoading()
        if (res.data.status == 1001) {
          var data = that.data.article
          data = data.concat(res.data.data)
          var finish = false
          if(res.data.data.length < that.data.length){
            finish = true
          }
          that.setData({
            article: data,
            finish:finish
          })
        } else {
          app.msg("获取推文失败，请关注云小智公众号查看")
        }
      }
    })
    
  },
  /** 打开新闻 */
  display: function (e) {
    var that = this;
    var num = e.currentTarget.dataset.num;
    var title = e.currentTarget.dataset.title;
    var date = e.currentTarget.dataset.date;
    var type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: 'item/item?num=' + num + '&title=' + title + '&date=' + date + '&type=' + type,
    })
  },

  //tab切换
  tabChange:function(e){
    var that = this;
    var index = e.target.dataset.index;
    if(index != that.data.current){
      var data;
      switch(index){
        case 0: data = that.data.article;break;
        case 1: data = that.data.baiyunxinwen_list;break;
        case 2: data = that.data.xykx_list;break;
        case 3: data = that.data.xinxigonggao_list;break;
      }
      if(data == null){
        that.getList(that.data.types[index],20);
      }
      that.setData({
        current:index
      })
    }
  },

  //打开推文
  viewArticle:function(e){
    var index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: '/pages/article' + '/article?src=' + encodeURIComponent(e.currentTarget.dataset.src),
    })
  }
})