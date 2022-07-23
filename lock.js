/**
 * Licensed under the AGPL-3.0 license.
 * Lifted from: 
 * Mutual Exclusion Patterns with Node.js Promises
 * by Valeri Karpov @code_barbarian (twitter) November 02, 2017
 * https://thecodebarbarian.com/mutual-exclusion-patterns-with-node-promises.html
 * or:
 * https://github.com/vkarpov15/thecodebarbarian.com/blob/master/lib/posts/20171103_promise_mutex.md
 * from https://github.com/vkarpov15/thecodebarbarian.com
 * 
 * It may not be production ready but it works for me.
 */
import { EventEmitter }  from 'events';

export class Lock {
  constructor() {
    this._locked = false;
    this._ee = new EventEmitter();
  }

  acquire() {
    return new Promise(resolve => {
      // If nobody has the lock, take it and resolve immediately
      if (!this._locked) {
        // Safe because JS doesn't interrupt you on synchronous operations,
        // so no need for compare-and-swap or anything like that.
        this._locked = true;
        return resolve();
      }

      // Otherwise, wait until somebody releases the lock and try again
      const tryAcquire = () => {
        if (!this._locked) {
          this._locked = true;
          this._ee.removeListener('release', tryAcquire);
          return resolve();
        }
      };
      this._ee.on('release', tryAcquire);
    });
  }

  release() {
    // Release the lock immediately
    this._locked = false;
    setImmediate(() => this._ee.emit('release'));
  }
}