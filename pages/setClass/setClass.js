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
    tmpClass:'',
    collects:[]
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
    this.getCollectClass()
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
    var number = e.currentTarget.dataset.number
    var name = e.currentTarget.dataset.name
    var tmpClass = {
      number:number,
      name:name
    }
    let courseTerm = courseFn.getNowCourseTerm()
    app.httpRequest({
      url: 'data/getCourseByClassname',
      data: {
        number: number,
        term:courseTerm.term,
        classname: name
      },
      needLogin:false,
      success: function (res) {
        wx.hideLoading()
        if (res.data.status !== 0) {
          app.msg(res.data.message)
          return
        }
        let term = app.getConfig('nowTerm.term')
        let date = app.getConfig('nowTerm.date')
        if(term === false){
          term = '20191'
          date = '2020-03-02'
        }
        //清空course_stu
        wx.removeStorageSync('course_stu')
        wx.setStorageSync('tmp_class', tmpClass)
        wx.setStorageSync('course', res.data.data.course)
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
        app.promiseRequest({
          url: 'course/getList'
        }).then((data) => {
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
          wx.setStorageSync('course', data.data.course);
          wx.setStorageSync('train', data.data.train_course);
          wx.navigateBack({
            delta: 0,
          })
        }).catch((error) => {
          app.msg(error.message)
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
    app.httpRequest({
      url: 'course/getCollectClasses',
      success:function(res){
        if(res.data.status != 0){
          app.msg(res.data.message)
          return
        }
        _this.setData({
          collects: res.data.data
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
    app.httpRequest({
      url:'course/collectClass',
      data:{
        class_id: number
      },
      success:function(res){
        app.msg(res.data.message)
        if(res.data.status != 0){
          return
        }
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
          app.httpRequest({
            url:'course/deleteCollect',
            data:{
              class_id: number
            },
            success:function(res){
              app.msg(res.data.message)
              if(res.data.status == 0){
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
            }
          })
        }
      }
    })
    
  }
})