const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customBar: app.globalData.customBar,
    loading:true,
    fileUrl:app.globalData.headImgUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      from:options.from
    })
    this.getList()
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
  getList:function(){
    let _this = this
    app.httpRequest({
      url:'user/getClassStudent',
      success:function(res){
        if(res.data.status == 0){
          _this.setData({
            friends: res.data.data.students,
            total:res.data.data.total,
            loading: false
          })
        }
      }
    })
  },
  search: function (e) {
    let val = e.detail.value
    let list = this.data.friends
    let count = 0
    for (let i = 0; i < list.length; i++) {
      let a = val
      if (list[i].stu_name.search(a) != -1) {
        list[i].isShow = true
        count++
      } else {
        list[i].isShow = false
      }
    }
    this.setData({
      friends: list,
      isNull: count == 0
    })
  }
})