var util = require('../../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: { 
    user_img:'http://yunxiaozhi-1251388077.cosgz.myqcloud.com/user_imgs/defalut.png',
    fileUrl: 'http://yunxiaozhi-1251388077.cosgz.myqcloud.com/user_imgs/',
    loading:true,
    uploadFile:'',
    nickNameInput:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInfo()
  },
  onShow: function(){
    if(this.data.uploadFile != ''){
      //设置头像
      let _this = this
      app.httpRequest({
        url:'user/alterUserImg',
        method: 'POST',
        data:{
          url: _this.data.uploadFile
        },
        success:function(res){
          app.msg(res.data.message)
          if(res.data.status == 0){
            _this.setData({
              user_img : _this.data.fileUrl + _this.data.uploadFile
            })
          }
        }
      })
    }
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
        user_img: data.user_img ? that.data.fileUrl + data.user_img : (data.avatar ? data.avatar : that.data.fileUrl + 'default.png'),
        user_name: data.user_name,
        xueji: xueji,
        nickname:data.nickname,
        avatar:data.avatar,
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
        wx.navigateTo({
          url: `../../cropper/cropper?&type=headImg&src=${src}`
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
      nickNameInput: e.detail.value,
    })
  },
  //修改昵称
  UpdateName:function(e){
    var that = this;
    var nickName = that.data.nickNameInput;
    if(nickName == '' || nickName == that.data.user_name){
      app.msg("没有修改内容")
      return
    }
    wx.showLoading({
      title: '提交中',
      mask: true
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
        that.getInfo()
      }
    })
  },

  //更新个人信息
  updateInfo:function(){
    let _this = this 
    wx.showLoading({
      title: '正在更新',
      mask: true
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
  },
  updateWechat:function(){
    let _this = this
    wx.login({
      success: (res) => {
        let code = res.code
        wx.showLoading({
          title: '更新中',
          mask: true
        })
        app.httpRequest({
          url: 'wechat/wechatLogin',
          data: {
            code: code
          },
          needLogin: false,
          success: function (res) {
            wx.getUserInfo({
              success: (res) => {
                app.httpRequest({
                  url: 'user/updateData',
                  data: {
                    code: code,
                    encryptedData: res.encryptedData,
                    iv: res.iv,
                  },
                  success: function (res) {
                    app.msg(res.data.message)
                    if (res.data.status != 0) {
                      return
                    }
                    _this.getInfo()
                  }
                })
              },
              fail: () => {
                app.msg('拒绝授权将无法同步微信信息')
              }
            })
          }
        })
        
      },
      fail: () => {
        app.msg('初始化失败，请重试')
      }
    })
  }
})