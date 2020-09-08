const sidebar = require('vuepress-auto-sidebar')

module.exports = {
  title: 'Today kiyeoneee Learned',
  description: 'What kiyeoneee learned everyday',
  base: '/TIL/',
  themeConfig: {
    "base": "/documents/",
    nav: [
      { text: 'Github', link: 'https://github.com/kiyeoneee' }, 
      { text: 'Tech Blog', link: 'https://kyeoneee.tistory.com/' }
    ],
    sidebar: sidebar.getSidebar()
  }
}
