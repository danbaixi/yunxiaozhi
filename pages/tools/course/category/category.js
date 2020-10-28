// pages/tools/course/category/category.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[
      {
        title:'当前学期课表',
        url: '/pages/course/list/list',
        img: 'course',
        color:'theme'
      },
      {
        title:'理论课',
        url: '/pages/tools/course/theory/theory',
        img: 'theory',
        color:'yellow'
      },
      {
        title:'选修课',
        url: '/pages/tools/course/public/public',
        img: 'public',
        color:'cyan'
      },
      {
        title:'实训课',
        url: '/pages/tools/course/train/train',
        img: 'train',
        color:'olive'
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
  toCourse:function(e){
    let index = e.currentTarget.dataset.index
    let item = this.data.list[index]
    wx.navigateTo({
      url: item.url + '?from=index',
    })
  }
})