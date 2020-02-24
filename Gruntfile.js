/* eslint-env node */

module.exports = function ( grunt ) {
	var conf = grunt.file.readJSON( 'extension.json' );

	grunt.loadNpmTasks( 'grunt-banana-checker' );
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-stylelint' );
	grunt.loadNpmTasks( 'grunt-svgmin' );

	grunt.initConfig( {
		banana: conf.MessagesDirs,
		eslint: {
			options: {
				extensions: [ '.js', '.json' ],
				fix: grunt.option( 'fix' ),
				cache: true
			},
			all: [
				'**/*.{js,json}',
				'!{vendor,node_modules,docs}/**'
			]
		},
		stylelint: {
			options: {
				fix: grunt.option( 'fix' ),
				syntax: 'less'
			},
			src: 'resources/mmv/**/*.{css,less}'
		},
		// Image Optimization
		svgmin: {
			options: {
				js2svg: {
					indent: '\t',
					pretty: true
				},
				multipass: true,
				plugins: [ {
					cleanupIDs: false
				}, {
					removeDesc: false
				}, {
					removeRasterImages: true
				}, {
					removeTitle: false
				}, {
					removeViewBox: false
				}, {
					removeXMLProcInst: false
				}, {
					sortAttrs: true
				} ]
			},
			all: {
				files: [ {
					expand: true,
					cwd: 'resources',
					src: [
						'**/*.svg'
					],
					dest: 'resources/',
					ext: '.svg'
				} ]
			}
		}
	} );

	// Use `grunt lint --fix` to quickly fix trivial style errors.
	// Add `alias lintfix='grunt lint --fix' ; alias jsfix='grunt eslint --fix' ; alias cssfix='grunt stylelint --fix'` to ~/.bashrc
	// to use the short commands 1) lintfix, 2) jsfix, 3) cssfix for fixing lint errors in 1) all, 2) js, 3) css files.
	// Alternatively choose shorter aliases ex. lf, jf, cf.
	grunt.registerTask( 'lint', [ 'eslint', 'stylelint', 'banana' ] );
	grunt.registerTask( 'minify', 'svgmin' );

	grunt.registerTask( 'test', 'lint' );
	grunt.registerTask( 'build', 'minify' );
	grunt.registerTask( 'default', [ 'test', 'build' ] );
};
