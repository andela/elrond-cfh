const gulp = require('gulp');
const sass = require('gulp-sass');
const jshint = require('gulp-jshint');
const cache = require('gulp-cache');
const bower = require('gulp-bower');
const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync').create();
var Server = require('karma').Server;

gulp.task('lint', function() {
  return gulp.src(['public/js/**/*.js', 'test/**/*.js', 'app/**/*.js'] )
    .pipe(jshint())
    .pipe(jshint.reporter('fail'));
});

gulp.task('sass', function() {
  gulp.src('public/scss/**/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest('./public/css'));
});

gulp.task('bower', function() {
  return bower()
    .pipe(gulp.dest('public/lib'))
});

gulp.task('start', function () {
  return nodemon({
    script: 'server.js',
     ext: 'js html',
     env: { 'PORT': 3000 }
  })
})

// Run test once and exit
gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

// gulp.task('default', [ 'html', 'css' ]);

// Watch for changes in files
gulp.task('watch', function() {

  // Watch .scss files
 gulp.watch('public/scss/*.scss', ['sass', browserSync.reload]);
 gulp.watch('public/js/**/*.js', [ browserSync.reload]);
 gulp.watch('app/views/**/*.jade', [ browserSync.reload]);
 gulp.watch('public/scss/*.scss', ['sass', browserSync.reload]);

});

gulp.task('browser-sync', ['sass', 'start', 'watch'], function() {
  browserSync.init({
      proxy: "http://localhost:3000",
      port: 5000,
      open: false
  });
});

