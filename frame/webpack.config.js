const webpack            = require('webpack');
const OpenBrowserPlugin  = require('open-browser-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path               = require("path");
const glob               = require("glob");
const fs                 = require("fs");
const spawn              = require('child_process').spawn;
const isDebug	         = !(process.env.NODE_ENV === 'production');

let configs		   = glob.sync("./src/pages/**/*.json");
let entrys		   = glob.sync("./src/pages/**/*.entry.js");
let template_path  = './node_modules/usan-templates/templates';
let webpackEntrys  = {};
let webpackPlugins = [];

let webpack_config = {
	entry: webpackEntrys,

	output: {
		filename: '[name].js',
		path: path.join(__dirname, "dist"),
	},
	
	module: {
		loaders:[
			{test: /\.js[x]?$/, exclude: /node_modules/, loader: 'babel'},
			{test: /\.vue$/, loader: 'vue'},
			{test: /\.less$/, loader: 'style!css!less'}
		]
	},
	resolve: {
	  alias: {
	    'vue$': 'vue/dist/vue.common.js'
	  }
	},
  	plugins:webpackPlugins,

	devServer: {
	    historyApiFallback: true,
	    hot: true,
	    inline: true,
	    progress: true,
	    port:9876
	}
};

// 动态创建 html 文件，不用 html 插件，提高编译速度
function CreateHtml() {}
CreateHtml.prototype.apply = compiler => {
  	compiler.plugin("emit", (compilation, callback) => { 
		let tasks = [];
		configs.forEach(config => {
			let scripts,
				jsFile,
				base_url,
				dist_base_url,
				savePath = config.replace('./src/pages/','').replace('.json','.html');

			if (isDebug) {
				base_url      = 'http://localhost:9876';
				dist_base_url = ''
			}
			else {
				base_url = ''
				dist_base_url = '/fe/dist';
			}

			jsFile  = config.replace('./src/pages/','').replace('.json','.js');
			scripts = `
					<script src="${base_url}${dist_base_url}/common.js"></script>
					<script src="${base_url}${dist_base_url}/${jsFile}"></script>
				</body>
				</html>`;

			let tpl  = JSON.parse(fs.readFileSync(config).toString()).template,
				data = fs.readFileSync(path.join(template_path, tpl, "/layout.html"),"utf-8"),
				fileContents = data.replace(/<!--placeholder-->(.|\n)*/gi, scripts);

			compilation.assets[savePath] = {
		      source: () => {
		        return fileContents;
		      },
		      size: () => {
		        return fileContents.length;
		      }
		    };
		})
		callback();
	});
};
 
(() => {
	var entryName = '';
	var obj 	  = null;
	entrys.forEach(entry=>{
		entryName = entry.replace('./src/pages/','').replace('.entry.js','');
		webpackEntrys[entryName] = entry;
	});
})();

webpackPlugins.push(new webpack.optimize.CommonsChunkPlugin('common.js'));
webpackPlugins.push(new CreateHtml());

if (!isDebug) {
	webpackPlugins.push(
		new CleanWebpackPlugin(['dist'], {
			verbose: true, 
			dry: false
		})
	);
	webpackPlugins.push(new webpack.optimize.UglifyJsPlugin({
		output: {
			comments: false,
		},
		compress: {
			warnings: false
		}
	}));
}
else {
	webpackPlugins.push(new OpenBrowserPlugin({url: 'http://localhost:9876'}));
	webpackPlugins.push(new webpack.HotModuleReplacementPlugin());
}

module.exports = webpack_config;
