const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //页面配置 
    winWidth: 0,
    winHeight: 0,
    // tab切换  
    currentTab: 0,
    //tab标题
    tab_title: ['选修大全', '我的选修'],
    loading: true,
    customBar: app.globalData.customBar,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //获取系统信息 
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    //检查是否登录
    app.isBind().then((result) => {
      if (result) {
        that.getPublicList()
      }
    })
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
  bindChange: function (e) {
    this.setData({
      currentTab: e.detail.current
    })
  },
  swichNav: function (e) {
    if (this.data.currentTab === e.target.dataset.current) {
      return false
    }
    this.setData({
      currentTab: e.target.dataset.current
    })
  },

  //获取全部选修
  getPublicList:function(){
    let _this = this
    app.httpRequest({
      url:'Publiccourse/getlist',
      success:function(res){
        if(res.data.status == 0){
          _this.setData({
            loading:false,
            courses:res.data.data
          })
        }
      }
    })
  },
  //搜索
  search: function (e) {
    let val = e.detail.value.toLowerCase()
    let list = this.data.courses
    let count = 0
    for (let i = 0; i < list.length; i++) {
      let a = val
      let b = list[i].name.toLowerCase()
      let c = list[i].teacher.toLowerCase()
      if (b.search(a) != -1 || c.search(a) != -1) {
        list[i].isShow = true
        count++
      } else {
        list[i].isShow = false
      }
    }
    this.setData({
      courses: list,
      isNull: count == 0
    })
  },
  onlyIntenet:function(){
    let onlyIntenet = this.data.onlyIntenet ? false : true
    let list = this.data.courses
    let count = 0
    if(onlyIntenet){
      for (let i = 0; i < list.length; i++) {
        if (list[i].teach_method == '网络授课') {
          list[i].isShow = true
          count++
        } else {
          list[i].isShow = false
        }
      }
    }else{
      for (let i = 0; i < list.length; i++) {
        if (list[i].teach_method != '网络授课') {
          list[i].isShow = true
          count++
        } else {
          list[i].isShow = false
        }
      }
    }
    this.setData({
      courses: list,
      onlyIntenet: onlyIntenet,
      isNull: count == 0
    })
  }
})