const SIDEBAR_CONST = require('./sidebar-const');

module.exports = {
  title: 'Today kiyeoneee Learned',
  description: 'What kiyeoneee learned everyday',
  base: '/TIL/',
  themeConfig: {
    search: true,
    sidebar: [
      {
        title: 'Books',
        children: [
          {
            title: 'Clean Code',
            path: '/book/clean-code',
            children: SIDEBAR_CONST.CleanCode
          }
        ]
      }
    ],
    nav: [
      { text: 'Github', link: 'https://github.com/kiyeoneee' }, 
      { text: 'Tech Blog', link: 'https://kyeoneee.tistory.com/' }
    ],
  },
  repo: 'kiyeoneee/TIL',
  repoLabel: 'GitHub',
  editLinks: true
}
