const app = getApp()
var md5 = require('../../utils/md5.js');
const courseFn = require('../../utils/course')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classes:[],
    p:1,
    length:20,
    search:'',
    loading:true,
    finish:false,
    tmpClass:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getClass()
    var tmp_class = wx.getStorageSync('tmp_class')
    var user_id = wx.getStorageSync('user_id')
    this.setData({
      tmpClass: tmp_class,
      userId:user_id
    })
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
    this.setData({
      p:this.data.p + 1,
      loading:true
    })
    this.getClass()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  getClass:function(){
    var that = this
    app.httpRequest({
      url:'Classes/getClassList',
      needLogin:false,
      data:{
        p:that.data.p,
        length:that.data.length,
        search:that.data.search
      },
      success:function(res){
        if(res.data.status == 0){
          var data = that.data.classes
          data = data.concat(res.data.data)
          var finish = false
          if(res.data.data.length < that.data.length){
            finish = true
          }
          that.setData({
            classes:data,
            loading:false,
            finish:finish
          })
        }else{
          app.msg("获取班级列表失败")
        }
      }
    })
  },
  searchInput:function(e){
    this.setData({
      search: e.detail.value
    })
  },
  search:function(e){
    this.setData({
      search:this.data.search,
      p:1,
      finish:false,
      loading:true,
      classes:[]
    })
    this.getClass()
  },

  select: function (e) {
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    var _this = this
    var number = e.currentTarget.dataset.number
    var name = e.currentTarget.dataset.name
    var tmpClass = {
      number:number,
      name:name
    }
    app.httpRequest({
      url: 'data/getCourseFromSchool',
      data: {
        number: number,
        className: name
      },
      needLogin:false,
      success: function (res) {
        wx.hideLoading()
        if (res.data.status !== 0) {
          app.msg(res.data.message)
          return
        }
        let term = app.getConfig('term')
        //还原到最新学期
        let nowTerm = {
          term: term,
          name: courseFn.term2Name(term),
          term_date: app.getConfig('termDate')
        }
        wx.setStorageSync('course_term', nowTerm)
        wx.setStorageSync('tmp_class', tmpClass)
        wx.setStorageSync('course', res.data.data.course)
        wx.switchTab({
          url: '/pages/course/course'
        })
      }
    })
    
  },
  restore:function(){
    app.isBind().then((resolve) => {
      if(resolve){
        wx.showLoading({
          title: '正在切换',
          mask: true
        })
        app.promiseRequest({
          url: 'course/getList'
        }).then((data) => {
          wx.hideLoading()
          wx.removeStorageSync('tmp_class')
          wx.setStorageSync('course', data.data.course);
          wx.setStorageSync('train', data.data.train_course);
          wx.switchTab({
            url: '/pages/course/course'
          })
        }).catch((error) => {
          app.msg(error.message)
        })
      }
    })
  }
})