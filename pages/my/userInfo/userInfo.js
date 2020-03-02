var uploadFn = require('../../../utils/upload.js');
var util = require('../../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: { 
    user_img:'http://yunxiaozhi-1251388077.cosgz.myqcloud.com/user_imgs/defalut.png',
    fileUrl: 'http://yunxiaozhi-1251388077.cosgz.myqcloud.com/user_imgs/',
    loading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInfo()
  },
  onShareAppMessage: function () {
    return app.share()
  },
  getInfo:function(){
    var that = this;
    app.promiseRequest({
      url: 'user/getInfo'
    }).then((result) => {
      let data = result.data
      //处理班级，去掉括号后的
      var stu_class = data.stu_class.split('（')[0];
      //时间戳转换
      var date = new Date(parseInt(data.user_regTime) * 1000);
      var regTime = util.formatTime2(date);
      var xueji = [
        { 'title': '姓名', 'data': data.name },
        { 'title': '年级', 'data': data.stu_schoolday },
        { 'title': '学号', 'data': wx.getStorageSync('user_id') },
        { 'title': '学院', 'data': data.stu_department },
        { 'title': '班级', 'data': stu_class },
        { 'title': '注册时间', 'data': regTime },
      ];
      that.setData({
        user_img: data.avatar ? data.avatar : (data.user_img ? that.data.fileUrl + data.user_img : that.data.user_img),
        user_name: data.nickname ? data.nickname : data.user_name,
        xueji: xueji,
        loading: false
      });
    }).catch((message) => {
      app.msg(message)
    })
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
  },

  //更新个人信息
  infoError:function(){
    let _this = this 
    wx.showLoading({
      title: '正在更新',
    })
    app.httpRequest({
      url:'user/updateInfo',
      success:function(res){
        app.msg(res.data.message)
        if(res.data.status != 0){
          return
        }
        _this.getInfo()
      }
    })
  }
})