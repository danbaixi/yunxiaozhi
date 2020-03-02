var app = getApp();
var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    xueqi_name:'2017-2018第二学期',
    exam:[],
    number:0,
    //页面配置 
    winWidth: 0,
    winHeight: 0,
    // tab切换  
    currentTab: 0,
    //tab标题
    tab_title: ['期末考试', '等级考试'],
    loading:true,
    allStatus:false,
    customBar: app.globalData.customBar,
    colors:[
      'orange',
      'green',
      'cyan',
      'blue',
      'purple',
      'pink',
      'red',
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if(options.currentTab){
      that.setData({
        currentTab : options.currentTab
      })
    }
    //获取系统信息 
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    //检查是否登录
    app.isBind().then((result) => {
      if(result){
        that.getCourseExam();
        that.getMyExam();
      }
    })
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function (options) {
    var that = this;
    var isFresh = that.data.isFresh;
    if (isFresh) {
      that.getMyExam();
      that.setData({
        isFresh: false,
      })
    }
  },
  /**
  * 页面相关事件处理函数--监听用户下拉动作
  */
  onPullDownRefresh: function () {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share('期末考试安排，请查收','exam.png',this.route)
  },
  /** 
 * 滑动切换tab 
 */
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  /** 
  * 点击tab切换 
  */
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  getCourseExam:function(e){
    var that = this;
    app.httpRequest({
      url: 'exam/getlist',
      success: function (res) {
        if (res.data.status == 0) {
          var course_exam =  res.data.data.data
          for (var i = 0; i < course_exam;i++){
            course_exam[i].open = 0
          }
          that.setData({
            loading:false,
            course_exam: course_exam,
            term: res.data.data.term
          });
        } else {
          app.msg(res.data.message)
        }
      },
    })
  },
  getMyExam:function(e){
    var that = this;
    var my_exams = wx.getStorageSync("my_exams");
    if (my_exams != '') {
      wx.hideLoading()
      that.setData({
        my_exam: my_exams,
        myExamIsNull: false,
      });
      return;
    }
    app.httpRequest({
      url: 'exam/getmylist',
      success: function (res) {
        if (res.data.status == 0) {
          var now = util.formatTime2(new Date());
          var data = res.data.data;
          for(var i=0;i<data.length;i++){
            var days = that.dateDiff(data[i].exam_date,now);
            data[i].days = days;
          }
          that.setData({
            loading:false,
            my_exam: res.data.data,
            myExamIsNull: false,
          });
          wx.setStorageSync("my_exams", res.data.data)
        }else{
          app.msg(res.data.message)
        }
      },
    })
  },
  add:function(e){
    wx.navigateTo({
      url: 'add/add',
    })
  },
  //复制
  copy:function(e){
    var that = this;
    var id = e.currentTarget.dataset.id;
    var data = that.data.course_exam[id];
    var string = "科目："+data.course+" "+"时间："+data.time;
    wx.setClipboardData({
      data:string,
    })
  },
  //修改
  edit:function(e){
    var that = this;
    var id = e.currentTarget.dataset.id;
    var data = that.data.my_exam[id];
    wx.navigateTo({
      url: 'add/add?action=edit&id='+data.id+'&name='+data.exam_name+'&num='+data.exam_num+'&date='+data.exam_date+'&address='+data.exam_address+'&position='+data.exam_position,
    })
  },
  //计算两个日期的天数
  dateDiff: function (date1, date2) {
    var start_date = new Date(date1.replace(/-/g, "/"));
    var end_date = new Date(date2.replace(/-/g, "/"));
    var days = start_date.getTime() - end_date.getTime();
    var day = parseInt(days / (1000 * 60 * 60 * 24));
    return day;
  },
  //伸缩
  open:function(e){
    var index = e.currentTarget.dataset.index
    var exams = this.data.course_exam
    exams[index].open = (exams[index].open == 1 ? 0 : 1)
    this.setData({
      course_exam:exams
    })
  },
  changeAll:function(){
    let exams = this.data.course_exam
    for(let i=0;i<exams.length;i++){
      exams[i].open = !this.data.allStatus
    }
    this.setData({
      course_exam:exams,
      allStatus:!this.data.allStatus
    })
  }
})