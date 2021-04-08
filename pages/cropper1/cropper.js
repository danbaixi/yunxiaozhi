import WeCropper from 'we-cropper/we-cropper.js'
const {uploadFile,delFile} = require('../../utils/cos.js');

const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = device.windowHeight - 50
var app = getApp();

Page({
  data: {
    customBar: app.globalData.customBar,
    type:"course",
    cropperOpt: {
      id: 'cropper',
      width,
      height,
      scale: 2.5,
      zoom: 8,
      cut: {
        x: (width - 300) / 2,
        y: (height - 300) / 2,
        width: 300,
        height: 300
      }
    }
  },
  touchStart(e) {
    this.wecropper.touchStart(e)
  },
  touchMove(e) {
    this.wecropper.touchMove(e)
  },
  touchEnd(e) {
    this.wecropper.touchEnd(e)
  },
  getCropperImage() {
    let _this = this
    _this.wecropper.getCropperImage((src) => {
      if (src) {
        wx.showLoading({
          title: '正在上传',
        });
        var time = Math.floor(new Date().getTime() / 1000);
        if (time - wx.getStorageSync('upload_course_bg_time') >= 10) {
          wx.setStorageSync('upload_course_bg_time', time)
          var dir_name = 'user_imgs';
          if(_this.data.type == 'course'){
            dir_name = 'course_bg'
            //删除原来的文件
            var delImg = wx.getStorageSync('upload_course_bg');
            var returnDel = delFile(dir_name + '/' + delImg);
            if (returnDel) {
              console.log('删除成功');
            }
          }
          //上传图片
          //获取文件名
          let fileName = ''
          if (!app.globalData.isLocal){
            fileName = src.match(/(wxfile:\/\/)(.+)/);
            fileName = fileName[2];
          }else{
            let tmp = src.split(".")
            if(tmp.length == 4){
              fileName = tmp[tmp.length-2] + '.' + tmp[tmp.length-1]
            }
          }
          if(fileName == ''){
            app.msg("获取图片失败，请重试")
            return
          }
          let uploadResult = uploadFile(src, fileName, dir_name);
          if(uploadResult === false){
            app.msg("上传失败，请重试")
            return
          }
          app.msg("上传成功")
          setTimeout(()=>{
            var pages = getCurrentPages();
            var prevPage = pages[pages.length - 2];
            prevPage.setData({
              uploadFile: fileName
            })
            wx.navigateBack({})
          },1000)
        } else {
          app.msg("请勿频繁提交")
        } 
      } else {
        app.msg("获取图片地址失败")
      }
    })
  },
  uploadTap() {
    const self = this

    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        const src = res.tempFilePaths[0]
        //  获取裁剪图片资源后，给data添加src属性及其值
        self.wecropper.pushOrign(src)
      }
    })
  },
  onLoad(option) {
    const cropperOpt = this.data.cropperOpt
    let src = option.src
    let type = option.type
    this.setData({
      type:type
    })
    let cutWidth = 0,cutHeight = 0
    switch (type){
      case "course":
        cutWidth = Math.floor(device.windowWidth * 0.8)
        cutHeight = Math.floor(device.windowHeight * 0.8)
        break
      default:
      case "headImg":
        cutWidth = 300
        cutHeight = 300
        break
    }
    if(src){
      cropperOpt.src = src
      let cut = {
        x: (width - cutWidth) / 2,
        y: (height - cutHeight) / 2,
        width: cutWidth,
        height: cutHeight
      }
      cropperOpt.cut = cut

      new WeCropper(cropperOpt)
        .on('ready', (ctx) => {
        })
        .on('beforeImageLoad', (ctx) => {
          wx.showToast({
            title: '上传中',
            icon: 'loading',
            duration: 20000
          })
        })
        .on('imageLoad', (ctx) => {
          wx.hideToast()
        })
        .on('beforeDraw', (ctx, instance) => {
        })
        .updateCanvas()
    }
  },
  cancel:function(){
    wx.navigateBack({})
  }
})
