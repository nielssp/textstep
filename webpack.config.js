var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
    context: __dirname + "/src/assets/js",
    entry: {
      main: "./main",
      editor: "./editor",
      "code-editor": "./code-editor",
      files: "./files"
    },
    output: {
        path: __dirname + "/src/assets/",
        filename: "dist/[name].js"
    },
    node: {
      fs: "empty"
    },
    module: {
        loaders: [
            {
              test: /\.css$/,
              loader: ExtractTextPlugin.extract({
                notExtractLoader: "style-loader",
                loader: "css-loader"
              })
            }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin("init"),
        new webpack.optimize.UglifyJsPlugin({minimize: true}),
        new ExtractTextPlugin({
          filename: "css/[name].css"
        })
    ]
};
