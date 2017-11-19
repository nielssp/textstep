var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
    context: __dirname + "/src/assets/js",
    entry: {
      main: "./main",
      editor: "./editor",
      viewer: "./viewer",
      player: "./player",
      "code-editor": "./code-editor",
      "control-panel": "./control-panel",
      files: "./files",
      terminal: "./terminal",
      build: "./build",
      login: "./login",
      test: "./test",
      workspace: "./workspace"
    },
    devtool: 'source-map',
    output: {
        path: __dirname + "/src/assets/",
        filename: "dist/[name].js",
        sourceMapFilename: "[file].map"
    },
    node: {
      fs: "empty"
    },
    module: {
        loaders: [
            {
              test: /\.css$/,
              loader: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: "css-loader"
              })
            }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin("init"),
        new webpack.optimize.UglifyJsPlugin({minimize: true, sourceMap: true}),
        new ExtractTextPlugin({
          filename: "css/[name].css"
        })
    ]
};
