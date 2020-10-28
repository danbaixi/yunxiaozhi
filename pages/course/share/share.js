const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    image:'https://mmbiz.qpic.cn/mmbiz_png/YWKTC18p77JpsbMIEeKeaD54MUVydoyuJbYJS6fZR2UO7f3lhoibXichN3YLeZYlRaZCfP9FV9OmdnxicVRBQJ5TQ/0?wx_fmt=png',
    display:true,
    share:true, //分享页面 or 查看分享页面
    stu_id: '',
    term: 0,
    termIndex:0,
    terms:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let stu_id = options.stu_id || wx.getStorageSync('user_id')
    if(!stu_id){
      this.setData({
        display:false
      })
    }
    let term = options.term || 0
    let term_name = options.term_name || ''
    this.getTerms()
    this.setData({
      stu_id: stu_id,
      term: term,
      term_name: term_name
    })
    if (options.stu_id && term) {
      this.setData({
        share:false
      })
      this.getUserInfo()
    }
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
    return {
      title: `点击查看我的${this.data.term_name}的课表`,
      path: `/pages/course/share/share?stu_id=${this.data.stu_id}&term=${this.data.term}&term_name=${this.data.term_name}`,
      imageUrl: this.data.image
    }
  },
  //获取分享人的信息
  getUserInfo:function(){
    let _this = this
    app.promiseRequest({
      url:'data/getNameByStuId',
      data:{
        stu_id: _this.data.stu_id
      },
      needLogin:false
    }).then((result) => {
      let name = result.data.name
      if(name.length <= 3){
        result.data.name = name[0] + '同学'
      }else{
        result.data.name = name[0] + name[1] + '同学'
      }
      _this.setData(result.data)
    }).catch((error) =>{
      app.msg(error.message)
    })
  },
  //获取学期
  getTerms: function () {
    let _this = this
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    app.promiseRequest({
      url: 'data/getTermsByClassname',
      data: {
        stu_id: wx.getStorageSync('user_id'),
        classname: ''
      },
      needLogin: false,
    }).then((result) => {
      wx.hideLoading()
      let terms = result.data
      let termIndex = 0
      terms.forEach((element, index) => {
        if (element.term == _this.data.term) {
          termIndex = index
          return
        }
      })
      _this.setData({
        terms: result.data,
        termIndex: termIndex
      })
    })
  },
  changeTerm:function(e){
    let index = e.detail.value
    this.setData({
      termIndex: index,
      term: this.data.terms[index].term,
      term_name: this.data.terms[index].name,
    })
  },
  viewCourse:function(){
    let _this = this
    let thisStuId = wx.getStorageSync('user_id')
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    app.promiseRequest({
      url:'data/getCourseByStuId',
      data:{
        stu_id: _this.data.stu_id,
        term: _this.data.term,
      },
      needLogin:false
    }).then((result) => {
      if (thisStuId != this.data.stu_id) {
        wx.setStorageSync('course_stu', { stu_id: _this.data.stu_id,name:_this.data.name,classname: _this.data.classname })
      }
      wx.setStorageSync('course_term', _this.data.terms[_this.data.termIndex])
      wx.setStorageSync('course', result.data.course);
      wx.setStorageSync('train', result.data.train_course);
      wx.switchTab({
        url: '/pages/course/course',
      })
    }).catch((error) => {
      app.msg(error.message)
    })
  }
})