import WeCropper from 'we-cropper/we-cropper.js'
var util = require('../../utils/util.js');
var md5 = require('../../utils/md5.js');
var uploadFn = require('../../utils/upload.js');
var delPictureFn = require('../../utils/delPicture.js');
const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = device.windowHeight - 50
var app = getApp();

Page({
  data: {
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
    this.wecropper.getCropperImage((src) => {
      if (src) {
        wx.showLoading({
          title: '正在上传',
        });
        var m = new Date().getMinutes().toString();
        if (m != wx.getStorageSync('m')) {
          wx.setStorageSync('m', m)
          var dir_name = 'user_imgs';
          //删除原来的头像
          var delImg = wx.getStorageSync('user_headImg');
          var returnDel = delPictureFn(delImg, dir_name);
          if (returnDel == delImg) {
            console.log('删除成功');
          }
          //上传图片
          //获取文件名
          var fileName = src.match(/(wxfile:\/\/)(.+)/);
          fileName = fileName[2];
          var user_id = wx.getStorageSync('user_id');
          uploadFn.upload(src, fileName, dir_name);
          var user_id = wx.getStorageSync('user_id');
          var str = app.globalData.key + user_id;
          var sign = md5.hexMD5(str);
          wx.request({
            url: app.globalData.domain + 'user/alterUserImg',
            data: {
              sign: sign,
              stu_id: user_id,
              img_url: fileName
            },
            success: function (res) {
              if (res.data.status == 1001) {
                app.msg("修改成功","success")
                setTimeout(function () {
                  //返回后刷新
                  var pages = getCurrentPages();
                  var currPage = pages[pages.length - 1];  //当前页面
                  var prevPage = pages[pages.length - 2]; //上上一个页面
                  //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
                  prevPage.setData({
                    isFresh: true
                  });
                  wx.navigateBack({})
                }, 1000);
              } else if (res.data.status == 1003) {
                app.msg("用户不存在")
              } else {
                app.msg("修改失败")
              }

            }
          })
        } else {
          app.msg("请勿重复提交")
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
    const { cropperOpt } = this.data
    if (option.src) {
      cropperOpt.src = option.src
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
  }
})
