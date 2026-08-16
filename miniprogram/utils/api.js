const call = async (action, data = {}) => {
  wx.showNavigationBarLoading()
  try {
    const { result } = await wx.cloud.callFunction({ name: 'familyApi', data: { action, ...data } })
    if (!result || !result.ok) throw new Error((result && result.message) || '请求失败')
    return result.data
  } catch (error) {
    wx.showToast({ title: error.message || '网络开小差了', icon: 'none' })
    throw error
  } finally {
    wx.hideNavigationBarLoading()
  }
}
module.exports = { call }
