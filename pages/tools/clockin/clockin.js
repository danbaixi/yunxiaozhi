const app = getApp()
import WxCountUp from '../../../utils/wxCountUp.js'
const { clockIn, getClockInData, getClockInRank } = require('../../api/other')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    todayCount:0,
    times:{
      start:'05:30',
      end: '08:30'
    },
    type:0,
    customBar:app.globalData.customBar,
    tabs: ['今日', '全校', '学院', '班级'],
    list: [],
    length: 10,
    p:1,
    loading: false,
    finish: false,
    headImgUrl:app.globalData.headImgUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this
    let info = wx.getSystemInfoSync()
    _this.setData({
      winHeight:info.windowHeight,
      winWidth:info.windowWidth
    })
    app.isLogin('/' + _this.route).then(function(res){
      _this.getData()
      _this.getRanks()
    })

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getData()
    this.freshRank(this.data.type)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.finish){
      return
    }
    this.getRanks()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share('早起打卡挑战，你敢来吗？', 'clockin.png', this.route)
  },

  // 获取数据
  getData:function(){
    let _this = this
    getClockInData().then((res) => {
      if(res.status == 0){
        _this.setData(res.data)
        _this.todayCountUp()
      }
    })
  },

  // 打卡
  clockIn:function(){
    let _this = this
    clockIn().then((res) => {
      if(res.data.status == -1){
        _this.clockInSuccess()
        _this.setData(res.data)
        _this.getData()
        _this.freshRank()
      }
    })
  },
  //人数滚动
  todayCountUp:function(){
    this.countUp = new WxCountUp('todayCount', this.data.todayCount, {decimalPlaces:0}, this)
    this.countUp.start()
  },
  //打卡成功
  clockInSuccess:function(){
    this.setData({
      modalName:'success'
    })
  },
  //关闭窗口
  close:function(){
    this.setData({
      modalName:''
    })
  },

  //获取海报
  getPoster:function(){
    wx.navigateTo({
      url:'/pages/tools/clockin/poster/poster'
    })
    this.close()
  },

  //获取排名
  getRanks:function(){
    let _this = this
    let type = _this.data.type
    _this.setData({
      loading: true
    })
    getClockInRank({
      p:_this.data.p,
      length:_this.data.length,
      type:type,
      value:_this.getValue(type)
    }).then((res) => {
      if(res.status == 0){
        let list = _this.data.list
        list = list.concat(res.data)
        let finish = res.data.length < _this.data.length
        _this.setData({
          p:_this.data.p + 1,
          list:list,
          finish: finish
        })
      }
    })
  },

  //切换排名
  tabSelect:function(e){
    let _this = this
    if(_this.data.type == e.currentTarget.dataset.id){
      return
    }
    _this.freshRank(e.currentTarget.dataset.id)
  },

  freshRank:function(type){
    this.setData({
      type: type,
      list: [],
      p:1,
      finish:false
    })
    this.getRanks()
  },

  getValue:function(type){
    switch(type){
      default:return '';break
      case 2:return this.data.userInfo.stu_department;break
      case 3:return this.data.userInfo.stu_class_full;break
    }
  },
  showRule:function(){
    this.setData({
      modalName:'rule'
    })
  },
  hideRule:function(){
    this.setData({
      modalName: ''
    })
  },
  goSetting:function(){
    wx.navigateTo({
      url: '/pages/my/set/set',
    })
  },
  goList:function(){
    wx.navigateTo({
      url: '/pages/tools/clockin/list/list',
    })
  },

  //查看打卡记录
  detail:function(e){
    wx.navigateTo({
      url: '/pages/tools/clockin/list/list?stu_id=' + e.currentTarget.dataset.stu_id,
    })
  }
})