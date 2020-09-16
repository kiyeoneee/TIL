const { getFilesOf } = require('./files_util.js');

module.exports = {
  title: 'Today kiyeoneee Learned',
  description: 'What kiyeoneee learned everyday',
  base: '/TIL/',
  themeConfig: {
    nav: [
      { text: 'Github', link: 'https://github.com/kiyeoneee' }, 
      { text: 'Tech Blog', link: 'https://kyeoneee.tistory.com/' }
    ],
    sideBar: [
    ]
  },
  repo: 'kiyeoneee/TIL',
  repoLabel: 'GitHub',
  editLinks: true,
  plugins: {
    "vuepress-plugin-auto-sidebar": {
      titleMap: {
        "book": "Books",
        "elasticsearch": "ElasticSearch",
        "etc": "ETC",
        "languages": "Languages",
        "linux": "Linux",
        "system": "System",
        "toy-project": "Toy Projects",
        misc: "Miscellany"
      }
    },
  }
}
