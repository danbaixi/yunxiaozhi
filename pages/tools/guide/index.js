//获取应用实例
var app = getApp();
Page({
  data: {
    display:false,
    area:[
      {
        id:1,
        title:'西校区',
        img: 'west',
        color:'theme'
      },
      {
        id:2,
        title:'北校区',
        img: 'north',
        color:'yellow'
      },
    ],
    areaId:0,
    subkey:"5FSBZ-ZRAWW-JXRRH-O7TQF-2QDUH-2YFHU",//腾讯地图样式key
    fullscreen: false,//全屏
    latitude: 23.272355,//纬度
    longitude: 113.207476,//经度
    buildlData: [],
    windowHeight: "",
    windowWidth: "",
    isSelectedBuild: 0,
    isSelectedBuildType: 0,
    imgCDN: app.imgCDN,
    islocation: true,
    satellite:false,//卫星图
    scale:16,//缩放系数
    points:[],//所有坐标点
    preview:false,//点击显示图片
    preview_image:"",//预览图片
    preview_title:"标题",
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
  },
  onLoad: function () {
    var self = this;
    wx.getSystemInfo({
      success: function (res) {
        //获取当前设备宽度与高度，用于定位控键的位置
        self.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
        })
      }
    })
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      // console.log(res.target)
    }
    return {
      title: app.globalData.introduce.name + ' - 校园导览',
      path: '/pages/map/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  regionchange(e) {
    // 视野变化
    // console.log(e.type)
  },
  markertap(e) {
    // 选中其对应的框
    let data = this.data.buildlData[this.data.isSelectedBuildType].data[e.markerId - 1]
    this.setData({
      isSelectedBuild: e.markerId,
      latitude: data.latitude,
      longitude: data.longitude,
      preview:false,
      preview_image:data.image,
      preview_title:data.name,
      scale: 18
    })
  },
  navigateSearch() {
    wx.navigateTo({
      url: 'search'
    })
  },
  location: function () {
    var self = this
    wx.getLocation({
      type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标  
      success: function (res) {
        app.globalData.latitude = res.latitude;
        app.globalData.longitude = res.longitude;
        self.setData({
          longitude: res.longitude,
          latitude: res.latitude
        })
      }
    })
  },
  fullScreen: function (e) {
    this.setData({ fullscreen: !this.data.fullscreen })
  },
  changePage: function (event) {
    // console.log(event)
    this.setData({
      isSelectedBuildType: event.currentTarget.id,
      isSelectedBuild: 0
    });
    this.getPoints(event.currentTarget.id)
  },
  clickMarker:function(e){
    let data = this.data.buildlData[this.data.isSelectedBuildType].data[e.currentTarget.dataset.index]
    this.setData({
      latitude: data.latitude,
      longitude: data.longitude,
      scale: this.data.buildlData[this.data.isSelectedBuildType].scale,
      isSelectedBuild: e.currentTarget.dataset.index+1
    })
  },
  //获取所有坐标点
  getPoints:function(id){
    let result = []
    let data = this.data.buildlData[id].data
    for (let i=0;i<data.length;i++){
      result.push({
        latitude:data[i].latitude,
        longitude:data[i].longitude
      })
    }
    this.setData({
      points:result
    })
  },

  //读取地图数据
  loadData: function () {
    var self = this
    wx.showLoading({
      title: '正在加载...',
      mask: true
    })
    wx.request({
      url: self.getUrl(),
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading()
        if (res.data.map && res.data.map.length > 0) {
          let maps = res.data.map
          for (let i = 0; i < maps.length; i++) {
            for (let b = 0; b < maps[i].data.length; b++) {
              maps[i].data[b].id = b + 1;
            }
          }
          self.setData({
            buildlData:maps
          })
          self.getPoints(self.data.isSelectedBuildType)
        }
      }
    })
  },
  hideModal:function(){
    this.setData({
      preview:false
    })
  },
  //详情
  item:function(e){
    var index = e.currentTarget.dataset.index
    var item = this.data.buildlData[this.data.isSelectedBuildType].data[index]
    item.info = item.hasOwnProperty('info')?item.info:''
    item.imgs = item.hasOwnProperty('imgs')?item.imgs:[]
    var url = "/pages/tools/guide/item/item?name=" + item['name'] + '&info=' + encodeURIComponent(item.info) + '&imgs=' + encodeURIComponent(JSON.stringify(item.imgs))
    wx.navigateTo({
      url: url,
    })
  },
  //选择校区
  selectArea:function(e){
    let index = e.currentTarget.dataset.index
    if(index == 1){
      app.msg("正在完善数据，尽情期待")
      return
    }
    this.setData({
      areaId:this.data.area[index].id
    })
    this.loadData()
  },
  getUrl:function(){
    let url = 'http://danbaixi.utools.club/yxz_v1/resource/guide/'
    if (!app.globalData.isDebug){
      url = 'https://www.yunxiaozhi.cn/v1/resource/guide/'
    }
    if(this.data.areaId == 0){
      return false;
    }else if(this.data.areaId == 1){
      return url + 'west.json'
    }else if(this.data.areaId == 2){
      return url + 'north.json'
    }
  }
})