const {series, src, dest, parallel, watch} = require("gulp");
const cache = require('gulp-cached');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const pug = require('gulp-pug');
const config = require("./config.json");
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');
const cssnano = require("cssnano");
const browserSync = require('browser-sync').create();
const fs = require('fs-extra');
const path = require("path");
function livePreview(cb){
  browserSync.init({
    server: {
      baseDir: config.paths.dev
    },
    port: config.port || 5000
  },(err,bs) => {
  		bs.addMiddleware("*", (req, res) => {
        // Provides the 404 content without redirect.
        res.write(fs.readFileSync(path.join(__dirname, 'dev/pages/index.html')));
        res.end();
	    });
  	}
  );
  cb();
} 

function previewReload(done){
  console.log("Reloading Browser Preview.\n");
  browserSync.reload();
  done();
}

function cleanDev(cb){
	fs.emptyDirSync(config.paths.dev);
	cb();
}
function cleanProd(cb){
	fs.emptyDirSync(config.paths.dist);
	cb();
}

function jsDev(){
	return src(config.paths.src.js)
		.pipe(cache('js'))
		.pipe(babel())
		.pipe(dest(config.paths.dev));
}
function htmlDev(){
	return src(config.paths.src.pugCompile)
		.pipe(pug({
			pretty: true // DEPRECATED 
		}))
		.pipe(cache("html"))
		.pipe(dest(config.paths.dev + "pages"));
}
function cssDev(){
	const plugins = [
		tailwindcss(),
	];
	return src(config.paths.src.css)
		.pipe(postcss(plugins))
		.pipe(dest(config.paths.dev));
}
function imgDev(){
	return src(config.paths.src.imgs).pipe(dest(config.paths.dev));
}
function jsProd(){
	return src(config.paths.src.js)
		.pipe(babel())
		.pipe(uglify())
		.pipe(dest(config.paths.dist))
}
function htmlProd(){
	return src(config.paths.src.pugCompile)
		.pipe(pug())
		.pipe(dest(config.paths.dist));
}
function cssProd(){
	const plugins = [
		tailwindcss(),
		cssnano()
	];
	return src(config.paths.src.css)
		.pipe(postcss(plugins))
		.pipe(dest(config.paths.dist));
}
function imgProd(){
	return src(config.paths.src.imgs).pipe(dest(config.paths.dist));
}
function watchFiles(){
	console.log("listening on http://localhost:" + config.port + '/');
	watch(config.paths.src.js, series(jsDev,previewReload));
	watch(config.paths.src.pugWatch, series(htmlDev,cssDev,previewReload));
	watch(config.paths.src.css, series(cssDev,previewReload));
	watch(config.paths.src.imgs, series(imgDev,previewReload));
}

// dev
exports.default = series(
	cleanDev, // clean dev directory
	parallel(jsDev,htmlDev,cssDev,imgDev),
	livePreview,
	watchFiles
);

exports.build = series(
	cleanProd,
	parallel(jsProd, htmlProd, cssProd,imgProd)
);
