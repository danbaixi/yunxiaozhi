const app = getApp()
const { backPage, canUpdate,setUpdateTime } = require('../../../utils/common')
const { getAttendanceList, updateAttendanceList } = require('../../api/other')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    xq: [],
    attendance:[],
    num:0,
    showModal: false,
    input_focus: 0,
    update_time:null,
    isNull:false,
    customBar: app.globalData.customBar,
    statusBar: app.globalData.statusBar,
    custom: app.globalData.custom,
    loading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options){
      this.setData({
        from:options.from
      })
    }
    this.getData()
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh:function(){
    this.update()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share('点击查询个人考勤记录', 'attendance.png', this.route)
  },

  /**
* 弹窗
*/
  showDialogBtn: function () {
    var that = this;
    that.setData({
      showModal: true
    });
    /**获取验证码 */
    wx.request({
      url: app.globalData.domain + 'login/getLoginInitData',
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
  hideModal: function () {
    this.setData({
      showModal: false
    });
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },
  /** 获取验证码 */
  yzmInput: function (e) {
    this.setData({
      yzm: e.detail.value,
    })
  },
  /**
   * 对话框确认按钮点击事件
   */
  update: function (e) {
    if(app.getUserId() === 'test'){
      app.msg('测试号无法更新数据')
      return
    }
    const that = this
    const canUpdateResult = canUpdate('attendance')
    if(canUpdateResult !== true){
      app.msg(canUpdateResult)
      return
    }
    wx.showLoading({
      title: "更新中",
      mask: true
    })
    updateAttendanceList().then((res) => {
      if (res.status == 0) {
        app.msg('更新了' + res.data + '条记录')
        setUpdateTime('attendance')
        setTimeout(function () {
          that.onLoad()
        }, 2000)
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
  backPageBtn: function () {
    backPage(this.data.from)
  },

  // 获取数据
  getData:function(){
    let that = this
    getAttendanceList().then((res) => {
      if (res.status == 0) {
        res.data.loading = false
        res.data.isNull = res.data.term.length == 0
        that.setData(res.data)
      }
    })
  }
})