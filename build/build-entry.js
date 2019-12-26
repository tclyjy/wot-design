const components = require('../components.json')
const fs = require('fs')
const path = require('path')
const packageConfig = require('../package')

const firstLetterToUpperCase = name => (name[0].toUpperCase() + name.slice(1))

const outputPath = path.resolve(__dirname, '../src/index.js')
const componentKeys = Object.keys(components)
const camelCaseComponents = componentKeys.map(component => {
  let name = component
  if (name.indexOf('-') > -1) {
    name = name.split('-').map(word => {
      return firstLetterToUpperCase(word)
    }).join('')
  } else {
    name = firstLetterToUpperCase(name)
  }
  return name
})
const componentsImport = componentKeys.map((component, index) => {
  return `import ${camelCaseComponents[index]} from '../packages/${component}'`
}).join('\n')

const componentsList = camelCaseComponents.filter(component => {
  return ['MessageBox', 'Lazyload', 'Toast'].indexOf(component) === -1
})

const outputContent = `
/* Automatically generated by './build/build-entry.js' */

${componentsImport}
import locale from './locale'

const components = [
${componentsList.map(component => `  ${component}`).join(',\n')},
  MessageBox.wdMessageBox
]

const install = (Vue, config = {}) => {
  locale.use(config.locale)
  locale.i18n(config.i18n)

  components.forEach(component => {
    Vue.component(component.name, component)
  })

  Vue.prototype.$toast = Toast
  Vue.prototype.$messageBox = MessageBox.MessageBox

  Vue.use(Lazyload, config.lazyload)
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
  version: '${packageConfig.version}',
  install,
  locale: locale.use,
  i18n: locale.i18n,
${camelCaseComponents.map(component => `  ${component}`).join(',\n')}
}
`
fs.writeFileSync(outputPath, outputContent, 'utf-8')