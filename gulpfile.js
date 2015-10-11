var gulp = require('gulp')
  , gutil = require('gulp-util')
  , source = require('vinyl-source-stream')
  , browserify = require('browserify')
  , watchify = require('watchify')
  , babelify = require('babelify')
  , notifier = require('node-notifier')
  , server = require('gulp-server-livereload')
  , concat = require('gulp-concat')
  , sass = require('gulp-sass')
  , watch = require('gulp-watch');

var notify = function(error) {
  var message = 'In: '
    , title = 'Error: ';

  if(error.description) {
    title += error.description;
  } else if (error.message) {
    title += error.message;
  }

  if(error.filename) {
    var file = error.filename.split('/');
    message += file[file.length-1];
  }

  if(error.lineNumber) {
    message += '\nOn Line: ' + error.lineNumber;
  }
  console.log({title: title, message: message});
  notifier.notify({title: title, message: message});
};

var bundler = watchify(browserify({
  entries: ['./app_admin/src/app.jsx'],
  transform: [babelify],
  extensions: ['.jsx'],
  debug: true,
  fullPaths: true
}));

function bundle() {
  return bundler
    .bundle()
    .on('error', notify)
    .pipe(source('main.js'))
    .pipe(gulp.dest('./app_admin/'));
}
bundler.on('update', bundle);

gulp.task('build', function() {
  bundle();
});

gulp.task('serve', function(done) {
  gulp.src('./app_admin')
    .pipe(server({
      livereload: {
        enable: true,
        filter: function(filePath, cb) {
          if(/main.js/.test(filePath)) {
            cb(true);
          } else if(/style.css/.test(filePath)) {
            cb(true);
          }
        }
      },
      open: true,
      defaultFile: '/index.html'
    }));
});

gulp.task('sass', function() {
  gulp.src('./app_admin/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./app_admin/'));
});

gulp.task('watch', function() {
  gulp.watch('./app_admin/sass/**/*.scss', ['sass']);
});

gulp.task('default', ['build', 'serve', 'sass', 'watch']);
