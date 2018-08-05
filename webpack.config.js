const ExtractTextPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function app(name) {
    var entry = {};
    entry['apps/' + name + '.app'] = './' + name;
    return {
        name: name + '.app',
        mode: 'development',
        entry: entry,
        context: __dirname + '/src/client',
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
                { test: /\.js$/, use: ['babel-loader'] }
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
                { test: /\.js$/, use: ['babel-loader'] }
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
                { test: /\.js$/, use: ['babel-loader'] }
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
    app('workspace'),
    app('files'),
    app('write'),
    app('code'),
    app('view'),
    app('play'),
    app('build'),
    app('control-panel'),
    app('terminal'),
    app('test'),
    lib('libedit'),
    lib('libtest'),
    theme('default'),
    icons('default')
];
