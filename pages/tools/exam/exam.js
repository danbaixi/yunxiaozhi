const app = getApp();
const dayjs = require('dayjs');
const util = require('../../../utils/util.js')
const { getExamClassList, getExamList, getCourseExamList } = require('../../api/other')
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
    ],
    term_index:0,
    classList:[],
    class_name:''
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
    that.getCourseExam()
    that.getMyExam()
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

  // 获取期末考试列表
  getCourseExam:function(e){
    const that = this
    getCourseExamList({
      class_name:that.data.class_name
    }).then((res) => {
      if (res.status == 0) {
        let course_exam =  res.data.data
        let term = res.data.term
        let picker_term = []
        for (let i = 0; i < course_exam;i++){
          course_exam[i].open = 0
        }
        for(let i= 0;i < term.length;i++){
          picker_term.push(term[i].title)
        }
        that.setData({
          loading:false,
          course_exam: course_exam,
          term: term,
          picker_term: picker_term,
          class_name:res.data.class_name
        });
        if(that.data.classList.length == 0){
          that.getClassList()
        }
      }
    })
  },

  // 获取考试列表
  getMyExam:function(e){
    const that = this
    let now = dayjs()
    getExamList().then((res) => {
      if (res.status == 0) {
        let data = res.data;
        for(let i=0;i<data.length;i++){
          var days = dayjs(data[i].exam_date).diff(now,'day')
          data[i].days = days
        }
        that.setData({
          loading:false,
          my_exam: data,
          myExamIsNull: false,
        });
      }
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
  },

  //选择学期
  selectTerm:function(e){
    this.setData({
      term_index: e.detail.value
    })
  },

  // 获取班级
  getClassList:function(){
    let _this = this
    if(_this.data.term.length == 0){
      return
    }
    getExamClassList({
      term: _this.data.term[_this.data.term_index].num
    }).then((res) => {
      if(res.status == 0){
        _this.setData({
          classList:res.data
        })
      }
    })
  },

  selectClass:function(e){
    let class_name = this.data.classList[e.detail.value]
    this.setData({
      class_name:class_name
    })
    this.getCourseExam()
  }
})