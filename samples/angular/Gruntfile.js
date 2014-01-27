'use strict';
var LIVERELOAD_PORT = 35729;

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
	// load all grunt tasks
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	// configurable paths
	var yeomanConfig = {
		app: 'app',
		dist: 'dist',
		server: 'server'
	};

	grunt.initConfig({
		yeoman: yeomanConfig,
		watch: {
			coffee: {
				files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
				tasks: ['coffee:dev', 'fixsourcemaps']
			},
			coffeeTest: {
				files: ['test/spec/{,*/}*.coffee'],
				tasks: ['coffee:test']
			},
			less: {
				files: ['<%= yeoman.app %>/styles/{,*/}*.less'],
				tasks: ['less:dev']
			},
			jade: {
				files: ['<%= yeoman.app %>/{,views/**/}*.jade'],
				tasks: ['jade:dev']
			},
			assetlink: {
				files: ['<%= yeoman.app %>/*.html'],
				tasks: ['assetlinker:dev']
			},
			jslink: {
				options: {
					event: ['added', 'deleted']
				},
				files: ['{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js'],
				tasks: ['assetlinker:dev']
			},
			livereload: {
				options: {
					livereload: LIVERELOAD_PORT
				},
				files: [
					'.tmp/**/*.html',
					'<%= yeoman.app %>/views/**/*.html',
					'{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
					'{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
					'<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
				]
			},
			scarabrestart: {
				options: {
					livereload: LIVERELOAD_PORT
				},
				files: [
					'<%= yeoman.server %>/**/*.js'
				],
				tasks: ['scarab:restart']
			}
		},
		scarab : {
			options: {
				server: '<%=yeoman.server %>',
				port: 9000,
				host: '0.0.0.0',
				livereload: LIVERELOAD_PORT
			},
			dev: {
				options: {
					mount: {
						'/admin': ['.tmp', yeomanConfig.app]
					}
				}
			},
			test: {
				options: {
					mount: {
						'/admin': ['.tmp', 'test']
					}
				}
			},
			dist: {
				options: {
					mount: {
						'/admin': yeomanConfig.dist
					}
				}
			}
		},
		assetlinker: {
			dev: {
				options: {
					find: '<!-- link scripts here automatically -->',
					assets: ['{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js'],
					roots: ['.tmp/', '<%= yeoman.app %>']
				},
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>',
					src: 'index.html',
					dest: '.tmp'
				}]
			},
			dist: {
				options: {
					find: '<!-- link scripts here automatically -->',
					assets: ['.tmp/scripts/{,*/}*.js']
				},
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>',
					src: 'index.html',
					dest: '.tmp'
				}]
			}
		},
		open: {
			dev: {
				path: 'http://192.168.1.29:<%= scarab.options.port %>/admin/'
				// path: 'http://192.168.0.18:<%= scarab.options.port %>/admin/'
			}
		},
		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						'.tmp',
						'<%= yeoman.dist %>/*',
						'!<%= yeoman.dist %>/.git*'
					]
				}]
			},
			dev: '.tmp'
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'<%= yeoman.app %>/scripts/{,*/}*.js',
				'!<%= yeoman.app %>/scripts/vendor/*',
				'test/spec/{,*/}*.js'
			]
		},
		// mocha: {
		// 	all: {
		// 		options: {
		// 			run: true,
		// 			urls: ['http://localhost:<%= connect.options.port %>/index.html']
		// 		}
		// 	}
		// },
		karma: {
			unit: {
				configFile: 'karma.conf.js',
				singleRun: true
			}
		},
		coffee: {
			dev: {
				options: {
					sourceMap: true
				},
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>/scripts',
					src: '{,*/}*.coffee',
					dest: '.tmp/scripts',
					ext: '.js'
				}]
			},
			test: {
				files: [{
					expand: true,
					cwd: 'test/spec',
					src: '{,*/}*.coffee',
					dest: '.tmp/spec',
					ext: '.js'
				}]
			},
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>/scripts',
					src: '{,*/}*.coffee',
					dest: '.tmp/scripts',
					ext: '.js'
				}]
			}
		},
		fixsourcemaps: {
			sourcemaps: {
				src: '.tmp/scripts/**/*.map'
			}
		},
		jade: {
			dev: {
				options: {
					// pretty: true,
					compileDebug: true
				},
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>',
					src: '{,views/**/}*.jade',
					dest: '.tmp',
					ext: '.html'
				}]
			},
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>',
					src: '{,views/**/}*.jade',
					dest: '.tmp',
					ext: '.html'
				}]
			}
		},
		less: {
			dev: {
				options: {
					dumpLineNumbers: 'all'
				},
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>/styles',
					src: '{,*/}*.less',
					dest: '.tmp/styles',
					ext: '.css'
				}]
			},
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>/styles',
					src: '{,*/}*.less',
					dest: '.tmp/styles',
					ext: '.css'
				}]
			}
		},
		rev: {
			dist: {
				files: {
					src: [
						'<%= yeoman.dist %>/scripts/{,*/}*.js',
						'<%= yeoman.dist %>/styles/{,*/}*.css',
						'<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
						'<%= yeoman.dist %>/styles/fonts/*'
					]
				}
			}
		},
		useminPrepare: {
			options: {
				dest: '<%= yeoman.dist %>'
			},
			html: '.tmp/index.html'
		},
		usemin: {
			options: {
				dirs: ['<%= yeoman.dist %>']
			},
			html: ['<%= yeoman.dist %>/{,*/}*.html'],
			css: ['<%= yeoman.dist %>/styles/{,*/}*.css']
		},
		imagemin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>/images',
					src: '{,*/}*.{png,jpg,jpeg}',
					dest: '<%= yeoman.dist %>/images'
				}]
			}
		},
		svgmin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>/images',
					src: '{,*/}*.svg',
					dest: '<%= yeoman.dist %>/images'
				}]
			}
		},
		htmlmin: {
			dist: {
				options: {
					removeComments: true,
					removeCommentsFromCDATA: true,
					removeCDATASectionsFromCDATA: true,
					collapseWhitespace: true,
					collapseBooleanAttributes: true,
					removeEmptyAttributes: true
				},
				files: [{
					expand: true,
					cwd: '<%= yeoman.dist %>',
					src: ['*.html', 'views/**/*.html'],
					dest: '<%= yeoman.dist %>'
				}]
			}
		},
		ngmin: {
			dist: {
				files: [{
					expand: true,
					cwd: '.tmp/concat/scripts',
					src: '*.js',
					dest: '.tmp/concat/scripts'
				}]
			}
		},
		ngtemplates: {
			dist: {
				options: {
					module: 'ArgoAdminApp',
					base: '.tmp',
				},
				cwd: '.tmp',
				src: 'views/**/*.html',
				dest: '.tmp/scripts/templates.js'
			}
		},
		symlink: {
			bower: {
				dest: '.tmp/bower_components',
				relativeSrc: '../app/bower_components',
				options: {type: 'dir'}
			}
		},
		// Put files not handled in other tasks here
		copy: {
			tmp: {
				files: [{
					expand: true,
					cwd: '<%= yeoman.app %>',
					dest: '.tmp',
					src: [
						'views/**/*.html',
						'scripts/**/*.js',
						'styles/**/*.css'
					]
				}]
			},
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= yeoman.app %>',
					dest: '<%= yeoman.dist %>',
					src: [
						'*.{ico,txt}',
						'.htaccess',
						'images/{,*/}*.{webp,gif}',
						'styles/fonts/*'
					]
				}, {
					expand: true,
					cwd: '.tmp/images',
					dest: '<%= yeoman.dist %>/images',
					src: [
						'generated/*'
					]
				}, {
					expand: true,
					cwd: '.tmp',
					src: ['*.html'],
					dest: '<%= yeoman.dist %>'
				}, {
					expand: true,
					cwd: 'app/bower_components/components-bootstrap/img/',
					src: ['*'],
					dest: '<%= yeoman.dist %>/img/'
				}]
			}
		},
		concurrent: {
			dev: [
				'jade:dev',
				'coffee:dev',
				'less:dev'
			],
			test: [
				'jade:dev',
				'coffee',
				'less'
			],
			dist: [
				'jade:dist',
				'coffee:dist',
				'less:dist',
				'imagemin',
				'svgmin'
			]
		}
	});

	grunt.registerMultiTask('assetlinker', function() {
		console.log('linking assets:');
		var path = require('path');
		var options = this.options({
			defaultWraps: {
				js: '<script src="{{asset}}"></script>',
				css: '<link rel="stylesheet" href="{{asset}}">'
			}
		});
		var assets = grunt.file.expand(options.assets);

		this.files.forEach(function(file) {
			var content = grunt.file.read(file.src);
			var replacement = [];
			assets.forEach(function(asset) {
				if (options.roots) {
					options.roots.forEach(function(root) {
						if (root[root.length-1] !== path.sep)
							root = root + '/';
						if (asset.indexOf(root) === 0)
							asset = asset.substring(root.length, asset.length);
					});
				} else {
					asset = path.relative(path.dirname(file.dest), asset);
				}
				console.log(asset);
				var wrap = options.wrap || options.defaultWraps[asset.substring(asset.lastIndexOf('.')+1)];
				replacement.push(wrap.replace('{{asset}}', asset));
			});
			content = content.replace(options.find, replacement.join('\n'));
			grunt.file.write(file.dest, content);
		});
	});

	grunt.registerMultiTask('fixsourcemaps', function() {
		var options = this.options({
			sourceRoot: ''
		});
		this.files.forEach(function(file) {
			file.src.forEach(function(source) {
				var map = grunt.file.readJSON(source);
				map.sourceRoot = options.sourceRoot;
				grunt.file.write(source, JSON.stringify(map, null, 4));
			});
		});
	});

	grunt.registerTask('server', function (target) {
		if (target === 'dist') {
			return grunt.task.run(['build', 'scarab:dist', 'open', 'watch:scarabrestart']);
		}

		grunt.task.run([
			'clean:dev',
			'concurrent:dev',
			'fixsourcemaps',
			'assetlinker:dev',
			'scarab:dev',
			'open',
			'watch'
		]);
	});

	grunt.registerTask('test', [
		'clean:dev',
		'concurrent:test',
		'assetlinker:dev',
		'scarab:test',
		'karma'
	]);

	grunt.registerTask('build', [
		'clean:dist',
		'copy:tmp',
		'symlink:bower',
		'concurrent:dist',
		'ngtemplates',
		'assetlinker:dist',
		'useminPrepare',
		'concat',
		'cssmin',
		'ngmin',
		'uglify',
		'copy:dist',
		'rev',
		'usemin',
		'htmlmin'
	]);

	grunt.registerTask('default', [
		'jshint',
		'test',
		'build'
	]);
};
