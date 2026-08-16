const pad = n => String(n).padStart(2, '0')
const formatDate = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const today = () => formatDate(new Date())
const friendly = value => {
  const d = new Date(`${value}T00:00:00`)
  const labels = ['周日','周一','周二','周三','周四','周五','周六']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${labels[d.getDay()]}`
}
module.exports = { today, friendly }
