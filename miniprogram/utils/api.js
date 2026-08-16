const call = async (action, data = {}) => {
  wx.showNavigationBarLoading()
  try {
    const { result } = await wx.cloud.callFunction({ name: 'familyApi', data: { action, ...data } })
    if (!result || !result.ok) throw new Error((result && result.message) || '请求失败')
    return result.data
  } catch (error) {
    const raw = String(error.errMsg || '')
    const message = error.errCode === -601034 || raw.includes('-601034')
      ? '云开发尚未开通，请在开发者工具中开通云开发并部署 familyApi'
      : (error.errCode === -501000 || raw.includes('-501000')
        ? '当前云环境找不到 familyApi，请重新上传并部署云函数'
        : (error.message || error.errMsg || '网络开小差了'))
    if (message.includes('云开发尚未开通') || message.includes('找不到 familyApi')) {
      wx.showModal({
        title: '需要开通云开发',
        content: message.includes('找不到') ? '请右键 cloudfunctions/familyApi，选择“上传并部署：云端安装依赖”，并确认部署到当前环境。' : '请点击开发者工具顶部“云开发”，创建云环境；然后上传并部署 familyApi 云函数。',
        showCancel: false
      })
    } else {
      wx.showToast({ title: message, icon: 'none' })
    }
    error.friendlyMessage = message
    throw error
  } finally {
    wx.hideNavigationBarLoading()
  }
}
module.exports = { call }
