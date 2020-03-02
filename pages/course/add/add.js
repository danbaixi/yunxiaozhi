const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name:'',
    address:'',
    teacher:'',
    weeklysNum:20,
    weeklyMode: -1,
    weeklySelect:[
      {
        value:1,
        name:'单周'
      },
      {
        value: 2,
        name: '双周'
      },
      {
        value: 0,
        name: '全部'
      }
    ],
    weeklys:[],
    weeklysResult:'',
    numbers:['一','二','三','四','五','六','七','八','九','十','十一','十二'],
    multiArray:[],
    multiIndex: [0,0,0],
    week:-1,
    section:'',
    id:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.isLogin()
    let id = options.id || 0
    let weeklys = []
    //初始化数据
    let multiArray = [],arr1 = [],arr2 = []
    for(let i=0;i<5;i++){
      arr1.push('周' + this.data.numbers[i])
    }
    for(let i=0;i<12;i++){
      arr2.push('第' + this.data.numbers[i] + '节')
    }
    multiArray.push(arr1)
    multiArray.push(arr2)
    multiArray.push(arr2)
    //初始化周数
    for (let i = 1; i <= this.data.weeklysNum; i++) {
      weeklys[i] = false
    }
    this.setData({
      id: id,
      multiArray: multiArray,
      weeklys: weeklys
    })
    if(id){
      this.getCourse(id)
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

  },
  showModal:function(){
    this.setData({
      modalName: 'weekly'
    })
  },
  hideModal:function(){
    this.setData({
      modalName: ''
    })
  },
  //选择周次模式
  selectWeeklyMode:function(e){
    let val = e.currentTarget.dataset.value
    let weeklys = []
    for (let i = 1; i <= this.data.weeklysNum;i++){
      if (val == 0 || (val == 1 && i % 2 == 1) || (val == 2 && i % 2 == 0)){
        weeklys[i] = true
      }
    }
    this.setData({
      weeklyMode:val,
      weeklys: weeklys
    })
  },
  //选择周数
  selectWeekly:function(e){
    let index = e.currentTarget.dataset.index
    let weeklys = this.data.weeklys
    weeklys[index] = !weeklys[index]
    this.setData({
      weeklys:weeklys,
      weeklyMode:-1
    })
  },
  //确认周数
  selectWeeklys:function(){
    let result = []
    for (var i = 1; i <= this.data.weeklysNum;i++){
      if(this.data.weeklys[i]){
        result.push(i)
      }
    }
    if(result.length == 0){
      app.msg('请选择周数')
      return
    }
    var start = result[0]
    var end = result[0]
    var strings = []
    for(let i = 1;i<result.length;i++){
      if(result[i] - end == 1){
        end = result[i]
        if(i == result.length - 1){
          strings.push(start + '-' + end)
        }
      }else{
        if(start == end){
          strings.push(start)
        }else{
          strings.push(start + '-' + end)
        }
        start = result[i]
        end = result[i]
        if (i == result.length - 1) {
          strings.push(end)
        }
      }
    }
    this.setData({
      weeklysResult: strings.join(","),
      modalName:''
    })
  },
  //选择节数
  multiChange(e) {
    let result = e.detail.value
    if(result[1] > result[2]){
      app.msg("你选择的节数有误，请重新选择")
      return
    }
    if(result[1] == result[2]){
      app.msg("哪有只上一节的课程？如果有请反馈给客服")
      return
    }
    if(result[1] < 4 && result[2] >= 4){
      app.msg("中午可是要休息的哦，这课程不合理")
      return
    }
    if (result[1] < 8 && result[2] >= 8) {
      app.msg("下午可是要吃饭的呀，这课程不合理")
      return
    }
    if(result[1] % 2 == 1 && result[2]-result[1] == 1){
      app.msg("白云还没有" + (result[1]+1) + '-' + (result[2]+1) + "节这样的课程")
      return
    }
    this.setData({
      week: result[0],
      section: (result[1]+1) + '-' + (result[2]+1)
    })
  },
  multiColumnChange:function(e){
    let multiIndex = this.data.multiIndex
    multiIndex[e.detail.column] = e.detail.value
    if (e.detail.column == 1 || e.detail.column == 2){
      if(multiIndex[2] < multiIndex[1]){
        multiIndex[1] = e.detail.value
        multiIndex[2] = e.detail.value
      }
    }
    this.setData({
      multiIndex: multiIndex
    })
  },
  nameInput:function(e){
    this.setData({
      name:e.detail.value
    })
  },
  addressInput: function (e) {
    this.setData({
      address: e.detail.value
    })
  },
  teacherInput:function(e){
    this.setData({
      teacher:e.detail.value
    })
  },
  //保存
  save:function(){
    let _this = this
    if(_this.data.name == ''){
      app.msg('请输入课程名称')
      return
    }
    if(_this.data.address == ''){
      app.msg('请输入上课地点')
      return
    }
    if (_this.data.weeklysResult == '') {
      app.msg('请选择课程周数')
      return
    }
    if (_this.data.week < 0 || _this.data.section == '') {
      app.msg('请选择课程节数')
      return
    }
    let data = {
      id: _this.data.id,
      name: _this.data.name,
      address: _this.data.address,
      teacher: _this.data.teacher || '',
      weekly:_this.data.weeklysResult,
      week:_this.data.week+1,
      section:_this.data.section
    }
    app.httpRequest({
      url:'course/addCourse',
      data:data,
      method: 'POST',
      success:function(res){
        if(res.data.status == 0){
          app.msg(res.data.message,'success')
          _this.getCourseList().then((result) => {
            if (result.status == 0) {
              app.msg("保存成功", "success")
              wx.setStorageSync('course', result.data.course);
              wx.setStorageSync('train', result.data.train_course);
            } else {
              app.msg("保存成功，获取课表失败，请手动更新课表")
            }
          })
          setTimeout(()=>{
            wx.switchTab({
              url: '/pages/course/course',
            })
          },1000)
        }
      }
    })
  },
  //获取课表列表
  getCourseList: function () {
    return app.promiseRequest({
      url: 'course/getList'
    })
  },

  //获取课程
  getCourse: function (id) {
    let _this = this
    wx.showLoading({
      title:'正在加载...'
    })
    app.httpRequest({
      url:'course/getCourseById',
      data:{
        id:id
      },
      success:function(res){
        wx.hideLoading()
        if(res.data.status != 0){
          app.msg(res.data.message)
          wx.navigateBack({
            
          })
          return
        }
        let course = res.data.data
        _this.setData({
          name:course.course_name,
          address:course.course_address,
          teacher:course.course_teacher
        })
        _this.anaWeekly(course.course_weekly)
        _this.anaWeek(course.course_week,course.course_section)
      }
    })
  },
  //删除课表
  deleteCourse:function(){
    let _this = this
    wx.showModal({
      title: '温馨提示',
      content: '你确认要删除此课程吗？',
      success:function(res){
        if (res.confirm){
          wx.showLoading({
            title: '正在删除',
          })
          app.httpRequest({
            url: 'course/deleteCourseById',
            data: {
              id: _this.data.id
            },
            success: function (res) {
              wx.hideLoading()
              if (res.data.status == 0) {
                _this.getCourseList().then((result) => {
                  if (result.status == 0) {
                    app.msg("删除成功", "success")
                    wx.setStorageSync('course', result.data.course);
                    wx.setStorageSync('train', result.data.train_course);
                  } else {
                    app.msg("删除成功，更新课表失败，请手动更新课表")
                  }
                  setTimeout(() => {
                    wx.switchTab({
                      url: '/pages/course/course',
                    })
                  }, 1000)
                })
              } else {
                app.msg(res.data.message)
              }
            }
          })
        }
      }
    })

  },

  //解析周次
  anaWeekly:function(weeklys){
    let weeklysArr = this.data.weeklys
    let arr = weeklys.split(',')
    for(let i=0;i<arr.length;i++){
      let weekly = arr[i].split('-')
      if(weekly.length == 1){
        weeklysArr[weekly[0]] = true
      }else{
        for (let j = weekly[0]; j <= weekly[1];j++){
          weeklysArr[j] = true
        }
      }
    }
    this.setData({
      weeklysResult:weeklys,
      weeklys: weeklysArr
    })
  },
  anaWeek:function(week,section){
    var week = week - 1
    let sections = section.split('-')
    let multiIndex = [week,sections[0]-1,sections[1]-1]
    this.setData({
      week:week,
      section:section,
      multiIndex: multiIndex
    })
  }
})