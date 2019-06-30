var md5 = require('../../../../utils/md5.js');
var util = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    regTime:null,
    regEndTime: null,
    examTime:null
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
  //选择报名时间
  regTimeChange: function (e) {
    this.setData({
      regTime: e.detail.value
    })
  },
  //选择报名时间
  regTimeChange: function (e) {
    this.setData({
      regTime: e.detail.value
    })
  },
  //选择截止报名时间
  regEndTimeChange: function (e) {
    if (e.detail.value < this.data.regTime){
      wx.showModal({
        title: '提示',
        content: '截止时间必须大于报名时间',
        showCancel:false
      })
    }else{
      this.setData({
        regEndTime: e.detail.value
      })
    }
  },
  //选择考试时间
  examTimeChange: function (e) {
    if (e.detail.value <= this.data.regEndTime){
      wx.showModal({
        title: '提示',
        content: '考试时间必须大于报名时间',
        showCancel:false
      })
    }else{
      this.setData({
        examTime: e.detail.value
      })
    }
  },
  formSubmit:function(e){
    var that = this;
    var name = e.detail.value.name;
    var regTime = e.detail.value.regTime.replace(/-/g, '/');
    var regEndTime = e.detail.value.regEndTime.replace(/-/g, '/');
    var examTime = e.detail.value.examTime.replace(/-/g, '/');
    if (name == "" || regTime == null ||regEndTime == null || examTime == null){
      wx.showModal({
        title: '提示',
        content: '请务必填写全部内容',
        showCancel: false
      })
    }else{
      var user_id = wx.getStorageSync('user_id');
      var date = util.formatTime2(new Date());
      var str = user_id + '&^!*@' + date;
      var AppId = md5.hexMD5(str);
      wx.request({
        url: 'https://www.tianyae.com/yxz/countdown/newList.php',
        data:{
          writer: user_id,
          AppId: AppId,
          name:name,
          regTime:regTime,
          regEndTime: regEndTime,
          examTime: examTime,
        },
        success:function(res){
          if(res.data.code==1004){
            wx.showToast({
              title: '添加成功',
              icon: 'success'
            })
          }else if(res.data.code==1003){
            wx.showToast({
              title: '服务器异常',
              icon: 'loading'
            })
          } else if (res.data.code == 1002){
            wx.showToast({
              title: '参数有误',
              icon: 'loading'
            })
          } else{
            wx.showToast({
              title: '非法操作',
              icon: 'loading'
            })
          }
        }
      })
    }
  }
})