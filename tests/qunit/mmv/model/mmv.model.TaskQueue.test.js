/*
 * This file is part of the MediaWiki extension MediaViewer.
 *
 * MediaViewer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * MediaViewer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MediaViewer.  If not, see <http://www.gnu.org/licenses/>.
 */

( function ( mw, $ ) {
	QUnit.module( 'mmv.model.TaskQueue', QUnit.newMwEnvironment() );

	QUnit.test( 'TaskQueue constructor sanity check', 1, function ( assert ) {
		var taskQueue = new mw.mmv.model.TaskQueue();

		assert.ok( taskQueue, 'TaskQueue created successfully' );
	} );

	QUnit.test( 'Queue length check', 2, function ( assert ) {
		var taskQueue = new mw.mmv.model.TaskQueue();

		assert.strictEqual( taskQueue.queue.length, 0, 'queue is initially empty' );

		taskQueue.push( function () {} );

		assert.strictEqual( taskQueue.queue.length, 1, 'queue length is incremented on push' );
	} );

	QUnit.test( 'State check', 3, function ( assert ) {
		var taskQueue = new mw.mmv.model.TaskQueue(),
			task = $.Deferred();

		taskQueue.push( function () { return task; } );

		assert.strictEqual( taskQueue.state, mw.mmv.model.TaskQueue.State.NOT_STARTED,
			'state is initially NOT_STARTED' );

		taskQueue.execute().then( function () {
			assert.strictEqual( taskQueue.state, mw.mmv.model.TaskQueue.State.FINISHED,
				'state is FINISHED after execution finished' );
		} );

		assert.strictEqual( taskQueue.state, mw.mmv.model.TaskQueue.State.RUNNING,
			'state is RUNNING after execution started' );

		task.resolve();
	} );

	QUnit.test( 'State check for cancellation', 1, function ( assert ) {
		var taskQueue = new mw.mmv.model.TaskQueue(),
			task = $.Deferred();

		taskQueue.push( function () { return task; } );
		taskQueue.execute();
		taskQueue.cancel();

		assert.strictEqual( taskQueue.state, mw.mmv.model.TaskQueue.State.CANCELLED,
			'state is CANCELLED after cancellation' );
	} );

	QUnit.test( 'Test executing empty queue', 1, function ( assert ) {
		var taskQueue = new mw.mmv.model.TaskQueue();

		QUnit.stop();
		taskQueue.execute().done( function () {
			assert.ok( true, 'Queue promise resolved' );
			QUnit.start();
		} );
	} );

	QUnit.test( 'Simple execution test', 2, function ( assert ) {
		var taskQueue = new mw.mmv.model.TaskQueue();

		QUnit.stop();
		taskQueue.push( function () {
			assert.ok( true, 'Task executed successfully' );
			QUnit.start();
		} );

		QUnit.stop();
		taskQueue.execute().done( function () {
			assert.ok( true, 'Queue promise resolved' );
			QUnit.start();
		} );
	} );

	QUnit.test( 'Task execution order test', 4, function ( assert ) {
		var taskQueue = new mw.mmv.model.TaskQueue(),
			nextExpectedTask = 1;

		QUnit.stop();
		taskQueue.push( function () {
			assert.strictEqual( nextExpectedTask, 1, 'First task executed in order' );
			nextExpectedTask++;
			QUnit.start();
		} );

		QUnit.stop();
		taskQueue.push( function () {
			var deferred = $.Deferred();

			assert.strictEqual( nextExpectedTask, 2, 'Second task executed in order' );
			nextExpectedTask++;

			setTimeout( function () {
				deferred.resolve();
				QUnit.start();
			}, 0 );

			return deferred;
		} );

		QUnit.stop();
		taskQueue.push( function () {
			assert.strictEqual( nextExpectedTask, 3, 'Second task executed in order' );
			QUnit.start();
		} );

		QUnit.stop();
		taskQueue.execute().done( function () {
			assert.ok( true, 'Queue promise resolved' );
			QUnit.start();
		} );
	} );

	QUnit.test( 'Double execution test', 2, function ( assert ) {
		var taskExecuted = false,
			taskQueue = new mw.mmv.model.TaskQueue();

		QUnit.stop();
		taskQueue.push( function () {
			assert.ok( !taskExecuted, 'Task executed only once' );
			taskExecuted = true;
			QUnit.start();
		} );

		QUnit.stop();
		taskQueue.execute().then( function () {
			return taskQueue.execute();
		} ).done( function () {
			assert.ok( true, 'Queue promise resolved' );
			QUnit.start();
		} );
	} );

	QUnit.test( 'Parallel execution test', 2, function ( assert ) {
		var taskExecuted = false,
			taskQueue = new mw.mmv.model.TaskQueue();

		QUnit.stop();
		taskQueue.push( function () {
			assert.ok( !taskExecuted, 'Task executed only once' );
			taskExecuted = true;
			QUnit.start();
		} );

		QUnit.stop();
		$.when(
			taskQueue.execute(),
			taskQueue.execute()
		).done( function () {
			assert.ok( true, 'Queue promise resolved' );
			QUnit.start();
		} );
	} );

	QUnit.test( 'Test push after execute', 1, function ( assert ) {
		var taskQueue = new mw.mmv.model.TaskQueue();

		taskQueue.execute();

		try {
			taskQueue.push( function () {} );
		} catch ( e ) {
			assert.ok( e, 'Exception thrown when trying to push to an already running queue' );
		}
	} );

	QUnit.test( 'Test failed task', 1, function ( assert ) {
		var taskQueue = new mw.mmv.model.TaskQueue();

		taskQueue.push( function () {
			return $.Deferred().reject();
		} );

		QUnit.stop();
		taskQueue.execute().done( function () {
			assert.ok( true, 'Queue promise resolved' );
			QUnit.start();
		} );
	} );

	QUnit.test( 'Test that tasks wait for each other', 1, function ( assert ) {
		var longRunningTaskFinished = false,
			taskQueue = new mw.mmv.model.TaskQueue();

		taskQueue.push( function () {
			var deferred = $.Deferred();

			setTimeout( function () {
				longRunningTaskFinished = true;
				deferred.resolve();
			}, 0 );

			return deferred;
		} );

		QUnit.stop();
		taskQueue.push( function () {
			assert.ok( longRunningTaskFinished, 'Task waits for previous task to finish' );
			QUnit.start();
		} );

		taskQueue.execute();
	} );

	QUnit.test( 'Test cancellation before start', 2, function ( assert ) {
		var taskQueue = new mw.mmv.model.TaskQueue(),
			taskTriggeredByHand = false,
			verificationTask = function () {
				assert.ok( taskTriggeredByHand, 'Task was not triggered' );
				QUnit.start();
			};

		taskQueue.push( verificationTask );

		taskQueue.cancel();

		QUnit.stop();
		taskQueue.execute().fail( function () {
			assert.ok( true, 'Queue promise rejected' );
			QUnit.start();
		} );

		QUnit.stop();
		setTimeout( function () {
			taskTriggeredByHand = true;
			verificationTask();
		}, 0 );
	} );

	QUnit.test( 'Test cancellation within callback', 2, function ( assert ) {
		var taskQueue = new mw.mmv.model.TaskQueue(),
			taskTriggeredByHand = false,
			verificationTask = function () {
				assert.ok( taskTriggeredByHand, 'Task was not triggered' );
				QUnit.start();
			};

		taskQueue.push( function () {
			taskQueue.cancel();
		} );
		taskQueue.push( verificationTask );

		QUnit.stop();
		taskQueue.execute().fail( function () {
			assert.ok( true, 'Queue promise rejected' );
			QUnit.start();
		} );

		QUnit.stop();
		setTimeout( function () {
			taskTriggeredByHand = true;
			verificationTask();
		}, 0 );
	} );

	QUnit.test( 'Test cancellation from task', 2, function ( assert ) {
		var taskQueue = new mw.mmv.model.TaskQueue(),
			taskTriggeredByHand = false,
			task1 = $.Deferred(),
			verificationTask = function () {
				assert.ok( taskTriggeredByHand, 'Task was not triggered' );
				QUnit.start();
			};

		taskQueue.push( function () {
			return task1;
		} );
		taskQueue.push( verificationTask );

		QUnit.stop();
		taskQueue.execute().fail( function () {
			assert.ok( true, 'Queue promise rejected' );
			QUnit.start();
		} );

		setTimeout( function () {
			taskQueue.cancel();
			task1.resolve();
		}, 0 );

		QUnit.stop();
		setTimeout( function () {
			taskTriggeredByHand = true;
			verificationTask();
		}, 0 );
	} );

}( mediaWiki, jQuery ) );
