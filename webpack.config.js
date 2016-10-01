module.exports = {
  entry: './index.js',
  output: {
    path: "./build",
    publicPath: "/assets/",
    filename: "bundle.js"
  },
  devServer: {
    contentBase: './assets/'
  }
}
