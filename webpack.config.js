const ExtractTextPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const jsRule = {
    test: /\.js$/,
    loader: 'babel-loader',
    options: {
        presets: ['@babel/preset-env'],
    }
};

function app(name) {
    var entry = {};
    entry['apps/' + name + '.app'] = './' + name;
    return {
        name: name + '.app',
        mode: 'development',
        entry: entry,
        context: __dirname + '/src/client',
        devtool: 'source-map',
        output: {
            path: __dirname + '/dist/',
            filename: '[name]/main.js'
        },
        node: {
            fs: 'empty'
        },
        module: {
            rules: [
                {
                    test: /\.s?css$/,
                    use: ['style-loader', 'css-loader?url=false', 'sass-loader']
                },
                jsRule
            ]
        }
    };
}

function lib(name) {
    return Object.assign(app(name), {
        name: name,
        entry: './' + name,
        output: {
            path: __dirname + '/dist/lib/',
            filename: name + '.js'
        }
    });
}

function theme(name) {
    return Object.assign(app(name), {
        name: name,
        entry: './theme.js',
        context: __dirname + '/src/themes/' + name,
        output: {
            path: __dirname + '/dist/themes/' + name + '/',
            filename: 'theme.js'
        },
        module: {
            rules: [
                {
                    test: /\.s?css$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: ['css-loader?url=false', 'sass-loader']
                    })
                },
                jsRule
            ]
        },
        plugins: [
            new ExtractTextPlugin('theme.css'),
            new CopyWebpackPlugin([
                {from: '**', ignore: ['*.scss', '*.js', '*.css']},
            ], {})
        ]
    });
}

function icons(name) {
    return Object.assign(app(name), {
        name: name,
        entry: './icons.js',
        context: __dirname + '/src/icons/' + name,
        output: {
            path: __dirname + '/dist/icons/' + name + '/',
            filename: 'icons.js'
        },
        module: {
            rules: [
                {
                    test: /\.s?css$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: ['css-loader?url=false', 'sass-loader']
                    })
                },
                jsRule
            ]
        },
        plugins: [
            new ExtractTextPlugin('icons.css'),
            new CopyWebpackPlugin([
                {from: '**', ignore: ['*.scss', '*.js', '*.css']},
            ], {})
        ]
    });
}

module.exports = [
    Object.assign(app('workspace'), {
        plugins: [
            new CopyWebpackPlugin([
                {from: 'assets/**', to: './apps/workspace.app/'},
            ], {}),
            new HtmlWebpackPlugin({
                hash: true,
                template: './index.html',
                filename: './index.html'
            }),
            new HtmlWebpackPlugin({
                hash: true,
                template: './index.html',
                filename: '../index.html'
            }),
        ]
    }),
    app('files'),
    app('write'),
    app('code'),
    app('view'),
    app('play'),
    app('build'),
    app('control-panel'),
    app('terminal'),
    app('test'),
    app('clock'),
    app('storage-client'),
    app('session-manager'),
    lib('libedit'),
    lib('libtest'),
    theme('default'),
    icons('default')
];
