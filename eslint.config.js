'use strict';

const { defineConfig } = require( 'eslint/config' );
const wikimedia = require( 'eslint-config-wikimedia/flat' );

// Directories with their own config, which other configs don't apply to.
// These were directories with `"root": true` in .eslintrc.json.
const rootDirs = {
	resources: [ 'resources/**' ],
	tests: [ 'tests/qunit/**' ]
};

module.exports = defineConfig( [
	// Gruntfile.js, etc.
	{
		ignores: Object.values( rootDirs ).flat(),
		extends: [ wikimedia( 'server' ) ]
	},

	// Code which runs in MediaWiki
	{
		files: rootDirs.resources,
		extends: [ wikimedia( 'client', 'jquery', 'mediawiki' ) ],
		rules: {
			'max-len': 'off',
			'no-jquery/no-class-state': 'off',
			'no-jquery/no-support': 'off',
			'es-x/no-resizable-and-growable-arraybuffers': 'off',
			'no-jquery/no-done-fail': 'warn'
		},
		settings: {
			jsdoc: {
				preferredTypes: {
					Config: 'Config',
					ImageModel: 'ImageModel',
					DownloadDialog: 'DownloadDialog',
					License: 'License',
					LightboxImage: 'LightboxImage',
					MultimediaViewer: 'MultimediaViewer',
					OptionsDialog: 'OptionsDialog',
					ReuseDialog: 'ReuseDialog',
					ThumbnailWidth: 'ThumbnailWidth',
					UiElement: 'UiElement'
				}
			}
		}
	},
	{
		files: [ 'resources/**/*.js', 'resources/**/*.vue' ],
		rules: {
			'jsdoc/valid-types': 'off'
		}
	},

	// QUnit tests
	{
		files: rootDirs.tests,
		extends: [ wikimedia( 'mediawiki/qunit' ) ],
		languageOptions: {
			globals: {
				sinon: 'readonly',
				// CommonJS globals (was `env: { commonjs: true }`)
				require: 'readonly',
				module: 'readonly',
				exports: 'writable',
				global: 'readonly'
			}
		},
		rules: {
			'no-jquery/no-global-selector': 'off',
			'no-jquery/no-sizzle': 'off',
			'es-x/no-resizable-and-growable-arraybuffers': 'off',
			'no-jquery/no-class-state': 'off',
			'no-jquery/no-done-fail': 'warn'
		}
	}
] );
