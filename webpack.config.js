var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
    context: __dirname + "/src/assets/js",
    mode: "production",
    entry: {
        editor: "./editor",
        viewer: "./viewer",
        player: "./player",
        "code-editor": "./code-editor",
        "control-panel": "./control-panel",
        files: "./files",
        terminal: "./terminal",
        build: "./build",
        test: "./test",
        workspace: "./workspace"
    },
    devtool: 'source-map',
    output: {
        path: __dirname + "/src/assets/",
        filename: "dist/[name].js",
        sourceMapFilename: "[file].map"
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            }
        ]
    },
    node: {
        fs: "empty"
    },
    plugins: [
        new ExtractTextPlugin({
            filename: "scss/extract/_[name].scss"
        })
    ]
};
