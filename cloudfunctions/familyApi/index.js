const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

const ok = data => ({ ok: true, data })
const fail = message => ({ ok: false, message })
const now = () => db.serverDate()

async function member(openid) {
  const res = await db.collection('members').where({ _openid: openid }).limit(1).get()
  return res.data[0] || null
}
async function familyOf(openid) {
  const m = await member(openid)
  if (!m) return { member: null, family: null }
  const f = await db.collection('families').doc(m.familyId).get().catch(() => null)
  return { member: m, family: f && f.data }
}
function code() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}
async function uniqueCode() {
  for (let i = 0; i < 8; i++) {
    const inviteCode = code()
    const r = await db.collection('families').where({ inviteCode }).count()
    if (!r.total) return inviteCode
  }
  throw new Error('邀请码生成失败，请重试')
}
function cleanDish(dish) {
  return {
    name: String(dish.name || '').trim().slice(0, 30),
    emoji: String(dish.emoji || '🍲').slice(0, 4),
    color: /^#[0-9a-f]{6}$/i.test(dish.color || '') ? dish.color : '#f4d6b0',
    ingredients: Array.isArray(dish.ingredients) ? dish.ingredients.slice(0, 30).map(i => ({ name: String(i.name || '').trim().slice(0, 30), amount: String(i.amount || '').trim().slice(0, 30) })).filter(i => i.name) : [],
    tags: Array.isArray(dish.tags) ? dish.tags.slice(0, 8).map(t => String(t).trim().slice(0, 12)).filter(Boolean) : [],
    note: String(dish.note || '').trim().slice(0, 200)
  }
}
async function seedDishes(familyId, openid) {
  const samples = [
    { name:'番茄炒蛋',emoji:'🍳',color:'#f4c8c1',ingredients:[{name:'番茄',amount:'2个'},{name:'鸡蛋',amount:'3个'},{name:'小葱',amount:'1根'}],tags:['快手菜','家常'] },
    { name:'可乐鸡翅',emoji:'🍗',color:'#f4d6b0',ingredients:[{name:'鸡翅中',amount:'10个'},{name:'可乐',amount:'1听'},{name:'生姜',amount:'3片'}],tags:['下饭','肉菜'] },
    { name:'清炒时蔬',emoji:'🥗',color:'#cfe7d1',ingredients:[{name:'当季青菜',amount:'1把'},{name:'蒜',amount:'3瓣'}],tags:['素菜','清淡'] }
  ]
  for (const dish of samples) await db.collection('dishes').add({ data:{...dish,note:'',familyId,createdBy:openid,createdAt:now(),updatedAt:now()} })
}

exports.main = async event => {
  const { OPENID } = cloud.getWXContext()
  const action = event.action
  try {
    if (action === 'createFamily') {
      const existing = await member(OPENID)
      if (existing) return fail('你已经加入了一个家庭')
      const inviteCode = await uniqueCode()
      const add = await db.collection('families').add({ data:{ name:String(event.name || '我们的家').trim().slice(0,20), inviteCode, ownerOpenid:OPENID, createdAt:now() } })
      await db.collection('members').add({ data:{ _openid:OPENID, familyId:add._id, displayName:'', joinedAt:now() } })
      await seedDishes(add._id, OPENID)
      return ok({ familyId:add._id, inviteCode })
    }
    if (action === 'joinFamily') {
      if (await member(OPENID)) return fail('你已经加入了一个家庭')
      const f = await db.collection('families').where({ inviteCode:String(event.inviteCode || '').toUpperCase() }).limit(1).get()
      if (!f.data.length) return fail('邀请码不存在')
      const count = await db.collection('members').where({ familyId:f.data[0]._id }).count()
      if (count.total >= 2) return fail('这个家庭已经有两位成员')
      await db.collection('members').add({ data:{ _openid:OPENID, familyId:f.data[0]._id, displayName:'', joinedAt:now() } })
      return ok({ familyId:f.data[0]._id })
    }
    const context = await familyOf(OPENID)
    const family = context.family
    if (action === 'bootstrap') {
      if (!family) return ok({ family:null,dishes:[] })
      const dishes = await db.collection('dishes').where({ familyId:family._id, deleted:_.neq(true) }).orderBy('updatedAt','desc').get()
      return ok({ family, dishes:dishes.data })
    }
    if (action === 'getProfile') {
      if (!family) return ok({ family:null,members:[],openid:OPENID })
      const members = await db.collection('members').where({familyId:family._id}).orderBy('joinedAt','asc').get()
      return ok({family,members:members.data,openid:OPENID})
    }
    if (!family) return fail('请先创建或加入家庭')
    if (action === 'getDish') {
      const r=await db.collection('dishes').doc(event.id).get(); if(r.data.familyId!==family._id) return fail('无权访问'); return ok(r.data)
    }
    if (action === 'saveDish') {
      const dish=cleanDish(event.dish || {}); if(!dish.name || !dish.ingredients.length) return fail('菜名和食材不能为空')
      if(event.dish && event.dish._id){const old=await db.collection('dishes').doc(event.dish._id).get();if(old.data.familyId!==family._id)return fail('无权修改');await db.collection('dishes').doc(event.dish._id).update({data:{...dish,updatedAt:now(),deleted:false}});return ok({_id:event.dish._id})}
      const r=await db.collection('dishes').add({data:{...dish,familyId:family._id,createdBy:OPENID,createdAt:now(),updatedAt:now()}});return ok({_id:r._id})
    }
    if (action === 'deleteDish') {
      const old=await db.collection('dishes').doc(event.id).get();if(old.data.familyId!==family._id)return fail('无权删除');await db.collection('dishes').doc(event.id).update({data:{deleted:true,updatedAt:now()}});return ok({})
    }
    if (action === 'getPlan') {
      const [dishes,plans]=await Promise.all([db.collection('dishes').where({familyId:family._id,deleted:_.neq(true)}).orderBy('updatedAt','desc').get(),db.collection('plans').where({familyId:family._id,date:event.date}).limit(1).get()]);return ok({family,dishes:dishes.data,plan:plans.data[0]||null})
    }
    if (action === 'savePlan') {
      const ids=[...new Set(Array.isArray(event.dishIds)?event.dishIds:[])].slice(0,20); const valid=await db.collection('dishes').where({_id:_.in(ids.length?ids:['__none__']),familyId:family._id,deleted:_.neq(true)}).get();const dishIds=valid.data.map(d=>d._id);const snapshots=valid.data.map(d=>({_id:d._id,name:d.name,emoji:d.emoji,ingredients:d.ingredients}));const existing=await db.collection('plans').where({familyId:family._id,date:event.date}).limit(1).get();const data={dishIds,dishSnapshots:snapshots,updatedBy:OPENID,updatedAt:now()};if(existing.data.length)await db.collection('plans').doc(existing.data[0]._id).update({data});else await db.collection('plans').add({data:{...data,familyId:family._id,date:event.date,createdAt:now()}});return ok({})
    }
    if (action === 'getShopping') {
      const plans=await db.collection('plans').where({familyId:family._id,date:event.date}).limit(1).get();const plan=plans.data[0];if(!plan)return ok({family,dishNames:[],items:[]});const state=await db.collection('shoppingStates').where({familyId:family._id,date:event.date}).limit(1).get();const checked=new Set(state.data.length?state.data[0].checkedNames:[]);const grouped={};(plan.dishSnapshots||[]).forEach(d=>(d.ingredients||[]).forEach(i=>{if(!grouped[i.name])grouped[i.name]=[];grouped[i.name].push(`${i.amount||'适量'}（${d.name}）`)}));const items=Object.keys(grouped).map(name=>({name,detail:grouped[name].join(' + '),checked:checked.has(name)}));return ok({family,dishNames:(plan.dishSnapshots||[]).map(d=>d.name),items})
    }
    if (action === 'saveShopping') {
      const checkedNames=[...new Set(Array.isArray(event.checkedNames)?event.checkedNames.map(String):[])].slice(0,100);const existing=await db.collection('shoppingStates').where({familyId:family._id,date:event.date}).limit(1).get();const data={checkedNames,updatedBy:OPENID,updatedAt:now()};if(existing.data.length)await db.collection('shoppingStates').doc(existing.data[0]._id).update({data});else await db.collection('shoppingStates').add({data:{...data,familyId:family._id,date:event.date}});return ok({})
    }
    if (action === 'leaveFamily') {
      const members=await db.collection('members').where({familyId:family._id}).get();if(family.ownerOpenid===OPENID&&members.data.length>1)return fail('创建者暂不能退出，请先让另一位成员创建新家庭');await db.collection('members').doc(context.member._id).remove();return ok({})
    }
    return fail('未知操作')
  } catch (error) {
    console.error(action,error)
    return fail(error.message || '服务暂时不可用')
  }
}
