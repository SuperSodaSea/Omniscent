import path from 'path';
import url from 'url';

import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';


const __dirname = path.dirname(url.fileURLToPath(import.meta.url));


export default {
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html',
            inject: false,
        }),
        new HtmlWebpackPlugin({
            template: './public/Omniscent.html',
            filename: 'Omniscent.html',
            inject: false,
        }),
    ],
    mode: 'production',
    entry: {
        Omniscent: './src/index.js',
    },
    output: {
        library: 'Omniscent',
        path: path.join(__dirname, 'dist'),
        filename: 'scripts/Omniscent/[name].js',
        chunkFilename: 'scripts/Omniscent/[contenthash].js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
        ],
    },
    performance: {
        maxAssetSize: 2 ** 20,
        maxEntrypointSize: 2 ** 20,
    },
    devtool: 'source-map',
};
