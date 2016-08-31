(function() {
  'use strict'

  class Scope {
    constructor(scope, element) {
      this.parent = scope
      this.element = element
      this.vars = {} // all vars are functions that take a scope representing the function arguments, and
    }

    find(what) {
      var s = this
      while(s) {
        if (typeof s.vars[what] !== 'undefined') return s.vars[what]
        s = s.parent
      }
      return undefined
    }

    evaluate() {
      var result = this.element.firstChild ? this.element.firstChild.nodeValue : null
      for (let i = 0; i < this.element.children.length; i++) {
        var child = this.element.children[i]
        switch (child.tagName.toLowerCase()) {
          case 'div':
            console.debug('found div ', child)
            switch (child.className) {
              case 'funk':
              case 'function':
                this.makeFunk(child)
                break;
            }
            break;
          case 'ins':
            console.debug('found a ', child)
            var output = this.callFunk(child)
            result = result ? result + output : output
            break;
          case 'var':
            console.debug('found var ', child)
            this.makeVariable(child)
            break;
        }
      }
      return result
    }

    makeFunk(element) {
      var _this = this;
      this.vars[element.id] = function(scope) {
        var funkScope = new Scope(_this, element)
        for (var key in scope.vars) {
          funkScope.vars[key] = scope.vars[key]
        } // assign any vars passed to the function
        return function() {
          funkScope.evaluate()
        }
      }
    }

    makeRawFunk(name, funk) {
      this.vars[name] = function(scope) {
        return funk;
      }
    }

    makeVariable(element) {
      var temp = new Scope(this, element)
      var value = temp.evaluate()
      this.vars[element.id] = function() {
        return function() {
          return value
        }
      }
    }

    callFunk(element) {
      var argsScope = new Scope(this, element)
      var args = argsScope.evaluate() // process logic passed in to the function
      var funk = this.find(element.id)(argsScope) // get a temporary function scope
      return funk(args);
    }
  }

  const globalScope = new Scope(null, document.getElementById('htpl'))
  globalScope.makeRawFunk('print', console.log)
  globalScope.evaluate()
})()
