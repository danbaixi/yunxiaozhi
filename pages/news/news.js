const app = getApp()
const { openArticle } = require('../../utils/common')
const { getSchoolNews, getArticleList } = require('../api/other')
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
    types: ['yunxiaozhi','baiyunxinwen', 'xykx','xinxigonggao'],
    focus_article:"http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100001363&idx=1&sn=67d2da535e60c9cb0f6e14d6064fd343&chksm=6a35bc575d423541201186f77e8203f6d5318a073a69e614967edf4ebf207381690812f0f08d#rd",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.getList(that.data.types[0],20);
    let src = options.src
    if(src){
      wx.navigateTo({
        url: '/pages/article/article?src=' + src,
      })
    }
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

  // 获取校园新闻
  getSchoolNewsList: function(type){
    const that = this
    getSchoolNews({
      type: type,
      num: 20,
    }).then((res) => {
      console.log(res)
      var data = {}
      var key = type + "_list"
      data[key] = res.data
      that.setData(data)
    })
  },

  /** 获取新闻列表 */
  getList: function (type) {
    const that = this
    if(type != 'yunxiaozhi'){
      that.getSchoolNewsList()
      return
    }
    getArticleList({
      p: that.data.p,
      length: that.data.length,
    }).then((res) => {
      if (res.status == 0) {
        var data = that.data.article
        data = data.concat(res.data)
        var finish = false
        if(res.data.length < that.data.length){
          finish = true
        }
        that.setData({
          article: data,
          finish:finish
        })
      }
    })
  },

  /** 打开新闻 */
  display: function (e) {
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
    openArticle(e.currentTarget.dataset.src)
  },
})