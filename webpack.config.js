const ExtractTextPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

const jsRule = {
    test: /\.js$/,
    loader: 'babel-loader',
    options: {
        presets: ['@babel/preset-env'],
    }
};

const tsRule = {
    test: /\.ts$/,
    use: 'ts-loader',
    exclude: /node_modules/,
};

function app(name) {
    var entry = {};
    entry['apps/' + name + '.app'] = './' + name;
    return {
        name: name + '.app',
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
                jsRule,
                tsRule
            ]
        },
        plugins: [
            new WriteFilePlugin(),
        ]
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
                jsRule,
                tsRule
            ]
        },
        plugins: [
            new WriteFilePlugin(),
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
                jsRule,
                tsRule
            ]
        },
        plugins: [
            new WriteFilePlugin(),
            new ExtractTextPlugin('icons.css'),
            new CopyWebpackPlugin([
                {from: '**', ignore: ['*.scss', '*.js', '*.css']},
            ], {})
        ]
    });
}

module.exports = (argv, env) => [
    Object.assign(app('workspace'), {
        plugins: [
            new WriteFilePlugin(),
            new CopyWebpackPlugin([
                {
                    from: 'assets/**',
                    to: './apps/workspace.app/'
                },
                {
                    from: 'manifest.json',
                    to: './manifest.json'
                },
            ]), 
            new HtmlWebpackPlugin({
                hash: true,
                template: './index.html',
                filename: './index.html',
                server: env.env && env.env.dev ? 'http://localhost:8082/dev.php' : 'api.php'
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
