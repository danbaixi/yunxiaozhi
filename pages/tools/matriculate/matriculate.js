const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    zcb:"http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100002376&idx=1&sn=81c8f818a30a9209b1d9fce11bdc450c&chksm=6a35b04c5d42395ab46821849bc838a0594519dd2fb607182c0aec7e9ca7f1292e7b7312b127#rd",
    tzs:"http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100002372&idx=1&sn=c6d1d66a075b36c7487cfac12f97502c&chksm=6a35b0405d423956885847d84eb6091ef01802c17d12ec411af4a1fc05e62580a4a18a9b103d#rd",
    list:[
      {
        title:'普通本科',
        img: 'benke',
        color:'theme'
      },
      {
        title:'专插本',
        img: 'zcb',
        color:'yellow'
      },
      {
        title:'录取通知书查询',
        img: 'zcb',
        color:'cyan'
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  selectType:function(e){
    let index = e.currentTarget.dataset.index
    if(index == 2){
      wx.navigateTo({
        url: '/pages/article/article?src=' + encodeURIComponent(this.data.tzs),
      })
    }else if(index == 1){
      // wx.navigateTo({
      //   url: '/pages/article/article?src=' + encodeURIComponent(this.data.zcb),
      // })
      wx.navigateTo({
        url: '/pages/tools/matriculate/zcb/zcb',
      })
    }else{
      app.msg("即将上线，尽请期待")
      return
    }
  }
})