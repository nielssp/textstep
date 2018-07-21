const ExtractTextPlugin = require("extract-text-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = {
    context: __dirname + "/src/assets/js",
    mode: "production",
    entry: {
        "apps/edit.app/main": "./editor",
        "apps/view.app/main": "./viewer",
        "apps/play.app/main": "./player",
        "apps/code.app/main": "./code-editor",
        "apps/control-panel.app/main": "./control-panel",
        "apps/files.app/main": "./files",
        "apps/terminal.app/main": "./terminal",
        "apps/build.app/main": "./build",
        "apps/test.app/main": "./test",
        "apps/workspace.app/main": "./workspace",
        "lib/libedit": "./libedit"
    },
    devtool: 'source-map',
    output: {
        path: __dirname + "/dist/",
        filename: "[name].js",
        sourceMapFilename: "[file].map"
    },
    module: {
        rules: [
          {
            test: /\.(jpe?g|png|gif|svg)$/i, 
            use: "file-loader?name=/assets/[name].[ext]"
          },
          {
            test: /\.css$/,
            use: [
              process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
              "css-loader"
            ]
          },
          {
            test: /\.scss$/,
            use: [
              process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
              "css-loader",
              "sass-loader"
            ]
          }
        ]
    },
    node: {
        fs: "empty"
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        })
    ]
};
