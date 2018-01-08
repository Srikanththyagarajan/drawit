module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'Drawit',
      externals: {
        react: 'React'
      }
    }
  },
  babel: {
    presets: ['flow']
  }
}
