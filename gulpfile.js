var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var browserSync = require('browser-sync');
var concat = require('gulp-concat');
var concatCSS = require('gulp-concat-css');
var uglify = require('gulp-uglify');
var run = require('gulp-shell');
var runSequence = require('run-sequence');
var rsync  = require('gulp-rsync');
var del = require('del');

var config = {
	themeDir: './themes/tsots',
	contentDir: './content',
	cssDir: './themes/tsots/static/css',
	scssDir: './themes/tsots/static/scss',
	imgDir: './themes/tsots/static/images',
	jsDir: './themes/tsots/static/js',
	dist: './output',
  rsync: {
    options: {
      destination: '/home/jdaining/tsots.justindaining.com/public_html/',
      root: './output',
      hostname: 'justindaining.com',
      username: 'jdaining',
      incremental: true,
      progress: true,
      relative: true,
      emptyDirectories: true,
      recursive: true,
      clean: true,
      exclude: ['.DS_Store'],
      include: []
    }
  }
}

var reload = browserSync.reload;

gulp.task('clean:dist', function() {
  return del.sync(config.cssDir + '/dist/all.css');
});

gulp.task('clean:output', function() {
  return del.sync(config.dist);
});

gulp.task('sass', ['clean:dist'], function() {
  return gulp.src(config.scssDir + '/styles.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest(config.cssDir))
});

gulp.task('css', ['sass'], function() {
	return gulp.src(config.cssDir + '/**/*.css')
	.pipe(concatCSS('all.css', {rebaseUrls: false}))
	.pipe(gulp.dest(config.cssDir + '/dist'))
	.pipe(browserSync.reload({
    stream: true
  }));
});

gulp.task('pelicandev', ['css'], function() {
  return gulp.src('')
    .pipe(run('pelican content -s pelicanconf.py'))
    .pipe(browserSync.reload({
	    stream: true
	  }));
});

gulp.task('builddev', function(callback) {
  runSequence('clean:output', 'pelicandev', callback);
});

gulp.task('pelicanprod', ['css'], function() {
  return gulp.src('')
    .pipe(run('pelican content -s publishconf.py'))
    .pipe(browserSync.reload({
	    stream: true
	  }));
});

gulp.task('buildprod', function(callback) {
  runSequence('clean:output', 'pelicanprod', callback);
});

gulp.task('server', ['builddev'], function() {
  browserSync.init({
    server: {
      baseDir: config.dist
    }
  });
});

gulp.task('deploy', ['buildprod'], function() {
  return gulp.src(config.dist + '**')
    .pipe(rsync(config.rsync.options));
});

gulp.task('default', ['server'], function() {
  gulp.watch(config.scssDir + '/**/*.scss', ['builddev']);
  gulp.watch(config.themeDir + '/templates/**/*.html', ['builddev']);
  gulp.watch(config.contentDir + '/**/*.md', ['builddev']);
  return
});
