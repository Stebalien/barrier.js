/** 
 * Barrier.js
 * ==========
 *
 * Provides a simple barrier for synchronization.
 *
 * To use, aquire the barrier before initiating a asynchronous operation and
 * release the barrier after the asynchronous operation has completed.
 *
 * When all aquired barriers have been released, waiting functions will be
 * called in order until either no waiting functions remain or a waiting
 * function takes the barrier.
 *
 * Example:
 *
 *   var barr = new Barrier();
 *   var myCb = function() {
 *     barr.release();
 *   };
 *   barr.aquire(2);
 *   myAsynchrounousMethod(myCb)
 *   myAsynchrounousMethod2(myCb)
 *   barr.wait(function() {
 *     //continue
 *   });
 *
 * Licence
 * =======
 *
 * The MIT License (MIT)
 * 
 * Copyright (c) 2013 Steven Allen
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 **/

/**
 * Bind compatability snippet
 * From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
 **/
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
 
    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };
 
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
 
    return fBound;
  };
}

window.Barrier = (function() {
  'use strict';

  /**
   * Instantiate the barrier
   *
   * Arguments:
   *   n - (optinal) initiate with n barriers pre-aquired.
   *
   * Throws:
   *   Error if n < 0
   **/
  var Barrier = function(n) {
    if (n < 0) {
      throw new RangeError("Invalid Argument");
    }
    this.value = n || 0;
    this.waiting = [];

    // These funtions may be called passed arround. Bind them.
    this.aquire.bind(this);
    this.release.bind(this);
    this.isSet.bind(this);
    this.wait.bind(this);
  };

  Barrier.prototype = {
    /**
     * Check if the barrier is currently set.
     */
    isSet: function() {
      return this.value > 0;
    },
    /**
     * Aquire the barrier.
     *
     * Arguments:
     *   n - (optional) aquire n barriers
     *
     * Throws:
     *   Error if n <= 0
     *
     **/
    aquire: function(n) {
      if (arguments.length === 0) {
        this.value++;
      } else if (n >= 0) {
        this.value += n;
      } else {
        throw new RangeError("Invalid Argument");
      }
      return this.value;
    },
    /**
     * Release the barrier.
     *
     * Arguments:
     *   n - (optional) release n barriers
     *
     * Throws:
     *   Error if n <= 0 or n > the number of barriers taken.
     */
    release: function(n) {
      if (!this.isSet()) {
        throw new Error("Barrier not set.");
      }
      if (arguments.length === 0) {
        this.value--;
      } else if (this.value >= n > 0) {
        this.value -= n;
      } else {
        throw new RangeError("Invalid Argument");
      }

      // Call waiting functions until set.
      var cb;
      while (!this.isSet() && this.waiting.length > 0) {
        cb = this.waiting.pop();
        cb.callback.apply(null, cb.args);
      }
    },
    /**
     * Call the passed function when all aquired barriers have been released.
     * If no barriers are currently taken, the function is called immediately.
     *
     * Arguments:
     *   fn - the callback
     **/
    wait: function(fn) {
      var args = Array.prototype.slice.call(arguments, 1);
      if (this.isSet()) {
        this.waiting.unshift({
          args: args,
          callback: fn
        });
      } else {
        fn.apply(null, args);
      }
    }
  };
  return Barrier;
})();
