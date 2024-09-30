const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'src/index.js'), // Ensure this points to the correct entry point
  output: {
    path: path.resolve(__dirname, 'dist'), // This should be 'dist', where Webpack outputs the bundle
    filename: 'bundle.js',
  },
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'), // Serve static files from 'public'
    },
    compress: true,
    port: 3000,
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/, // Matches both .js and .jsx files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'], // Add Babel presets directly in Webpack config
          },
        },
      },
      {
        test: /\.css$/, // For handling CSS files
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i, // For handling images
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
