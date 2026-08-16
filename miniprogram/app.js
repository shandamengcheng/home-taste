App({
  globalData: { user: null, family: null },
  onLaunch() {
    if (!wx.cloud) {
      wx.showModal({ title: '版本过低', content: '请升级微信后重试', showCancel: false })
      return
    }
    wx.cloud.init({ traceUser: true })
  }
})
