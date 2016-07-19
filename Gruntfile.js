/*jshint node:true */
module.exports = function ( grunt ) {
	grunt.loadNpmTasks( 'grunt-banana-checker' );
	grunt.loadNpmTasks( 'grunt-jscs' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-jsonlint' );

	grunt.initConfig( {
		banana: {
			all: 'i18n/'
		},
		jsonlint: {
			all: [
				'**/*.json',
				'!node_modules/**'
			]
		},
		jshint: {
			options: {
				jshintrc: true
			},
			all: [
				'*.js',
				'resources/mmv/**/*.js',
				'tests/**/*.js'
			]
		},
		jscs: {
			fix: {
				options: {
					fix: true
				},
				src: '<%= jshint.all %>'
			},
			main: {
				src: '<%= jshint.all %>'
			}
		}
	} );

	grunt.registerTask( 'test', [ 'jshint', 'jscs:main', 'jsonlint', 'banana' ] );
	grunt.registerTask( 'default', 'test' );
};
