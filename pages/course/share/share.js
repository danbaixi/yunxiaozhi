const app = getApp()
const { getCourseShareInfo } = require('../../api/other')
const { getTermByClassname, getCourseListByStuId } = require('../../api/course')
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
    this.setData({
      stu_id: stu_id,
      term: term,
      term_name: term_name
    })
    this.getTerms()
    if (options.stu_id && term) {
      this.setData({
        share:false
      })
      this.getUserInfo()
    }
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
    getCourseShareInfo({
      stu_id: _this.data.stu_id
    }).then((res) => {
      _this.setData(res.data)
    })
  },

  //获取学期
  getTerms: function () {
    let _this = this
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    getTermByClassname({
      stu_id: wx.getStorageSync('user_id'),
      classname: ''
    }).then((res) => {
      wx.hideLoading()
      let terms = res.data
      let termIndex = 0
      terms.forEach((element, index) => {
        if (element.term == _this.data.term) {
          termIndex = index
          return
        }
      })
      _this.setData({
        terms: res.data,
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
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    getCourseListByStuId({
      stu_id: _this.data.stu_id,
      term: _this.data.term,
    }).then((res) => {
      wx.hideLoading()
      wx.setStorageSync('course_stu', { stu_id: _this.data.stu_id,name:_this.data.name,classname: _this.data.classname })
      wx.setStorageSync('course_term', _this.data.terms[_this.data.termIndex])
      wx.setStorageSync('course', res.data.course)
      wx.setStorageSync('train', res.data.train_course)
      wx.switchTab({
        url: '/pages/course/course',
      })
    })
  }
})