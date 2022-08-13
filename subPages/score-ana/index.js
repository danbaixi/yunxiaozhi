import * as echarts from '../components/ec-canvas/echarts'
const { getScoreAnalysis } = require('../../api/score')
const { openArticle } = require('../../utils/common')
const app = getApp();
var data = null
Page({
  /**
   * 页面的初始数据
   */
  data: {
    jidian:0,
    isNull:false,
    loading:true,
    articleUrl: "http://mp.weixin.qq.com/s?__biz=MzI1NTUwNDIzNQ==&mid=100001310&idx=1&sn=a50e8db5869db0bff232b2ba85cc28e5&chksm=6a35bc1a5d42350ca1230585d9eb81deb2231568b887392ebc2af69e26cad0019d08aad7af7a#rd",
    ecGPA: {
      onInit: initGPAChart
    },
    ecScore: {
      onInit: initScoreChart
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var windowWidth = 320;
    this.setData({
      winWidth: windowWidth,
    })
    this.getData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return app.share('您有一份期末成绩单待查收', 'score.png', this.route)
  },

  help: function () {
    openArticle(this.data.articleUrl)
  },

  //获取数据
  getData:function(){
    var that = this
    getScoreAnalysis().then((res) => {
      data = res.data
      data.loading = false
      data.isNull = false
      if (res.status == 0) {
        if (data.terms.length == 0) {
          data.isNull = true
        }
      }
      that.setData(data)
    })
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

  /** 画GPA曲线图 */
  drawGPA:function(){
    let _this = this
    let minMax = _this.getMinMax(_this.data.gpas)
    console.log(minMax)
    new wxCharts({
      canvasId: 'gpa',
      type: 'line',
      categories: _this.data.terms,
      animation: true,
      series: [{
        name: '平均绩点',
        data: _this.data.gpas,
        format: function (val, name) {
          return val;
        }
      }],
      xAxis: {
        gridColor: '#1380ff',
        disableGrid: false
      },
      yAxis: {
        disabled:true,
        min: minMax[0],
        max: minMax[1]
      },
      width: _this.data.winWidth,
      height: 100,
      dataLabel: true,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
  },
  //跳转事件
  goPage:function(e){
    let page = e.currentTarget.dataset.page
    if(!page){
      return
    }
    wx.navigateTo({
      url: page,
    })
  }
})
//求最大最小值
function getMinMax(arr) {
  let min = 5
  let max = 0
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i]
    }
    if (arr[i] < min) {
      min = arr[i]
    }
  }
  return [min, max]
}
function initGPAChart(canvas, width, height) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);

  let gpaMinMax = getMinMax(data.gpas)
  let topMinMax = getMinMax(data.tops)
  var option = {
    color: ["#1380ff","#ffa807"],
    legend: {
      data: ['绩点', '排名'],
      bottom: 0
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        animation: false
      }
    },
    axisPointer: {
      link: { xAxisIndex: 'all' }
    },
    grid: [{
      left: 40,
      right: 40,
      top: 30,
      height: '20%'
    }, {
      left: 40,
      right: 40,
      top: '60%',
      height: '20%'
    }],
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        },
        axisLabel: {
          interval: 0,
        }, 
        axisTick:{
          show:false
        },
        data: data.terms
      },
      {
        gridIndex: 1,
        show: false,
        type: 'category',
        boundaryGap: false,
        data: data.terms,
        position: 'top'
      }
    ],
    yAxis: [
      {
        type: 'value',
        splitLine: {
          show: false
        },
        min: gpaMinMax[0] - 0.4,
        max: gpaMinMax[1] + 0.4,
        show: false,
        type: 'value',
        },
      {
        gridIndex: 1,
        type: 'value',
        splitLine: {
          show: false
        },
        min: topMinMax[0] - 12,
        max: topMinMax[1] ,
        show: false,
        type: 'value',
        inverse: true
      }
    ],
    series: [{
      name:'绩点',
      type: 'line',
      data: data.gpas,
      label:{
        show:true
      }
    }, {
      name: '排名',
      type: 'line',
      data: data.tops,
      xAxisIndex: 1,
      yAxisIndex: 1,
      label: {
        show: true
      }
    }]
  };

  chart.setOption(option);
  return chart;
}

function initScoreChart(canvas, width, height){
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);
  let areaMinMax = getMinMax(data.area_value)
  let option = {
    color: ['#1380ff'],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: 30,
      right: 40,
      top:10,
      bottom:10,
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: data.area_name,
        axisTick: {
          alignWithLabel: true
        },
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        },
      }
    ],
    yAxis: [
      {
        type: 'value',
        splitLine: {
          show: false
        },
        show: false,
        min: areaMinMax[0],
        max: areaMinMax[1] + 16
      }
    ],
    series: [
      {
        name: '科目数',
        type: 'bar',
        barWidth: '40%',
        data: data.area_value,
        label: {
          show: true,
          position: 'top'
        }
      }
    ]
  }
  chart.setOption(option);
  return chart;
}