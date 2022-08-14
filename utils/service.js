import {
  getMiniConfig
} from '../pages/api/common'

export function updateConfig() {
  let time = parseInt((new Date()).getTime() / 1000)
  return new Promise((resolve) => {
    getMiniConfig({
      stu_id: wx.getStorageSync('user_id') || ''
    }).then((data) => {
      if (data.status == 0) {
        wx.setStorageSync('config_update_time', time)
        wx.setStorageSync('configs', data.data)
        resolve(true)
      }
      resolve(false)
    }).catch((err) => {
      console.error(`更新config失败,${err}`)
      resolve(false)
    })
  })
}