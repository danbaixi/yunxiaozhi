var app = getApp();
var util = require('../../../utils/util.js');
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
    isNull:false,
    maxUpdateTime:2,
    refreshAnimation:"",
    StatusBar: app.globalData.statusBar,
    CustomBar: app.globalData.customBar,
    Custom: app.globalData.custom,
    termNumber:[2,1],
    year_index:0,
    type:0, // 0为有效成绩，1为原始成绩
    loading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.isLogin()
    var that = this;
    var winHeight = wx.getSystemInfoSync().windowHeight;
    let update_time = wx.getStorageSync('score_update_time')
    that.setData({
      from: options.from,
      winHeight: winHeight,
      update_time: update_time ? util.formatTime3(new Date(update_time)):'无记录'
    })
    this.getScore(false)
  },

  /**
   * 下拉刷新，更新成绩
   */
  onPullDownRefresh:function(){
    app.msg('请点击黄色按钮更新成绩')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share('您有一份期末成绩单待查收','score.png',this.route)
  },
  /** 
 * 滑动切换tab 
 */
  bindChange: function (e) {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
    var scores = wx.getStorageSync('scores');
    var that = this;
    that.setData({ 
      currentTab: e.detail.current
    });
  },
  /**
   * 进入成绩详情
   */
  itemData:function(e){
    var index = e.currentTarget.dataset.index;
    if(this.data.type == 0){
      var data = this.data.score[index]
    }else{
      var data = this.data.original_score[index]
    }

    wx.navigateTo({
      url: 'top/top?from=score&data=' + encodeURIComponent(JSON.stringify(data))  
    })
  },
  analysis:function(){
    wx.navigateTo({
      url:'ana/ana'
    })
  },
  refresh:function(){
    this.onPullDownRefresh();
  },
  //获取成绩
  getScore:function(update){
    var that = this;
    var scores = wx.getStorageSync('scores');
    if (scores != '' && JSON.stringify(scores) != "{}" && scores.score.length>0 && !update){
      that.setData({
        loading: false,
        gpa: scores.gpa,
        score: scores.score,
        term: scores.term,
        year: scores.year,
        original_score: scores.originalScore
      })
      return
    }
    app.httpRequest({
      url: 'score/getscorelist',
      success: function (res) {
        that.setData({
          loading:false
        })
        if (res.data.status == 0) {
          wx.setStorageSync('scores', res.data.data);
          that.setData({
            isNull:false,
            gpa: res.data.data.gpa,
            score: res.data.data.score,
            term: res.data.data.term,
            year: res.data.data.year,
            original_score: res.data.data.originalScore
          })
        }else if(res.data.status == 1001){
          that.setData({
            isNull:true
          })
        }else{
          app.msg(res.data.message)
        }
      },
    });
  },

  //获取公告
  getNotice: function () {
    var that = this;
    wx.request({
      url: app.globalData.domain + 'notice/getnotice',
      data: {
        page: 'score'
      },
      success: function (res) {
        if (res.data.status == 1001) {
          that.setData({
            hasNotice: res.data.data.display == 1 ? true : false,
            notice: res.data.data.content
          })
        } else {
          that.setData({
            hasNotice: false
          })
        }
      }
    })
  },
  /** 刷新验证码 */
  freshYzm: function () {
    var num = Math.ceil(Math.random() * 1000000);
    this.setData({
      yzmUrl: app.globalData.domain + 'login/getValidateImg?cookie=' + this.data.cookie + '&rand=' + num,
    })
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
  /**
* 弹窗
*/
  updateScore: function () {
    var that = this;
    var system_type = wx.getStorageSync('system_type');
    if (system_type != 2) {
      app.msg("请使用旧教务系统账号登录后更新成绩")
      setTimeout(function () {
        wx.redirectTo({
          url: '/pages/bind/bind',
        })
      }, 2000)
      return;
    }
    // that.setData({
    //   showModal: true
    // });
    /**获取验证码 */
    app.httpRequest({
      url: 'login/getLoginInitData',
      needLogin:false,
      success: function (res) {
        that.setData({
          cookie: res.data.data['cookie'],
          __VIEWSTATE: res.data.data['__VIEWSTATE'],
        })
        that.freshYzm();
      }
    });
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
  /** 获取验证码 */
  yzmInput: function (e) {
    this.setData({
      yzm: e.detail.value,
    })
  },
  //更新成绩
  update:function(){
    var that = this;
    that.setData({ list_is_display: false })
    app.isBind()
    var time = (new Date()).getTime();
    if (wx.getStorageSync('score_update_time') != "") {
      var update_time = wx.getStorageSync('score_update_time');
      var cha = time - update_time;
      var season = 60 - Math.floor(cha / 1000);
    } else {
      var season = 0;
    }
    if (season > 0) {
      app.msg('请在'+season + '秒后更新')
      return
    }
    wx.showLoading({ title: "更新中.." })
    app.httpRequest({
      url: 'score/updateScoreV0',
      data:{
        time:time
      },
      success: function (res) {
        wx.hideLoading()
        if (res.data.status == 0) {
          app.msg('更新成功','success') 
          wx.setStorageSync('scores', '')
          that.getScore(true);
          wx.setStorageSync('score_update_time', time);
          that.setData({
            update_time: util.formatTime3(new Date(time))
          })
        } else {
          if (res.data.status == 1002) {
            that.freshYzm()
          } else if (res.data.status == 1006) {
            that.setData({
              showModal: false
            })
          }
          app.msg(res.data.message)
        }
      }
    })
  },
  backPage:function(){
    if(this.data.from == 'index'){
      wx.navigateBack({
        delta: 1
      });
    }else{
      wx.reLaunch({
        url: '/pages/index/index',
      })
    }
  },
  selectYear:function(e){
    let index = e.detail.value
    this.setData({
      year_index: index
    })
  },
  goRank:function(e){
    let term  = e.currentTarget.dataset.term
    wx.navigateTo({
      url: 'rank/rank?source=score&term=' + term,
    })
  },
  //切换成绩模式
  changeType:function(e){
    let val = e.currentTarget.dataset.val
    if(!val){
      val = this.data.type == 0 ? 1 : 0
    }
    this.setData({
      type: val
    })
  }
})