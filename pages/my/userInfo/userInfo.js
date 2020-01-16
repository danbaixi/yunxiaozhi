var uploadFn = require('../../../utils/upload.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: { 
    user_img:'http://yunxiaozhi-1251388077.cosgz.myqcloud.com/user_imgs/defalut.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var img = options.img;
    var name = options.name;
    var xueji = JSON.parse(options.xueji);
    that.setData({
      user_img: img,
      user_name: name,
      xueji: xueji
    });
  },
  onShareAppMessage: function () {
    return app.share()
  },
  //更新头像
  updateImg:function(){
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const src = res.tempFilePaths[0]
        wx.redirectTo({
          url: `../../cropper/cropper?src=${src}`
        })
      }
    })
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {

  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function (e) {
    this.setData({
      showModal: false
    })
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function (e) {
    this.hideModal();
  },
  //修改昵称窗口打开
  openUpdateName:function(){
    var that = this;
    that.setData({
      showModal: true,
    });
  },
  /**输入验证码时，改变模态框高度 */
  inputFocus: function () {
    this.setData({
      input_focus: 1
    })
  },
  /** 不输入验证码时，恢复 */
  inputBlur: function () {
    this.setData({
      input_focus: 0
    })
  },
  /** 获取昵称 */
  yzmInput: function (e) {
    this.setData({
      nickName: e.detail.value,
    })
  },
  //修改昵称
  UpdateName:function(e){
    var that = this;
    var nickName = that.data.nickName;
    if(nickName == that.data.user_name){
      return
    }
    wx.showLoading({
      title: '提交中',
    })
    app.promiseRequest({
      url: 'user/alternickname',
      method: 'POST',
      data: {
        nickname: nickName,
      }
    }).then((data) => {
      that.hideModal();
      app.msg(data.message)
      if(data.status == 0){
        setTimeout(function () {
          var pages = getCurrentPages();
          var currPage = pages[pages.length - 1];
          var prevPage = pages[pages.length - 2];
          prevPage.setData({
            isFresh: true
          });
          wx.navigateBack({})
        }, 1000)
      }
    }).catch((message) => {
      app.msg(message)
    })
  }
})