var md5 = require('../../../utils/md5.js');
var util = require('../../../utils/util.js');
var app = getApp();
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
    courseExamIsNull:false,
    myExamIsNull:false,
    CustomBar: app.globalData.CustomBar,
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
    if (!wx.getStorageSync('user_id')) {
      wx.reLaunch({
        url: '../../bind/bind',
      })
    } else {
      wx.showLoading({title:"加载中"})
      that.getCourseExam();
      that.getMyExam();
    }

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
    return {
      title: '期末考试安排新鲜出炉',
      path: 'pages/tools/exam/exam',
      imageUrl: 'http://yunxiaozhi-1251388077.cosgz.myqcloud.com/wx_share/exam.jpg'
    };
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
    var user_id = wx.getStorageSync('user_id');
    var str = app.globalData.key + user_id;
    var sign = md5.hexMD5(str);
    wx.request({
      url: app.globalData.domain + 'exam/getlist',
      data: {
        sign: sign,
        stu_id: user_id
      },
      success: function (res) {
        wx.hideLoading()
        if (res.data.status == 1001) {
          that.setData({
            course_exam: res.data.data.data,
            term: res.data.data.term
          });
        } else if (res.data.status == 1003) {
          that.setData({
            courseExamIsNull: true,
          });
        } else {
          app.msg("获取失败")
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
    var user_id = wx.getStorageSync('user_id');
    var str = app.globalData.key + user_id;
    var sign = md5.hexMD5(str);
    app.httpRequest({
      url: 'exam/getmylist',
      data: {
        sign: sign,
        stu_id: user_id
      },
      success: function (res) {
        wx.hideLoading()
        if (res.data.status == 1001) {
          var now = util.formatTime2(new Date());
          var data = res.data.data;
          for(var i=0;i<data.length;i++){
            var days = that.dateDiff(data[i].exam_date,now);
            data[i].days = days;
          }
          that.setData({
            my_exam: res.data.data,
            myExamIsNull: false,
          });
          wx.setStorageSync("my_exams", res.data.data)
        } else{
          that.setData({
            myExamIsNull: true,
          });
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
})