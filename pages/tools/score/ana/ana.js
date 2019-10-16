var md5 = require('../../../../utils/md5.js');
var util = require('../../../../utils/util.js');
var wxCharts = require('../../../../utils/wxcharts.js');
var lineChart = null;
var pieChart = null;
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    jidian:0,
    isNull:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    var that = this;
    var user_id = wx.getStorageSync('user_id');
    var str = app.globalData.key + user_id;
    var sign = md5.hexMD5(str);
    wx.request({
      url: app.globalData.domain + 'score/getscoreanalysis',
      data: {
        stu_id: user_id,
        sign:sign
      },
      success: function (res) {
        if(res.data.status == 1001){
          var gpa = res.data.data.gpa;
          that.setData({ gpa: gpa });
          var avg = res.data.data.avg;
          var term = res.data.data.term;
          var min_avg = res.data.data.min;
          var area_name = res.data.data.area_name;
          var area_value = res.data.data.area_value;
          if(term.length<=0){
            return;
          }
          /** 画曲线图 */
          new wxCharts({
            canvasId: 'lineCanvas',
            type: 'line',
            categories: term,
            animation: true,
            series: [{
              name: '平均分',
              data: avg,
              format: function (val, name) {
                return val + '分';
              }
            }],
            xAxis: {
              disableGrid: true
            },
            yAxis: {
              title: '平均分',
              format: function (val) {
                return val.toFixed(2);
              },
              min: min_avg - 10,
              max: 100
            },
            width: windowWidth,
            height: 200,
            dataLabel: true,
            dataPointShape: true,
            extra: {
              lineStyle: 'curve'
            }
          });
          //柱形图
          new wxCharts({
            canvasId: 'columnCanvas',
            type: 'column',
            categories: area_name,
            series: [{
              name: '科目数',
              data: area_value
            }],
            yAxis: {
              format: function (val) {
                return val;
              }
            },
            width: windowWidth,
            height: 240
          });
        }else{
          that.setData({
            isNull:true,
          })
        }
     
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share('您有一份期末成绩单待查收', 'score.png', this.route)
  },
  /** 曲线图点击事件 */
  lineTouchHandler: function (e) {
    lineChart.showToolTip(e, {
      // background: '#7cb5ec',
      format: function (item, category) {
        return category + ' ' + item.name + ':' + item.data
      }
    });
  }, 
})