const { resolve } = require("path");

const autoprefixer = require("autoprefixer");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const DelWebpackPlugin = require("del-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const OfflinePlugin = require("offline-plugin");
const ZipPlugin = require("zip-webpack-plugin");

module.exports = function(env = {}, argv = {}) {
  const isProd = !env.dev;
  const serve = !!env.dev;
  const version = env.version || "custom";

  return {
    mode: isProd ? "production" : "development",
    devtool: isProd ? false : "cheap-module-eval-source-map",
    devServer: !serve
      ? undefined
      : {
          contentBase: "./dist"
          // host: "0.0.0.0"
        },
    entry: "./src/app.jsx",
    output: {
      filename: "[name].[hash:5].js",
      chunkFilename: "[name].[chunkhash:5].js",
      path: resolve(__dirname, "./dist")
    },
    optimization: {
      minimize: isProd
    },
    performance: {
      hints: false
    },
    stats: {
      colors: true,
      logging: "warn",
      children: false,
      assets: false,
      modules: false
    },
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx", ".css", ".json"]
    },
    module: {
      rules: [
        {
          enforce: "pre",
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader?cacheDirectory",
            options: {
              presets: [require("@babel/preset-env")],
              plugins: [
                require("@babel/plugin-proposal-class-properties"),
                require("@babel/plugin-syntax-dynamic-import"),
                [require("@babel/plugin-transform-react-jsx"), { pragma: "h" }],
                [
                  require("babel-plugin-jsx-pragmatic"),
                  {
                    module: "preact",
                    export: "h",
                    import: "h"
                  }
                ]
              ]
            }
          }
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                modules: {
                  localIdentName: "[local]__[hash:base64:5]"
                },
                importLoaders: 1
              }
            },
            {
              loader: "postcss-loader",
              options: {
                ident: "postcss",
                plugins: [autoprefixer()]
              }
            }
          ]
        },
        {
          test: /\.svg$/,
          loader: "svg-inline-loader"
        },
        {
          test: /\.(woff2?|ttf|eot|jpe?g|png|gif|mp4|mov|ogg|webm)(\?.*)?$/i,
          loader: "file-loader"
        }
      ]
    },
    plugins: [
      new DelWebpackPlugin({
        info: false,
        exclude: ["jackets"]
      }),
      new CopyWebpackPlugin(["src/assets"], {
        ignore: [".DS_Store"]
      }),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(
          isProd ? "production" : "development"
        )
      }),
      new MiniCssExtractPlugin({
        filename: "[name].[contenthash:5].css",
        chunkFilename: "[id].[chunkhash:5].js"
      }),
      new HtmlWebpackPlugin({
        title: "DDR Card Draw",
        filename: "index.html",
        meta: {
          viewport: "width=device-width, initial-scale=1"
        }
      })
    ].concat(
      !isProd
        ? []
        : [
            new ZipPlugin({
              path: __dirname,
              filename: `DDRCardDraw-${version}.zip`,
              exclude: "__offline_serviceworker"
            }),
            new OfflinePlugin({
              ServiceWorker: {
                events: true
              },
              excludes: ["../*.zip", "jackets/*"]
            })
          ]
    )
  };
};
