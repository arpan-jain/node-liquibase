#!/usr/bin/env node
"use strict";

const childProcess = require('child_process');

const path = require('path');

class Liquibase {
	/**
	 * Returns an instance of a lightweight Liquibase Wrapper.
	 * @param {Object} params default parameters for Liquibase
	 * @param {String} params.liquibase - Absolute path to your Liquibase executable.
	 * @param {String} params.changeLogFile - Absolute path to your Change Log File
	 * @param {String} params.url - JDBC connection string
	 * @param {String} params.username - username
	 * @param {String} params.password - password
	 * @param {String} params.liquibaseProLicenseKey - Your Liquibase Pro License key
	 * @param {String} params.classpath - Absolute path to your JDBC driver jar file
	 *
	 * @example
	 * ```javascript
	 * const liquibase = require('node-liquibase');
	 *
	 * const config = {
	 *   contexts: 'TEST,DEV',
	 *   labels: 'staging,Jira-1200',
	 *   logLevel: 'debug',
	 *   overwriteOutputFile: 'true',
	 *   logFile: 'myLog.log'
	 * };
	 *
	 * liquibase(config)
	 *   .run('status', '--verbose')
	 *   .then(() => console.log('success'))
	 *   .catch((err) => console.error('fail', err));
	 * ```
	 */
	constructor(params = {}) {
		let classpath = null;
		if (params.db && params.db.toLowerCase() === 'mysql') {
			classpath = path.join(__dirname, '../Drivers/mysql-connector-java-8.0.23.jar');
		} else {
			throw new Error('This db type is currently not supported.')
		}
		delete params.db;
		this.params = {
			...params,
			liquibase: path.join(__dirname, '../liquibase-4.3.1/liquibase'),
			url: params.url,
			username: params.username,
			password: params.password,
			classpath,
		}
	}

	/**
	 * Executes a Liquibase command.
	 * @param {*} action a string for the Liquibase command to run. Defaults to `'update'`
	 * @param {*} params any parameters for the command
	 * @returns {Promise} Promise of a node child process.
	 */


	run(action = 'update', params = '') {
		return this._exec(`${this._command} ${action} ${params}`);
	}

	/**
	 * Internal Getter that returns a node child process compatible command string.
	 * @returns {string}
	 * @private
	 */


	get _command() {
		let cmd = `${this.params.liquibase}`;
		Object.keys(this.params).forEach(key => {
			if (key === 'liquibase') {
				return;
			}

			const value = this.params[key];
			cmd = `${cmd} --${key}=${value}`;
		});
		return cmd;
	}

	/**
	 *
	 * Internal method for executing a child process.
	 * @param {*} command Liquibase command
	 * @param {*} options any options
	 * @private
	 * @returns {Promise} Promise of a node child process.
	 */


	_exec(command, options = {}) {
		console.warn(command);
		let child;
		let promise = new Promise((resolve, reject) => {
			child = childProcess.exec(command, options, (error, stdout, stderr) => {
				console.log('\n', stdout);
				console.error('\n', stderr);

				if (error) {
					error.stderr = stderr;
					return reject(error);
				}

				resolve({
					stdout: stdout
				});
			});
		});
		promise.child = child;
		return promise;
	}

}

/**
 * Returns an instance of a lightweight Liquibase Wrapper.
 * @param {Object} params default parameters for Liquibase
 * @param {String} params.liquibase - Absolute path to your Liquibase executable.
 * @param {String} params.changeLogFile - Absolute path to your Change Log File
 * @param {String} params.url - JDBC connection string
 * @param {String} params.username - username
 * @param {String} params.password - password
 * @param {String} params.liquibaseProLicenseKey - Your Liquibase Pro License key
 * @param {String} params.classpath - Absolute path to your JDBC driver jar file
 *
 * @example
 * ```javascript
 * const liquibase = require('node-liquibase');
 *
 * const config = {
 *   contexts: 'TEST,DEV',
 *   labels: 'staging,Jira-1200',
 *   logLevel: 'debug',
 *   overwriteOutputFile: 'true',
 *   logFile: 'myLog.log'
 * };
 *
 * liquibase(config)
 *   .run('status', '--verbose')
 *   .then(() => console.log('success'))
 *   .catch((err) => console.error('fail', err));
 * ```
 */


function LiquibaseGenerator(params) {
	return new Liquibase(params);
}

module.exports = LiquibaseGenerator;
