import { defineStore } from 'pinia'

export interface SportTodo {
  id: string
  name: string
  done: boolean
}

export const useSportStore = defineStore('sport', {
  state: () => ({
    categories: ['慢跑', '健身力量', '瑜珈'],
    activeCategory: '慢跑',
    todosByCategory: {
      慢跑: [
        { id: 'r1', name: '間歇跑 5km', done: false },
        { id: 'r2', name: '晨間慢跑 3km', done: true },
      ],
      健身力量: [
        { id: 'g1', name: '深蹲 4x8 · 引體向上 3x6', done: false },
        { id: 'g2', name: '胸推 4x8 · 硬舉 3x5', done: true },
      ],
      瑜珈: [{ id: 'y1', name: '晨間伸展 20 分', done: false }],
    } as Record<string, SportTodo[]>,

    tabAddMode: false,
    tabAddText: '',

    modalOpen: false,
    form: { name: '', category: '', link: '' },
    touched: false,
  }),
  getters: {
    currentTodos(state): SportTodo[] {
      return state.todosByCategory[state.activeCategory] || []
    },
  },
  actions: {
    setCategory(cat: string) {
      this.activeCategory = cat
    },
    toggleTodo(id: string) {
      const t = this.currentTodos.find((x) => x.id === id)
      if (t) t.done = !t.done
    },
    deleteTodo(id: string) {
      this.todosByCategory[this.activeCategory] = this.currentTodos.filter((t) => t.id !== id)
    },
    deleteCategory(cat: string) {
      this.categories = this.categories.filter((c) => c !== cat)
      delete this.todosByCategory[cat]
      if (this.activeCategory === cat) this.activeCategory = this.categories[0] ?? ''
    },
    openTabAdd() {
      this.tabAddMode = true
      this.tabAddText = ''
    },
    cancelTabAdd() {
      this.tabAddMode = false
    },
    confirmTabAdd() {
      const name = this.tabAddText.trim()
      if (!name) return
      this.categories.push(name)
      this.todosByCategory[name] = []
      this.activeCategory = name
      this.tabAddMode = false
    },
    openSportModal() {
      this.form = { name: '', category: this.activeCategory, link: '' }
      this.touched = false
      this.modalOpen = true
    },
    closeSportModal() {
      this.modalOpen = false
    },
    saveSportForm() {
      if (!this.form.name.trim()) {
        this.touched = true
        return
      }
      const cat = this.form.category || this.activeCategory
      if (!this.todosByCategory[cat]) this.todosByCategory[cat] = []
      this.todosByCategory[cat].push({ id: 'sp' + Date.now(), name: this.form.name.trim(), done: false })
      this.modalOpen = false
    },
  },
})
