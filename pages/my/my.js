var util = require('../../utils/util.js');
var md5 = require('../../utils/md5.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user_id:"未绑定",
    userInfo: null,
    user_name:"",
    user_img:"http://yunxiaozhi-1251388077.cosgz.myqcloud.com/user_imgs/defalut.png",
    visible:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  onShow:function(){
    this.onPullDownRefresh();
  },

  onPullDownRefresh: function () {
    this.getUserInfo();
    setTimeout(() => {
      wx.hideNavigationBarLoading({
        complete: (res) => {},
      })
      wx.stopPullDownRefresh({
        complete: (res) => {},
      })
    }, 1000);
  },

  onShareAppMessage:function () {
    return app.share()
  },

  bind:function(){
    if(!app.getLoginStatus()){
      app.msg('请先登录')
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return
    }

    if (!app.getUserId()){
      wx.navigateTo({
        url: '/pages/bind/bind',
      })
      return
    }

    app.msg("暂不支持解绑")

  },


  //获取用户信息
  getUserInfo:function(){
    let that = this
    let userInfo = wx.getStorageSync('user_info')
    let session = app.getLoginStatus()
    let user_id = app.getUserId()
    if(userInfo){
      that.setData({
        user_name: userInfo.nickName,
        user_img: userInfo.avatarUrl
      })
    }
    if (session && user_id){
      let start = user_id.substring(0, 3);
      let end = user_id.substring(8);
      user_id = start + "*****" + end;
      this.setData({
        session: session,
        user_id: user_id
      });
    }else{
      return
    }
    
    app.httpRequest({
      url: 'user/getInfo',
      success: function (res) {
        if (res.data.status == 1001) {
          //处理班级，去掉括号后的
          var stu_class = res.data.data.stu_class.split('（')[0];
          //时间戳转换
          var date = new Date(parseInt(res.data.data.user_regTime) * 1000);
          var regTime = util.formatTime2(date);
          //如果头像为空，设为默认头像
          var user_img = "defalut.png";
          if (res.data.data.user_img != null && res.data.data.user_img != "") {
            user_img = res.data.data.user_img;
          }
          var xueji = [
            { 'title': '姓名', 'data': res.data.data.name },
            { 'title': '年级', 'data': res.data.data.stu_schoolday },
            { 'title': '学号', 'data': wx.getStorageSync('user_id') },
            { 'title': '学院', 'data': res.data.data.stu_department },
            { 'title': '班级', 'data': stu_class },
            { 'title': '注册时间', 'data': regTime },
          ];
          that.setData({
            user_img: user_img,
            user_name: res.data.data.user_name,
            xueji: xueji,
            xj: JSON.stringify(xueji)
          });
        } else {
          app.msg('获取个人信息失败')
        }
      }
    })

  },

  showModal(e) {
    this.setData({
      modalName: 'kefu'
    })
  },

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  handleClose:function(){
    this.setData({
      visible: false
    });
  },

  goPage:function(e){
    if(!app.getLoginStatus()){
      app.msg("请先登录")
      return
    }
    if (!app.getUserId()) {
      app.msg("请先绑定账号")
      return
    }
    var page = e.currentTarget.dataset.page
    var param = "";
    if(page == 'userInfo'){
      param = '?img=' + this.data.user_img + '&name=' + this.data.user_name+'&xueji='+ this.data.xj
    }
    wx.navigateTo({
      url: '/pages/my/' + page + '/' + page + param,
    })
  },
})