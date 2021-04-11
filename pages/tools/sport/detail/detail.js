const app = getApp()
const util = require('../../../../utils/util')
const { getSportDetail } = require('../../../api/other')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        weeks: ['MON','TUE','WEB','THU','FRI','SAT','SUN'],
        year: 2020,
        month: 1,
        days:[],
        thisMonth:true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let date = new Date()
        this.setData({
            year: date.getFullYear(),
            month: this.getMonth(date.getMonth() + 1),
            day: date.getDate()
        })
        this.getDays()
        this.getData()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return app.share('点击查询你的运动情况')
    },

    getDays:function(){
        let len = util.getThisMonthDays(this.data.year,this.data.month)
        let dayStart = util.getFirstDayOfWeek(this.data.year,this.data.month)
        let days = new Array(len+dayStart-1).fill(0)
        let num = 1
        let fillCount = 7 - ((len + dayStart) % 7) + 1
        for(let i=dayStart-1;i<days.length;i++){
            if(num < 10){
                days[i] = '0' + num
            }else{
                days[i] = '' + num
            }
            num++
        }
        for(let i=1;i<=fillCount;i++){
            days.push(0)
        }
        this.setData({
            days:days,
            lineCount: Math.ceil(days.length / 7)
        })
    },
    
    getMonth:function(month){
        return month > 9 ? month : '0' + month
    },

    //获取数据
    getData:function(){
        let _this = this
        wx.showLoading({
          title: '加载中',
        })
        getSportDetail({
            year: _this.data.year,
            month: _this.data.month
        }).then((res) => {
            wx.hideLoading()
            if(res.status == 0){
                _this.setData(res.data)
            }
        })
    },

    setMonth:function(e){
        let year = this.data.year
        let month = this.data.month
        let type = e.currentTarget.dataset.type
        if(type == 'next'){
          month++
        }else{
          month--
        }
        if(month > 12){
          year++
          month = 1
        }
        if(month < 1){
          year--
          month = 12
        }
        month = this.getMonth(month)
        this.setData({
          year:year,
          month:month,
          list:[]
        })
        let thisMonth = false
        if(year == new Date().getFullYear && month == new Date().getMonth + 1){
            thisMonth = true
        }
        this.getDays()
        this.getData()
        this.setData({
          thisMonth: thisMonth
        })
    }
})