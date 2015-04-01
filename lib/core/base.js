'use strict';
/**
 * Base Class
 * all class will inherit this class
 * @param  {Object} http 
 * @return {Class}   
 */
var methods = {
  /**
   * init
   * @param  {Object} http [http object]
   * @return {}      []
   */
  init: function(http){
    this.http = http || {};
  },
  /**
   * invoke method, support __before & __after magic methods
   * @param  {String} method []
   * @param  {mixed} data []
   * @return {Promise}     []
   */
  invoke: function(method, data){
    var promise = Promise.resolve(), fn, self = this;
    if (think.isFunction(this.__before)) {
      promise = think.co.wrap(this.__before).bind(self)();
    }
    promise = promise.then(function(){
      fn = think.co.wrap(self[method]);
      return fn.apply(self, data || []);
    });
    if (think.isFunction(this.__after)) {
      promise = promise.then(function(){
        return think.co.wrap(self.__after).bind(self)();
      })
    }
    return promise;
  },
  /**
   * get or set config
   * @param  {string} name  [config name]
   * @param  {mixed} value [config value]
   * @return {mixed}       []
   */
  config: function(name, value){
    return think.config(name, value, this.http._config);
  },
  /**
   * invoke action
   * @param  {Object} controller [controller instance]
   * @param  {String} action     [action name]
   * @param  {Mixed} data       [action params]
   * @return {}            []
   */
  action: function(controller, action){
    if (think.isString(controller)) {
      controller = this.controller(controller);
    }
    if (action !== '__call') {
      action += think.config('action_suffix');
    }
    return controller.invoke(action, [controller]);
  },
  /**
   * get or set cache
   * @param  {String} name    [cache name]
   * @param  {mixed} value   [cache value]
   * @param  {Object} options [cache options]
   * @return {}         []
   */
  cache: function(name, value, options){
    options = think.extend({}, this.config('cache'), options);
    return think.cache(name, value, options);
  },
  /**
   * invoke hook
   * @param  {[type]} event []
   * @return {[type]}       []
   */
  hook: function(event, data){
    return think.hook(event, this.http, data);
  }
};

//add model, controller, service, logic methods
var list = ['model', 'controller', 'service', 'logic'];
list.forEach(function(type){
  methods[type] = (function(){
    return function(name){
      var key = '/' + think.dirname[type] + '/';
      if (name.indexOf(key) === -1) {
        name = this.http.module + key + name;
      }
      var cls = think.require(name);
      return cls(this.http);
    }
  })(type)
});

module.exports = think.Class(methods, true)