const { getUserData, setNickname, setAvatar,updateUserInfo } = require('../../api/user')
const app = getApp()
const dayjs = require('../../../utils/dayjs.min')
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
      setAvatar({url: _this.data.uploadFile}).then((res) => {
        app.msg(res.message)
        if(res.status == 0){
          _this.setData({
            user_img : _this.data.fileUrl + _this.data.uploadFile
          })
        }
      })
    }
  },
  onShareAppMessage: function () {
    return app.share()
  },
  getInfo:function(){
    var that = this;
    getUserData().then((result) => {
      let data = result.data
      //处理班级，去掉括号后的
      var stu_class = data.stu_class.split('（')[0];
      //时间戳转换
      var date = new Date(parseInt(data.user_regTime) * 1000);
      var regTime = dayjs(date).format('YYYY-MM-DD')
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
          url: `../../cropper/cropper?&type=avatar&src=${src}&width=400&height=400`
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

  /**输入时，改变模态框高度 */
  inputFocus: function () {
    this.setData({
      input_focus: 1
    })
  },

  /** 不输入时，恢复 */
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

  // 修改昵称
  updateName:function(e){
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
    setNickname({nickname: nickName}).then((data) => {
      that.hideModal();
      app.msg(data.message)
      if(data.status == 0){
        that.getInfo()
      }
    })
  },

  //更新个人信息
  updateInfo:function(){
    if(app.getUserId() === 'test'){
      app.msg('测试号无法更新数据')
      return
    }
    let _this = this 
    wx.showLoading({
      title: '正在更新',
      mask: true
    })
    updateUserInfo().then((res) => {
      app.msg(res.message)
      if(res.status != 0){
        return
      }
      _this.getInfo()
    })
  }
})