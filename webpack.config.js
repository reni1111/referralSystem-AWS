module.exports = {
  mode: 'development', // production or development
  target: 'node',
  externals: [/^aws-sdk(\/.+)?$/], // important!!!
  devtool: 'source-map', // if needed
  optimization: { minimize: false }, // if needed
  // for TypeScript
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'your/path/to/tsconfig.json', // if needed
            // colors: true,
            // logInfoToStdOut: true,
            // logLevel: 'INFO',
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
     ],
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
}