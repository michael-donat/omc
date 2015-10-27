var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var babelify = require('babelify');
var inject = require('gulp-inject');
var watch = require('gulp-watch');
var watchify = require('watchify');
var assign = require('object-assign');
var sass = require('gulp-ruby-sass');

const dist = {
  js: 'dist/js',
  html: 'dist',
  css: 'dist/css'
  prefix: 'omc'
}

const dev = {
  js: 'dev/js',
  html: 'dev',
  css: 'dev/css'
}

var target = dev;

gulp.task('gh', ['env.dist', 'css', 'js'], function() {
  gulp.run('html:gh')
})

gulp.task('watch', ['watch.js', 'watch.css', 'watch.html'])

gulp.task('env.dist', function() {
  target = dist;
})

gulp.task('watch.js', function() {
  var w = watchify(b)
  w.on('update', bundleJS.bind(gulp, w))
  w.on('log', function(str) {gutil.log(gutil.colors.blue('watch.js:'), str)})
  return bundleJS(w)
})

gulp.task('watch.css', function() {
  gulp.watch('app/styles/*.scss', ['css']);
})

gulp.task('css', function() {
  return sass('app/styles/*.scss')
    .pipe(gulp.dest(target.css))
});

gulp.task('watch.html', function() {
  gulp.watch('app/index.html', ['html']);
})

gulp.task('html:gh', function() {
  var target = gulp.src('./app/index.html');
  var sources = gulp.src(['./dist/js/*.js', './dist/css/*.css'], {read: false});

  return target.pipe(inject(sources, {ignorePath: 'dist', addPrefix: target.prefix}))
    .pipe(gulp.dest(dist.html));
})

gulp.task('html', function() {
  var target = gulp.src('./app/index.html');
  var sources = gulp.src(['./'+target.js+'/*.js', './'+target.css+'/*.css'], {read: false});

  return target.pipe(inject(sources, {relative: true}))
    .pipe(gulp.dest(target.html));
})

var b = browserify(assign({}, watchify.args, {
  entries: './app/app.es6',
  debug: true,
  // defining transforms here will avoid crashing your stream
  transform: [babelify]
}));

gulp.task('js', function() {
  return bundleJS(b)
});

function bundleJS(b) {
  return b.bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(target.js));
}
