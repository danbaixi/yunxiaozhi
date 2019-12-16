var util = require('../../utils/util.js');
var md5 = require('../../utils/md5.js');
const app = getApp();
const TIMES = [
  [
    ["08:20", "09:05"], ["09:10", "09:55"], ["10:20", "11:05"], ["11:15", "12:00"], ["13:50", ""], ["", "15:20"], ["15:40", ""], ["", "17:10"], ["17:50", ""], ["", "19:20"], ["19:20", ""], ["", "20:50"]
  ],
  [
    ["08:30", "09:15"], ["09:20", "10:05"], ["10:20", "11:05"], ["11:10", "11:55"], ["13:45", "14:30"], ["14:35", "15:20"], ["15:35", "16:20"], ["16:25", "17:10"], ["17:45", "18:30"], ["18:35", "19:20"], ["19:25", "20:10"], ["20:15", "21:00"]
  ]
]
Page({
  /**
   * 页面的初始数据
   */
  data: {
    zhou: ['日','一', '二', '三', '四', '五', '六'],
    jie: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    zhou_num: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周', '第9周', '第10周', '第11周', '第12周', '第13周', '第14周', '第15周', '第16周', '第17周', '第18周', '第19周', '第20周'],
    now_week:1,
    now_day:[],
    now_month:0,
    colorArrays: [
      "93,113,213",
      "133,93,213",
      "193,93,213",
      "213,93,173",
      "213,93,113",
      "213,133,93",
      "213,193,93",
      "173,213,93",
      "113,213,93",
      "93,213,133",
      "93,213,193",
      "50,146,195",
      "38,110,146",
      "195,98,50",
      "146,74,38",
      "123,104,238",
      "65,105,225",
      "34,139,34",
      ],
    course: [],
    train_course_id:0,
    list_is_display:false,
    sheet_visible: false,
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    toggleDelay:false,//延迟加载
    ad:{
      display:false,
      week:7,
      jie:1,
      jieshu:2,
      background:"#6ed4e6",
      color:"#fff",
      title:"这是广告位置欢迎投放广告",
      font_size:10,
      type:1,
      url:"",
      content:""
    },
    login:true,
    tmpClass:'',
    display_course_time:0,
    area:0,
    course_time:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var animation = (typeof options.animation == 'undefined' || !options.animation ? false : true)

    //设置默认参数
    if (wx.getStorageSync('Kopacity') == '') {
      wx.setStorageSync('Kopacity', 90)
    }
    if (wx.getStorageSync('Copacity') == '') {
      wx.setStorageSync('Copacity', 12)
    }
    var winHeight = wx.getSystemInfoSync().windowHeight;
    that.setData({
      imageUrl: wx.getStorageSync('bg_img'),
      list_is_display: false,
      Kopacity: wx.getStorageSync('Kopacity'),
      Copacity: wx.getStorageSync('Copacity'),
      fontSize: wx.getStorageSync('fontSize'),
      winHeight: winHeight
    });

    var week = that.getNowWeek();
    var zhou_num = that.data.zhou_num;
    var n = zhou_num[week - 1].search(/(本周)/i);
    if (n == -1) {
      zhou_num[week - 1] = zhou_num[week - 1] + "(本周)";
    }

    that.setData({
      now_week: week,
      zhou_num: zhou_num
    });
    var month = that.getMonth((that.data.now_week - 1) * 7);
    that.setData({ now_month: month });
    //第一天按周日算起
    for (var i = -1; i < 6; i++) {
      var days = (that.data.now_week - 1) * 7 + i;
      var day = that.data.now_day;
      day.push(that.getDay(days))
    }
    that.setData({
      now_day: day,
    })
    // ad
    var time = (new Date).getTime()
    var score_ad = wx.getStorageSync('score_ad_display');
    if (score_ad == '' || (Math.floor((time - score_ad) / 1000) > app.globalData.adTime * 24 * 60)) {
      if (wx.createInterstitialAd) {
        var interstitialAd = wx.createInterstitialAd({
          adUnitId: 'adunit-fa394b5b086dc048'
        })
        interstitialAd.show()
      } else {
        app.msg("您当前微信版本较低，建议升级到最新版本")
      }
      wx.setStorageSync('score_ad_display', time)
    }
    
    // var tmpClass = wx.getStorageSync('tmp_class');//临时设置班级
    // that.setData({
    //   tmpClass:tmpClass
    // })
    // // that.getCourseList()
    // //获取当前日期
    // that.getTodayDate();
    // //获取课表
    // that.getCourse(week, true,animation);
    // //获取公告
    // // that.getNotice();
    // if (typeof options.ad == "undefined" || options.ad){
    //   // that.getAd()
    // }
    
  },

  onShow:function(){
    // this.onLoad({animation:false,ad:false})
    var tmpClass = wx.getStorageSync('tmp_class');//临时设置班级
    this.setData({
      list_is_display: false,
      tmpClass: tmpClass
    })
    //获取当前日期
    this.getTodayDate();
    //获取课表
    this.getCourse(this.data.now_week, true, false);
    //获取设置
    this.getConfigData()
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share('看课表，一个云小智就够了！','course.png',this.route)
  },
  /**
   * 获取第几周后的月份
   */
  getMonth:function(days) {
    var year = app.globalData.start_year;
    var month = app.globalData.start_month;
    var day = app.globalData.start_day;     
    var date = new Date(year,month-1,day);    
    date.setDate(date.getDate() + days);//获取n天后的日期      
    var m = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);        
    return  m;     
  },
    /**
   * 获取第几周后的星期几的日期
   */
  getDay: function (days) {
    var year = app.globalData.start_year;
    var month = app.globalData.start_month;
    var day = app.globalData.start_day;  
    var date = new Date(year, month-1, day);
    date.setDate(date.getDate() + days);//获取n天后的日期      
    var d = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();//获取当前几号，不足10补0    
    return d;
  },
  /**
   * 获取当前周
   */
  getNowWeek:function(){
    var date = new Date();
    var year = app.globalData.start_year;
    var month = app.globalData.start_month;
    var day = app.globalData.start_day;
    //这里减1，不知道为什么输出的月份比原来的大1..
    var start = new Date(year, month-1, day);
    //计算时间差
    var left_time = parseInt((date.getTime()-start.getTime())/1000);
    var days = parseInt(left_time/3600/24);
    var week = Math.floor(days / 7) + 1;
    var result = week
    if(week>20 || week <= 0){
      result = 1;
    }
    this.setData({
      nowWeek : result
    })
    return result
  },
  /**
   * 获取课表
   */
  getCourse:function(week,first,animation){
    var that = this;
    if(first === false && week == that.data.now_week) return
    var data = wx.getStorageSync('course');
    //将之前的课表清空
    if (typeof animation != "undefined" && animation){
      that.toggleDelay()
    }
    that.setData({ course: [] });
    if (data.length > 0) {
      var i = 0;
      for(var a=0;a<data.length;a++){
        if (typeof data[a].course_weekly == "undefined") {
          continue
        }
        if(that.ana_week(week,data[a]['course_weekly'],data[a]['course_danshuang'])){
          var tmp = data[a]['course_section'].split("-")
          var jie = tmp[0];
          if(tmp.length == 1){
            var jieshu = 1
          }else{
            var jieshu = tmp[1] - tmp[0] + 1;
          }
         
          //格式化上课地点
          data[a]['full_address'] = data[a]['course_address']
          data[a]['course_address'] = data[a]['course_address'].replace('-', '_')//把-换成_
          var temp = data[a]['course_address'].split('_');
          var address;
          if(temp.length>1){
            address = temp[0] + temp[1];
          }else{
            address = temp[0];
          }
          var course = [{
            indexNum: i++,
            week: data[a]['course_week'],
            jie: jie,
            jieshu: jieshu,
            name: that.fiterCourseTitle(data[a]['course_name'],jieshu),
            fullName: data[a]['course_name'],
            address: address,
            fullAddress:data[a]['full_address'],
            num: data[a]['num'],
            zhoushu: data[a]['course_weekly'],
            teacher: data[a]['course_teacher'],
            credit: data[a]['course_credit'],
            method: data[a]['course_method'],
            category: data[a]['course_category']
          }];
          that.setData({ course: that.data.course.concat(course) });
        }
      }
    } else {
      that.setData({ course: null });
    }
    that.getTrain(week)
  },
  /**
   * 选择周数
   */
  select:function(e){
    var week = parseInt(e.detail.value)+1;
    this.getCourse(week,false,true);
    this.getTrain(week);
    var month = this.getMonth((week - 1) * 7);
    this.setData({
      now_week: week,
      now_month: month,
    });
    var day = []
    //周日算起
    for (var i = -1; i < 6; i++) {
      var days = (week - 1) * 7 + i;
      day.push(this.getDay(days))
    }
    this.setData({
      now_day: day,
    })
  },
  /**
   * 显示课表详细内容
   */
  displayCourseInfo:function(e){
    var indexNum = e.currentTarget.dataset.num;
    var data = this.data.course;
    wx.navigateTo({
      url: "info/info?data=" + encodeURIComponent(JSON.stringify(data[indexNum])),
    })
  },
  /**
   * 解析周数
   */
  ana_week:function(week,weekly,danshuang){
    var result = new Array();
    var temp1 = weekly.split(",");
    var temp2 = new Array();
    for(var i=0;i<temp1.length;i++){
      temp2[i] = temp1[i].split("-");
    }
    var k = 0;//周数
    if(danshuang == 0){
      for(var a =0;a<temp1.length;a++){
        if(temp2[a].length ==2){
          for (var start = parseInt(temp2[a][0]);start<=temp2[a][1];start++){
            result[k++] = start;
          }
        }else{
          result[k++] = parseInt(temp2[a][0]);
        }
      }
    }else{
      for (var a = 0; a < temp1.length; a++) {
        if (temp2[a].length == 2) {
          for (var start = parseInt(temp2[a][0]); start <= temp2[a][1]; start++) {
            if(danshuang == 1){
              if (start % 2 != 0) {
                result[k++] = start++;
              }
            }else if(danshuang == 2){
              if (start % 2 == 0) {
                result[k++] = start++;
              }
            }
          }
        } else {
          result[k++] = parseInt(temp2[a][0]);
        }
      }
    }
    for(var j=0;j<result.length;j++){
      if(week == result[j]){
        return true;
      }else if(j==result.length-1){
        return false;
      }
    }
    return false
  },
  /**
   * 是否为实训周
   */
  getTrain:function(week){
    var train = wx.getStorageSync('train');
    var result = new Array();
    var a = 0;
    for (var i = 0; i < train.length; i++) {
      var train_week = train[i]['train_weekly'].split("-");
      if (train_week.length == 2) {
        for (var j = parseInt(train_week[0]); j <= parseInt(train_week[1]); j++) {
          result[a++] = j;
        }
      } else {
        result[a++] = parseInt(train_week[0]);
      }
      //判断
      for (var j = 0; j < result.length; j++) {
        if (week == result[j]) {
          this.setData({
            train_course_id:train[i]['course_id'],
          });
          return;
        }else if(i == train.length-1 && j == result.length-1){
          this.setData({
            train_course_id: 0,
          })
        }
      }
       var result = [];
       a = 0;
    }
  },
  /**
   * 实训周详情
   */
  train:function(e){
    var id = e.currentTarget.dataset.id;
    var train = wx.getStorageSync('train');
    for(var i=0;i<train.length;i++){
      if(id == train[i]['course_id']){
        var zhoushu = train[i]['train_weekly'];
        var name = train[i]['train_name'];
        var credit = train[i]['train_credit'];
        var train_class = train[i]['train_class'];
        var teacher = train[i]['train_teacher'];
        wx.showModal({
          title: name,
          showCancel: false,
          content: '周数：' + zhoushu + '\n\n老师：' + teacher + '\n\n类型：' + train_class + '\n\n学分：' + credit,
        })
      }
    }

  },
  /**
* 弹窗
*/
  updateCourse: function () {
    var that = this;
    var system_type = wx.getStorageSync('system_type');
    if (system_type == 1) {
      app.msg("请使用旧教务系统账号登录后更新课表")
      setTimeout(function(){
        wx.navigateTo({
          url: '/pages/bind/bind',
        })
      },2000)
      return;
    }
    that.setData({
      showModal: true,
      list_is_display:false
    });
    /**获取验证码 */
    wx.request({
      url: app.globalData.domain + 'login/getLoginInitData',
      success: function (res) {
        that.setData({
          cookie: res.data.data['cookie'],
          __VIEWSTATE: res.data.data['__VIEWSTATE'],
        })
        that.freshYzm();
      }
    });
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {

  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function (e) {
    this.setData({ 
      showModal: false 
    }) 
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function (e) {
    this.hideModal();
  },
  /** 获取验证码 */
  yzmInput: function (e) {
    this.setData({
      yzm: e.detail.value,
    })
  },
  /**
   * 对话框确认按钮点击事件
   */
  update: function (e) {
    var that = this;
    that.setData({ list_is_display: false })
    var user_id = wx.getStorageSync('user_id');
    if (!user_id) {
      app.msg("请先登录")
      return;
    }
    var time = (new Date()).getTime();
    if (wx.getStorageInfoSync('course_update_time') != "") {
      var update_time = wx.getStorageSync('course_update_time');
      var cha = time - update_time;
      var season = 120 - Math.floor(cha / 1000);
    } else {
      var season = 0;
    }
    if (season > 0) {
      app.msg('请在' + season + '秒后更新')
      return
    }

    wx.showLoading({
      title: '更新中',
    })
    wx.removeStorageSync('tmp_class')
    var user_id = wx.getStorageSync('user_id');
    var user_password = wx.getStorageSync('user_password');
    // var yzm = that.data.yzm;
    // var cookie = that.data.cookie;
    var str = app.globalData.key + user_id;
    var sign = md5.hexMD5(str);
    // if (yzm == "") {
    //   app.msg("请输入验证码")
    //   return
    // }
    app.httpRequest({
      url: 'course/updateV1',
      data: {
        stu_id: user_id,
        password: user_password,
        // encoded: encoded,
        // code: yzm,
        // cookie: cookie,
        // __VIEWSTATE: that.data.__VIEWSTATE,
        sign: sign
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.status == 1001) {
          app.httpRequest({
            url: 'course/getList',
            data: {
              stu_id: user_id,
              sign: sign
            },
            success: function (res) {
              that.hideModal()
              if (res.data.status == 1001) {
                wx.showToast({
                  title: '更新成功',
                })
                wx.setStorageSync('course_update_time', time);
                app.msg("更新成功", 'success')
                wx.setStorageSync('course', res.data.data.course);
                wx.setStorageSync('train', res.data.data.train_course);
                that.onLoad({animation:true});
              } else {
                app.msg(res.data.message)
              }
            },
          })
        } else {
          if (res.data.status == 1002) {
            that.freshYzm()
          } else if (res.data.status == 1006){
            that.setData({
              showModal:false
            })
          }
          app.msg(res.data.message)
        }
      }
    })
    // wx.request({
    //   url: app.globalData.domain + 'course/updateV1',
    //   data: {
    //     stu_id: user_id,
    //     password: user_password,
    //     // encoded: encoded,
    //     code: yzm,
    //     cookie: cookie,
    //     __VIEWSTATE: that.data.__VIEWSTATE,
    //     sign: sign
    //   },
    //   success: function (res) {
    //     wx.hideLoading();
    //     if (res.data.status == 1001) {
    //       wx.request({
    //         url: app.globalData.domain + 'course/getList',
    //         data: {
    //           stu_id: user_id,
    //           sign: sign
    //         },
    //         success: function (res) {
    //           that.hideModal()
    //           if (res.data.status == 1001) {
    //             wx.showToast({
    //               title: '更新成功',
    //             })
    //             app.msg("更新成功", 'success')
    //             wx.setStorageSync('course', res.data.data.course);
    //             wx.setStorageSync('train', res.data.data.train_course);
    //             that.onLoad();
    //           } else {
    //             app.msg(res.data.message)
    //           }
    //         },
    //       });
    //     } else if (res.data.status == 1003) {
    //       app.msg("验证码错误,如多次出现请尝试重新登录")
    //       that.freshYzm();
    //     } else {
    //       app.msg("更新失败")
    //     }
    //   }
    // })
  },
  /** 刷新验证码 */
  freshYzm: function () {
    var num = Math.ceil(Math.random() * 1000000);
    this.setData({
      yzmUrl: app.globalData.domain + 'login/getValidateImg?cookie=' + this.data.cookie + '&rand=' + num,
    })
  },
  /**输入验证码时，改变模态框高度 */
  inputFocus: function () {
    this.setData({
      input_focus: 1
    })
  },
  /** 不输入验证码时，恢复 */
  inputBlur: function () {
    this.setData({
      input_focus: 0
    })
  },
  //是否显示列表
  listDisplay:function(){
    var list = this.data.list_is_display;
    if(list == 0){
      this.setData({
        list_is_display:true,
      });
    }else if(list == 1){
      this.setData({
        list_is_display: false,
      })
    }
  },
  //选择设置背景图片
  selectImg:function(){
    var that = this;
    that.setData({list_is_display:false})
    wx.showActionSheet({
      itemList: ['相册选择','清空背景'],
      success: function (res) {
        if (res.tapIndex == 1){
          wx.setStorageSync('bg_img', '');
          that.onLoad({ animation: true });
        }else{
          wx.chooseImage({
            count: 1,
            sizeType: ['original'],
            sourceType: ['album'],
            success: function (e) {
              var tempFilePaths = e.tempFilePaths
              wx.setStorageSync('bg_img', tempFilePaths[0]);
              wx.showToast({
                title: '设置成功',
                icon: 'success'
              })
              that.onLoad({ animation: true });
            },
          })
        }
      },
    });
  },
  //设置透明度
  sliderchange: function (e) {
    var type = e.currentTarget.dataset.type;
    var data = e.detail.value;
    switch(type){
      case "frime": this.setData({ Kopacity: data }); wx.setStorageSync('Kopacity', data);break;
      case "course": this.setData({ Copacity: data }); wx.setStorageSync('Copacity', data);break;
      case "font": this.setData({ fontSize: data }); wx.setStorageSync('fontSize', data);break;
    };
  },
  //获取当天日期，课表显示高亮
  getTodayDate:function(){
    var date = new Date();
    var month = date.getMonth();
    var day = date.getDate();
    this.setData({
      todayMonth:month+1,
      todayDay:day
    });
  },
  getNotice:function(){
    var that = this;
    wx.request({
      url: app.globalData.domain + 'notice/getnotice',
      data:{
        page:'course'
      },
      success:function(res){
        if(res.data.status == 1001){
          that.setData({
          course_notice_display : res.data.data.display==1?true:false,
            course_notice: res.data.data.content
          })
        }else{
          that.setData({
            course_notice_display: false
          })
        }
      }
    })
  },
  hideMask:function(){
    this.setData({
      list_is_display: false
    })
  },

  getCourseList(){
    var user_id = wx.getStorageSync('user_id')
    var str = app.globalData.key + user_id;
    var sign = md5.hexMD5(str);
    app.httpRequest({
      url: 'course/getList',
      data: {
        stu_id: user_id,
        sign: sign,
      },
      success: function (res) {
        if (res.data.status == 1001) {
          wx.setStorageSync('course', res.data.data.course);
        } else {
          app.msg(res.data.message)
        }
      },
    })
  },

  closeAd:function(){
    var ad = this.data.ad
    ad.display = false
    this.setData({
      ad:ad
    })
    //记录时间，24小时内不再显示广告
    wx.setStorageSync('close_ad_time', (new Date()).getTime())
  },
  goAd:function(){
    var ad = this.data.ad
    var self = this
    ad.url = encodeURIComponent(ad.url)
    wx.navigateTo({
      url: '/pages/ad/ad?ad=' + JSON.stringify(this.data.ad),
      success:function(){
        ad.url = decodeURIComponent(ad.url)
        self.setData({
          ad: ad
        })
      }
    })
  },
  getAd:function(){
    var self = this
    var time = (new Date()).getTime()
    var close_ad_time = wx.getStorageSync('close_ad_time')
    var user_id = wx.getStorageSync('user_id')
    if (close_ad_time == '' || Math.floor((time - close_ad_time) / 1000) > 24 * 60 *60){
      wx.removeStorageSync('close_ad_time')
      app.httpRequest({
        url: "ad/getAd",
        needLogin: false,
        data:{
          user_id:user_id
        },
        success: function (res) {
          if (res.data.status == 0) {
            self.setData({
              ad: res.data.data
            })
          }
        }
      })
    }
  },
  toggleDelay() {
    var that = this;
    that.setData({
      toggleDelay: true
    })
    setTimeout(function () {
      that.setData({
        toggleDelay: false
      })
    }, 1000)
  },

  //处理中文标点符号，课程名称过长
  fiterCourseTitle:function(title,jieshu){
    title = title.replace(/\uff08/,'(')
    title = title.replace(/\uff09/,')')
    var length = 10
    if(title.length > length && jieshu < 4){
      return title.substr(0,length) + '...'
    }else{
      return title
    }
  },

  loginTips:function(){
    wx.navigateTo({
      url: '/pages/loginTips/loginTips',
    })
  },
  setClass:function(){
    wx.navigateTo({
      url: '/pages/setClass/setClass',
    })
  },
  setTime:function(){
    wx.navigateTo({
      url: '/pages/course/setTime/setTime',
    })
  },
  
  getConfigData:function(){
    var that = this
    var display_course_time = wx.getStorageSync('display_course_time')
    var area = wx.getStorageSync('user_area')
    if(display_course_time === '' || area === ''){
      var user_id = wx.getStorageSync('user_id');
      var str = app.globalData.key + user_id;
      var sign = md5.hexMD5(str);
      app.httpRequest({
        url: 'user/getareainfo',
        data: {
          sign: sign,
          stu_id: user_id
        },
        success: function (res) {
          if (res.data.status != 0) {
            app.msg(res.data.message)
            return
          }
          that.setData({
            area:res.data.data.area,
            display_course_time: res.data.data.display
          })
          wx.setStorageSync('display_course_time',res.data.data.display)
          wx.setStorageSync('user_area',res.data.data.area)
          that.displayTime()
        }
      })
    }else{
      that.setData({
        display_course_time: display_course_time,
        area: area
      })
      that.displayTime()
    }
  },

  //显示上课时间
  displayTime:function(){
    if(this.data.display_course_time == 0){
      return
    }
    if(this.data.area == '' || this.data.area == 0){
      app.msg("您未设置校区，无法显示上课时间")
      return
    }
    //北校区不需要处理
    if(this.data.area == 2){
      this.setData({
        course_time : TIMES[1]
      })
      return
    }
    //西校区要根据教学楼和是否连上处理
    //先判断今天是否有课，没课显示默认的
    var week = (new Date()).getDay()
    if(week == 0 || week == 6){
      this.setData({
        course_time : TIMES[0]
      })
    }
    var courses = wx.getStorageSync('course');
    var todayCourse = []
    var times = TIMES
    for(var i=0;i<courses.length;i++){
      if (typeof courses[i].course_weekly == "undefined"){
        continue
      }
      var tmp = this.ana_week(this.data.now_week, courses[i].course_weekly, courses[i].course_danshuang)
      if (tmp && courses[i]['course_week'] == week){
        var jie = courses[i]['course_section'].split("-")[0];
        var jieshu = courses[i]['course_section'].split("-")[1] - courses[i]['course_section'].split("-")[0] + 1;
        //格式化上课地点
        courses[i]['course_address'] = courses[i]['course_address'].replace('-', '_')//把-换成_
        var temp = courses[i]['course_address'].split('_');
        var address;
        if (temp.length > 1) {
          address = temp[0] + temp[1];
        } else {
          address = temp[0];
        }
        var course = {
          week: courses[i]['course_week'],
          jie: jie,
          jieshu: jieshu,
          name: courses[i]['course_name'],
          address: address,
          zhoushu: courses[i]['course_weekly'],
        };
        var tmpName = course.address.split("楼")
        if (tmpName.length == 1) {
          continue
        }
        var floor = tmpName[0]
        var floorNum = tmpName[1].substr(0, 1)
        if (course.jie == 1 && (floor == '思齐' || floor == '至善' || floor == '信达') && (floorNum >= 2 && floorNum <= 4)) {
          //1-2节连上
          times[0][0][1] = ""
          times[0][1][0] = ""
          times[0][1][1] = "09:50"
        } else if (course.jie == 3) {
          if (floor == '博雅' || floor == '德艺' || floor == '躬行') {
            //3-4节连上
            times[0][2][1] = ""
            times[0][3][0] = ""
            times[0][3][1] = "11:50"
          } else if ((floor == '思齐' || floor == '至善' || floor == '信达') && (floorNum >= 2 && floorNum <= 4)) {
            //课间只休息五分钟，提前五分钟放学
            times[0][2][1] = "11:05"
            times[0][3][0] = "11:10"
            times[0][3][1] = "11:55"
          }
        }
      }
    }
    this.setData({
      course_time: times[0]
    })
  },
})