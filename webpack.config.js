const ExtractTextPlugin = require("extract-text-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = [
    {
        name: "workspace.app",
        mode: "production",
        entry: "./workspace",
        context: __dirname + "/src/assets/js",
        output: {
            path: __dirname + "/dist/apps/workspace.app/",
            filename: "main.js"
        }
    },
    {
        name: "libedit",
        mode: "production",
        entry: "./libedit",
        context: __dirname + "/src/assets/js",
        output: {
            path: __dirname + "/dist/lib/",
            filename: "libedit.js"
        },
        node: {
            fs: "empty"
        },
        module: {
            rules: [
                {test: /\.css$/, use: ['style-loader', 'css-loader']}
            ]
        }
    },
    {
        name: "edit.appp",
        mode: "production",
        entry: "./editor",
        context: __dirname + "/src/assets/js",
        output: {
            path: __dirname + "/dist/edit.app/",
            filename: "main.js"
        }
    }
];
/*
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
        "lib/libedit": "./libedit",
        "share/theme/theme": "../scss/main.scss"
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
                test: /\.(css|scss)/,
                use: ExtractTextPlugin.extract(['css-loader', 'sass-loader'])
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
        }),
        new ExtractTextPlugin({
            filename: '[name].css',
        })
    ]
};*/
