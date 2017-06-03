// generated on 2015-10-25 using generator-gulp-webapp 1.0.3
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';
import gulpsmith from 'gulpsmith';
import permalinks from 'metalsmith-permalinks'
import layouts from 'metalsmith-layouts';
import handlebars from 'handlebars';
import lodash from 'lodash';
import copy from 'metalsmith-copy';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

var siteConfig = {
  site: {
    title:            "Brainside Out",
    author:           "Dane Petersen",
    year:             "2017",
    componentsFolder: "app/components",
    cssFolder:        "styles",
    jsFolder:         "scripts",
    imgFolder:        "images",
    cssMainFile:      "screen",
    jsMainFile:       "main"
  }
};

gulp.task('html', () => {
  const assets = $.useref.assets({searchPath: ['.tmp', 'app', '.']});

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/**/*',
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['clean', 'smith'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'app/scripts/**/*.js',
  ]).on('change', reload);

  gulp.watch([
    'src/**/*.hbs',
    'layouts/*.hbs'
  ], ['smith']);
});

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('smith', function() {
  gulp.src("src/**/*")
  .pipe($.frontMatter()).on("data", function(file) {
    lodash.assign(file, file.frontMatter); 
    delete file.frontMatter;
  })
  .pipe(
    gulpsmith()
    .metadata(siteConfig)
    .use(layouts({ 
      "engine": 'handlebars',
      "default": "default.hbs",
      "pattern": "**/*.hbs"
    }))
    .use(copy({
      pattern: '**/*.hbs',
      extension: '.html',
      move: true
    }))
    .use(permalinks({
      pattern: ':path'
    }))
  )
  .pipe(gulp.dest(".tmp"))
  .pipe(gulp.dest("dist"))
  .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
  return gulp.src('app/scripts/**/*.js', {
  }).pipe(gulp.dest('dist/scripts'));
});

gulp.task('build', ['html', 'extras', 'smith', 'scripts'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
