Barrier.js
==========

Provides a simple barrier for synchronization.

To use, aquire the barrier before initiating a asynchronous operation and
release the barrier after the asynchronous operation has completed.

When all aquired barriers have been released, waiting functions will be
called in order until either no waiting functions remain or a waiting
function takes the barrier.

Example
-------

```javascript
var barr = new Barrier();
var myCb = function() {
  barr.release();
};
barr.aquire(2);
myAsynchrounousMethod(myCb)
myAsynchrounousMethod2(myCb)
barr.wait(function() {
  //continue
});
```
