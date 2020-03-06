const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading:true,
    showQuestion: false,
    grade:6,
    names: ['最强王者', '璀璨钻石', '华贵铂金', '荣耀黄金', '英勇黄铜'],
    rankColor:['red','yellow','olive']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let stu_id = wx.getStorageSync('user_id')
    this.setData({
      stu_id: stu_id
    })
    this.getRank()
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
  //获取排名
  getRank:function(term){
    let _this = this
    app.httpRequest({
      url: 'score/getAllRank',
      success:function(res){
        _this.setData({
          loading:false
        })
        if(res.data.status == 0){
          _this.setData(res.data.data)
        }else{
          app.msg(res.data.message)
        }
      }
    })
  },
  showQuestion:function(){
    this.setData({
      showQuestion:true
    })
  },
  hideQuestion: function () {
    this.setData({
      showQuestion: false
    })
  },
  openRank:function(){
    let _this = this
    wx.showModal({
      title: '温馨提示',
      content: '此操作会将您隐藏姓名的设置去除，确认要设置吗？',
      success:function(res){
        if(res.confirm){
          app.updateSetting('is_display_name', 0).then((data) => {
            let user = _this.data.user
            user.is_display_name = 0
            _this.setData({
              user:user
            })
            app.msg("设置成功")
          }).catch((message) => {
            app.msg(message)
          })
        }
      }
    })
  }
})