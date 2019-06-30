var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    weekly: ['日','一', '二', '三', '四', '五', '六'],
    colors: [
      "#9932CC",
      "#4169E1",
      "#3CB371",
      "#FFD700",
      "#FF7F50",
      "#20B2AA",
      "#FF1493",
      "#00FFFF",
      "#800000",
    ],
    jilu:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.request({
      url: app.globalData.domain + 'calendar/getList',
      success: function (res) {
        var data = res.data.data.calendar;
        var semester = res.data.data.semester;
        for (var i = 0; i < data.length; i++) {
          var stemp = data[i].startDate.split('-');
          var start = new Array(parseInt(stemp[0]), parseInt(stemp[1]), parseInt(stemp[2]));
          var etemp = data[i].endDate.split('-');
          var end = new Array(parseInt(etemp[0]), parseInt(etemp[1]), parseInt(etemp[2]));
          var calendar = {
            semester:data[i].semester,
            title: data[i].title,
            start: start,
            end: end,
          }
          that.setData({ jilu: that.data.jilu.concat(calendar) });
        }
        //获取当前日期
        var date = new Date();
        var now_year = date.getFullYear();
        var now_month = date.getMonth() + 1;
        that.setData({
          now_year: now_year,
          now_month: now_month,
          semester:semester,
        })
        that.getDayData(now_year, now_month);
        that.zhouci();
      }
    })

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '最新出炉的白云校历',
      path: 'pages/tools/calendar/calendar',
      imageUrl: 'http://yunxiaozhi-1251388077.cosgz.myqcloud.com/wx_share/calendar.jpg'
    };
  },
  // 计算每月有多少天
  getThisMonthDays(year, month) {
    return new Date(year, month, 0).getDate();
  },
  // 计算每月第一天是星期几
  getFirstDayOfWeek(year, month) {
    return new Date(Date.UTC(year, month - 1, 1)).getDay();
  },
  // 计算在每月第一天在当月第一周之前的空余的天数
  calculateEmptyGrids(year, month) {
    const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
    let empytGrids = [];
    if (firstDayOfWeek > 0) {
      for (let i = 0; i < firstDayOfWeek; i++) {
        empytGrids.push(i);
      }
      this.setData({
        empytGrids:empytGrids.length
      });
    } else {
      this.setData({
        empytGrids: 0
      });
    }
  },
  getDayData: function (year, month){
    var that = this;
    //获取上个月的空日期
    that.calculateEmptyGrids(year, month);
    var day = [];
    var shijian = [];//记录该月一天对应是否有事件
    var shijianOfThisMonth = [];
    var dayNum = new Date(year, month, 0).getDate();
    var firstDay = new Date(Date.UTC(year, month - 1, 1)).getDay();
    var hangshu = 5;
    if(firstDay == 6 || firstDay>=5 && dayNum==31){
      hangshu = 6;
    }
    var nextMonth = hangshu * 7 - dayNum - that.data.empytGrids;
    for(var i=0;i<dayNum;i++){
      day.push(i+1);
      //设置默认每一天都没有事件
      shijian.push(false);
    }
    for (var i=0;i<nextMonth;i++){
      day.push(i+1);
    }
    that.setData({
      hangshu: hangshu,//设置行数
      day: day,//日期
      shijian:shijian,
      dayNum:dayNum//该月有多少天
    });
    //判断该月每一天是否有事件,有的话设置为true,默认为false
    var jilu = that.data.jilu;
    var shijian_num = 0; //事件的下标，用于显示不同颜色
    for(var i=0;i<jilu.length;i++){
      //存储该月事件
      if (jilu[i]['start'][0] == year && jilu[i]['start'][1] == month){
        shijianOfThisMonth.push(jilu[i]);
      }
      //判断是否有事件
      if (jilu[i]['start'][0] == year && jilu[i]['start'][1] == month){
        var startOfDay = jilu[i]['start'][2] -1;
        var numOfDay = jilu[i]['end'][2] - jilu[i]['start'][2] + 1;
        for(var j=0;j<numOfDay;j++){
          var num = startOfDay + j;
          var tempArray = [];//临时数组，存储同一天时间，有n个事件
          if (that.data.shijian[num]!=false){
            tempArray.push(that.data.shijian[num]);
          }
          tempArray.push(that.data.colors[shijian_num]);
          var temp = "shijian[" + num + "]";
          that.setData({
            [temp]: tempArray,
          });
        }
        shijian_num++;
      }
    }
    //解决同一天多个事件的问题，将不是false的颜色组成新的数组，给下面的时间名称遍历
    var colorOfShijian = [];
    for (var i = 0; i <this.data.shijian.length;i++){
      if (this.data.shijian[i] != false){
        for(var j=0;j<this.data.shijian[i].length;j++){
          if(i==0){
            colorOfShijian.push(this.data.shijian[i][j]);
          }else if (this.data.shijian[i][j] != this.data.shijian[i - 1][this.data.shijian[i-1].length-1]) {
            colorOfShijian.push(this.data.shijian[i][j]);
          }
        }
      }
    }
    //设置数据
    this.setData({
      //该月的全部事件
      shijianOfThisMonth: shijianOfThisMonth,
      //颜色组成新的数组
      colorOfShijian:colorOfShijian
    })
  },
  //上个月、下个月的实现
  alterMonth:function(e){
    var now_year = this.data.now_year;
    var now_month = this.data.now_month;
    if(e.target.dataset.set == 'add'){
      if (now_month == 12) {
        this.setData({
          now_year: now_year + 1,
          now_month: 1,
        });
      } else {
        this.setData({
          now_month: now_month + 1,
        });
      }
    } else if (e.target.dataset.set  == 'reduce'){
      if (now_month == 1) {
        this.setData({
          now_year: now_year - 1,
          now_month: 12,
        });
      } else {
        this.setData({
          now_month: now_month - 1,
        });
      }
    }
    this.getDayData(this.data.now_year, this.data.now_month);
    this.zhouci();
  },
  /**
   * 计算出周次
   */
  zhouci:function(){
    var that = this;
    var now_year = that.data.now_year;
    var now_month = that.data.now_month;
    var week = new Array();
    var semester = that.data.semester;
    var calendar = that.data.jilu;
    var start = new Array(), end = new Array;
    for(var a=0;a<semester.length;a++){
      for(var b=0;b<calendar.length;b++){
        if(calendar[b].semester == semester[a].semester){
          if (calendar[b].title == '正式上课'){
            start[a] = calendar[b].start;
          } else if (calendar[b].title == '考试周'){
            end[a] = calendar[b].end;
          }
        }
      }
    }
    //判断当月是属于哪个学期的
    var xq_num = -1;
    for (var c=0; c < start.length; c++){
      var d1 = that.strToDate(start[c][0] + '-' + start[c][1] + '-' + start[c][2]);
      var d2 = that.strToDate(end[c][0] + '-' + end[c][1] + '-' + end[c][2]);
      var d3 = new Date(now_year,now_month,0);
      var d4 = new Date(now_year, now_month-1, 1);
      var diff1 = parseInt((d3 - d1) / 1000 / 60 / 60 / 24);
      var diff2 = parseInt((d2 - d4) / 1000 / 60 / 60 / 24);
      if (diff1 >= 0 && diff2>=0){
        xq_num = c;
        break;
      }
    }
    if(xq_num<0){
      var hangshu = that.data.hangshu;
      for (var i = 0; i < hangshu; i++) {
        week.push('假期');
      }
    }else{
      var startTime = start[xq_num];
      var endTime = end[xq_num];
      var d1 = that.strToDate(startTime[0] + '-' + startTime[1] + '-' + startTime[2]);
      var d2 = that.strToDate(endTime[0] + '-' + endTime[1] + '-' + endTime[2]);
      var d3 = that.strToDate(now_year + '-' + now_month + '-1');
      var diff1 = parseInt((d3 - d1) / 1000 / 60 / 60 / 24);
      var diff2 = parseInt((d2 - d3) / 1000 / 60 / 60 / 24);
      if (diff1<0 && diff2<0) {
        var hangshu = that.data.hangshu;
        for (var i = 0; i < hangshu; i++) {
          week.push('假期');
        }
      } else {
        //获取当月的第一天是星期几
        var xingqiji = that.getFirstDayOfWeek(now_year, now_month);
        //获取第一个星期五的日期
        var firstSat = 6 - xingqiji;
        if (now_month == startTime[1]) {
          var tmp = 1;
          for (var i = 0; i < that.data.hangshu; i++) {
            var SatDate = firstSat + i * 7;
            if (SatDate < startTime[2]) {
              week.push('假期');
            } else {
              week.push('第' + tmp + '周');
              tmp++;
            }
          }
        } else {
          var date1 = now_year + '-' + now_month + '-' + firstSat;
          var date2 = startTime[0] + '-' + startTime[1] + '-' + startTime[2];
          var oDate1 = new Date(now_year,now_month,firstSat);
          var oDate2 = new Date(startTime[0], startTime[1], startTime[2]);
          console.log(oDate1);
          console.log(oDate2);
          var a = parseInt(oDate1 - oDate2);
          var iDays = parseInt(oDate1 - oDate2) / 1000 / 60 / 60 / 24;
          var firstWeek = Math.ceil(iDays / 7);
          if (now_month == endTime[1]) {
            for (var i = 0; i < that.data.hangshu; i++) {
              var SatDate = firstSat + i * 7;
              if (SatDate < endTime[2] + 7) {
                week.push('第' + firstWeek + '周');
                firstWeek++;
              } else {
                week.push('假期');
              }
            }
          } else {
            for (var i = 0; i < that.data.hangshu; i++) {
              week.push('第' + firstWeek + '周');
              firstWeek++;
            }
          }

        }
      }
    }
    that.setData({
      weekData:week,
    })
  },
  //计算两个日期的天数
  dateDiff: function (date1, date2) {
    var aDate, oDate1, oDate2, iDays;
    aDate = date1.split("-");
    oDate1 = this.strToDate(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);
    aDate = date2.split("-");
    oDate2 = this.strToDate(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);
    iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24);
    return iDays;
  },
  strToDate: function (dateObj) {
    var dateObj = dateObj.replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '').replace(/(-)/g, '/')
    var dateObj = dateObj.slice(0, dateObj.indexOf("."))
    return new Date(dateObj)
  }
})