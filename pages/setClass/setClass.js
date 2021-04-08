const app = getApp()
const courseFn = require('../../utils/course')
const { getClassList } = require('../api/other')
const { getCourseByClassname, getCollectClass, addcollectClass, delCollectClass,getCourseList } = require('../api/course');
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
    tmpClass:'',
    course_stu: '',
    collects:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getClass()
    var tmp_class = wx.getStorageSync('tmp_class')
    var course_stu = wx.getStorageSync('course_stu')
    var user_id = wx.getStorageSync('user_id')
    this.setData({
      tmpClass: tmp_class,
      course_stu: course_stu,
      userId:user_id
    })
    this.getCollectClass()
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

  getClass:function(){
    const that = this
    getClassList({
      p:that.data.p,
      length:that.data.length,
      search:that.data.search
    }).then((res) => {
      if(res.status == 0){
        var data = that.data.classes
        data = data.concat(res.data)
        var finish = false
        if(res.data.length < that.data.length){
          finish = true
        }
        that.setData({
          classes:data,
          loading:false,
          finish:finish
        })
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
    var number = e.currentTarget.dataset.number
    var name = e.currentTarget.dataset.name
    var tmpClass = {
      number:number,
      name:name
    }
    let courseTerm = courseFn.getNowCourseTerm()
    getCourseByClassname({
      number: number,
      term:courseTerm.term,
      classname: name
    }).then((res) => {
      if(res.status == 0){
        //清空course_stu
        wx.removeStorageSync('course_stu')
        wx.setStorageSync('tmp_class', tmpClass)
        wx.setStorageSync('course', res.data.course)
        wx.navigateBack({
          delta: 0,
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
        getCourseList().then((res) => {
          if(res.status == 0){
            let term = app.getConfig('nowTerm.term')
            //还原到最新学期
            let nowTerm = {
              term: term,
              name: courseFn.term2Name(term),
              term_date: app.getConfig('nowTerm.date')
            }
            //清空course_stu
            wx.removeStorageSync('course_stu')
            wx.removeStorageSync('tmp_class')
            wx.setStorageSync('course_term', nowTerm)
            wx.setStorageSync('course', res.data.course);
            wx.setStorageSync('train', res.data.train_course);
            wx.navigateBack({
              delta: 0,
            })
          }
        })
      }
    })
  },

  //获取已收藏的班级
  getCollectClass:function(){
    if(!app.getUserId()){
      return
    }
    let _this = this
    getCollectClass().then((res) => {
      if(res.status == 0){
        _this.setData({
          collects: res.data
        })
      }
    })
  },

  //收藏班级
  collect:function(e){
    if(!app.getUserId()){
      app.msg("登录后才能收藏哦")
      return
    }
    let number = e.currentTarget.dataset.number,
        name = e.currentTarget.dataset.name
    let _this = this
    //检测是否已经收藏
    let collects = _this.data.collects
    let collected = collects.some((item) => {
      if(item.number == number){
        return true
      }
    })
    if(collected){
      app.msg("你已收藏过这个班的课表啦")
      return
    }
    addcollectClass({
      class_id: number
    }).then((res) => {
      if(res.status == 0){
        app.msg("收藏成功")
        collects.push({
          name: name,
          number: number
        })
        _this.setData({
          collects:collects
        })
      }
    })
  },

  //删除收藏班级
  delectCollect:function(e){
    let _this = this
    let number = e.currentTarget.dataset.number
    wx.showModal({
      title: '温馨提示',
      content: '确定要删除此收藏记录吗？',
      success:function(res){
        if(res.confirm){
          delCollectClass({
            class_id: number
          }).then((res) => {
            if(res.status == 0){
              app.msg("删除成功")
              let collects = _this.data.collects
              collects.map((item,index) => {
                if(item.number == number){
                  collects.splice(index,1)
                  return
                }
              })
              _this.setData({
                collects
              })
            }
          })
        }
      }
    })
  }
})