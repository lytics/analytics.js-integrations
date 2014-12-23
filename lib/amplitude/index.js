
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var utm = require('utm-params');
var top = require('top-domain');

/**
 * Expose `Amplitude` integration.
 */

var Amplitude = module.exports = integration('Amplitude')
  .global('amplitude')
  .option('apiKey', '')
  .option('trackAllPages', false)
  .option('trackNamedPages', true)
  .option('trackCategorizedPages', true)
  .tag('<script src="https://d24n15hnbwhuhn.cloudfront.net/libs/amplitude-1.3-min.js">');

/**
 * Initialize.
 *
 * https://github.com/amplitude/Amplitude-Javascript
 *
 * @param {Object} page
 */

Amplitude.prototype.initialize = function(page){
  // jscs:disable
  (function(h,a){var f=h.amplitude||{};f._q=[];function e(i){f[i]=function(){f._q.push([i].concat(Array.prototype.slice.call(arguments,0)))}}var c=["init","logEvent","setUserId","setUserProperties","setVersionName","setDomain","setGlobalUserProperties"];for(var d=0;d<c.length;d++){e(c[d])}h.amplitude=f})(window,document);
  // jscs:enable
  this.setDomain(window.location.href);
  window.amplitude.init(this.options.apiKey);
  this.setGlobalUserProperties(window.location.search);
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @return {Boolean}
 */

Amplitude.prototype.loaded = function(){
  return !! (window.amplitude && window.amplitude.options);
};

/**
 * Page.
 *
 * @param {Page} page
 */

Amplitude.prototype.page = function(page){
  var properties = page.properties();
  var category = page.category();
  var name = page.fullName();
  var opts = this.options;

  // all pages
  if (opts.trackAllPages) {
    this.track(page.track());
  }

  // categorized pages
  if (category && opts.trackCategorizedPages) {
    this.track(page.track(category));
  }

  // named pages
  if (name && opts.trackNamedPages) {
    this.track(page.track(name));
  }
};

/**
 * Identify.
 *
 * @param {Facade} identify
 */

Amplitude.prototype.identify = function(identify){
  var id = identify.userId();
  var traits = identify.traits();
  if (id) window.amplitude.setUserId(id);
  if (traits) window.amplitude.setGlobalUserProperties(traits);
};

/**
 * Track.
 *
 * @param {Track} event
 */

Amplitude.prototype.track = function(track){
  var props = track.properties();
  var event = track.event();
  window.amplitude.logEvent(event, props);
};

/**
 * Set domain name to root domain
 *
 * @param {String} href
 */

Amplitude.prototype.setDomain = function(href){
  var domain = top(href);
  window.amplitude.setDomain(domain);
};

/**
 * Set campaign params as global user properties
 *
 * @param {String} query
 */

Amplitude.prototype.setGlobalUserProperties = function(query){
  var campaign = utm(query);
  // switch name to campaign so it doesn't conflict with the user's name
  var campaignName = campaign.name;
  campaign.campaign = campaignName;
  delete campaign.name;
  if (campaign) window.amplitude.setGlobalUserProperties(campaign);
};
