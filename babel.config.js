const removeConsolePlugin = [];

if(process.env.VUE_APP_ENV === 'production') {
  removeConsolePlugin.push('transform-remove-console');
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: removeConsolePlugin
};

