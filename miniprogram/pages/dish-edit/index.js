const { call } = require('../../utils/api')
const colors = ['#f4d6b0','#cfe7d1','#f4c8c1','#d9d5ef','#cbe2ed','#f2e5a9']
Page({
  data: { id: '', name: '', emoji: '🍲', color: colors[0], emojis: ['🍲','🥘','🍜','🍛','🥗','🍗','🐟','🥩','🥟','🍳'], categories:['荤菜','素菜','汤羹','主食','快手菜','儿童菜'], categoryIndex:4, category:'快手菜', ingredients: [{ name: '', amount: '' }], tagsText: '', note: '', saving: false },
  async onLoad(options) {
    if (!options.id) return
    const dish = await call('getDish', { id: options.id })
    const category=dish.category||'快手菜';this.setData({ id: dish._id, name: dish.name, emoji: dish.emoji, color: dish.color,category,categoryIndex:this.data.categories.indexOf(category), ingredients: dish.ingredients.length ? dish.ingredients : [{name:'',amount:''}], tagsText: (dish.tags || []).join(', '), note: dish.note || '' })
  },
  setName(e) { this.setData({ name: e.detail.value }) }, setTags(e) { this.setData({ tagsText: e.detail.value }) }, setNote(e) { this.setData({ note: e.detail.value }) },
  setCategory(e){const categoryIndex=Number(e.detail.value);this.setData({categoryIndex,category:this.data.categories[categoryIndex]})},
  pickEmoji(e) { const i = this.data.emojis.indexOf(e.currentTarget.dataset.value); this.setData({ emoji: e.currentTarget.dataset.value, color: colors[i % colors.length] }) },
  addIngredient() { this.setData({ ingredients: [...this.data.ingredients, { name: '', amount: '' }] }) },
  removeIngredient(e) { const ingredients = this.data.ingredients.filter((_, i) => i !== e.currentTarget.dataset.index); this.setData({ ingredients: ingredients.length ? ingredients : [{name:'',amount:''}] }) },
  changeIngredient(e) { const { index, field } = e.currentTarget.dataset; const key = `ingredients[${index}].${field}`; this.setData({ [key]: e.detail.value }) },
  async save() {
    if (!this.data.name.trim()) return wx.showToast({ title: '请输入菜名', icon: 'none' })
    const ingredients = this.data.ingredients.filter(i => i.name.trim()).map(i => ({ name: i.name.trim(), amount: i.amount.trim() }))
    if (!ingredients.length) return wx.showToast({ title: '至少添加一种食材', icon: 'none' })
    this.setData({ saving: true })
    try {
      await call('saveDish', { dish: { _id: this.data.id || undefined, name: this.data.name.trim(), emoji: this.data.emoji, color: this.data.color, category:this.data.category, ingredients, tags: this.data.tagsText.split(/[,，]/).map(s => s.trim()).filter(Boolean), note: this.data.note.trim() } })
      wx.showToast({ title: '已保存' }); setTimeout(() => wx.navigateBack(), 500)
    } finally { this.setData({ saving: false }) }
  },
  remove() { wx.showModal({ title: '删除这道菜？', content: '历史菜单仍会保留菜名快照。', success: async r => { if (r.confirm) { await call('deleteDish', { id: this.data.id }); wx.navigateBack() } } }) }
})
