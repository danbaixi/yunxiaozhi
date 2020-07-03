const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    display: false,
    clip: true,
    auto: false,
    question:'',
    preQuestion:'',
    answer:[],
    article:'',
    tips:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.isLogin()
    this.init()
    this.showTips()
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
    if(this.data.display){
      this.getClip()
    }
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
    this.setData({
      auto:false
    })
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
    return app.share('光速搜题了解一下~','questions-1.png',this.route)
  },
  
  //初始化
  init:function(){
    let _this = this
    let displayTips = wx.getStorageSync('display_question_tips') || 'yes'
    _this.setData({
      displayTips:displayTips
    })
    wx.setStorageSync('display_question_tips', 'no')
    app.httpRequest({
      url:'question/init',
      success:function(res){
        _this.setData({
          loading: false
        })
        if(res.data.status == -1){
          app.msg(res.data.status)
          _this.setData({
            display: false
          })
          return
        }
        let display = true
        if(res.data.data.notice != ''){
          display = false
        }
        res.data.data.display = display
        _this.setData(res.data.data)
      }
    })
  },
  //看广告增加次数
  add:function(){
    this.addCount()
  },
  //增加次数
  addCount:function(){
    let _this = this
    app.httpRequest({
      url:'question/addCount',
      success:function(res){
        app.msg(res.data.message)
        if(res.data.status == 0){
          _this.setData(res.data.data)
        }
      }
    })
  },
  //自动获取开关
  switchClip:function(e){
    this.setData({
      clip: e.detail.value
    })
  },
  //自动查询开关
  switchAuto:function(e){
    this.setData({
      auto: e.detail.value
    })
    if (e.detail.value) {
      this.checkClip()
    }else {

    }
  },
  //获取剪贴板内容
  getClip:function(){
    if(!this.data.clip && !this.data.auto){
      return
    }
    let _this = this
    wx.getClipboardData({
      success: (res) => {
        if(_this.data.question == res.data || res.data == ''){
          return
        }
        _this.setData({
          question:res.data
        })
        if(_this.data.auto){
          _this.query()
        }else{
          app.msg("题目已粘贴")
        }
      },
      fail:(res) => {
        console.log('获取剪贴板内容失败')
      }
    })
  },
  //输入
  inputing:function(e){
    if(this.data.auto){
      return
    }
    this.setData({
      question: e.detail.value
    })
  },
  //查题
  query:function(){
    let _this = this
    let question = _this.data.question.trim()
    if(question == ''){
      app.msg("请输入需要查询的题目")
      return
    }
    if(_this.data.preQuestion == _this.data.question){
      app.msg("该题已查过啦~")
      return
    }
    // if(_this.data.info.stock <= 0){
    //   app.msg("你的查题次数不足，请先增加")
    //   return
    // }
    wx.showLoading({
      title: '正在查询',
    })
    _this.apiQuery().then((resolve)=>{
      wx.hideLoading()
      let info = _this.data.info
      info.stock -= 1
      _this.setData({
        info: info,
        answer: resolve,
        preQuestion:question
      })
      app.httpRequest({
        url: 'question/query',
        data: {
          question: question,
          answer: resolve,
        },
        success: function (res) {
          if (res.data.status == -1) {
            console.log("添加记录失败")
            return
          }
        }
      })
    }).catch((message) => {
      app.msg(message)
    })
  },
  //请求
  apiQuery:function(){
    let _this = this
    let promise = new Promise((resolve,reject) => {
      wx.request({
        url: _this.data.url + _this.data.question,
        method: 'GET',
        success:function(res){
          if(res.statusCode != 200){
            return reject('查询失败，请重试')
          }
          return resolve(res.data)
        },
        fail:function(res){
          return reject('查询失败，请重试')
        }
      })
    })
    return promise
  },
  //检测剪贴板
  checkClip:function(){
    let interval = setInterval(()=>{
      if(this.data.auto){
        this.getClip()
      }else{
        clearInterval(interval)
      }
    },1000)
  },
  clear:function(){
    if(this.data.auto){
      app.msg("请先关闭粘贴模式")
      return
    }
    this.setData({
      question:''
    })
  },
  showTips:function(){
    this.setData({
      tips:true
    })
  },
  hideTips:function(){
    this.setData({
      tips: false
    })
  },
  //教程
  help:function(){
    if(this.data.article == ''){
      app.msg("获取失败")
      return
    }
    wx.navigateTo({
      url: '/pages/article/article?src=' + encodeURIComponent(this.data.article),
    })
  }
})