module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['gruntfile.js', 'public/**/*.js', '!public/javascripts/less-1.4.1.min.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    less: {
      production: {
        options: {
          yuicompress: true
        },
        files: {
          "public/stylesheets/style.css": "public/stylesheets/style.less"
        }
      }
    },
    watch: {
      options: { livereload: true },
      files: ['<%= jshint.files %>', 'public/**/*.less', 'views/*.jade'],
      tasks: ['jshint', 'less']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint', 'less']);
};
