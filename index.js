'use strict';

var isPresent = require('is-present');

function hasClassSelector(selector) {
  if (typeof selector != 'string') {
    throw new TypeError('has-class-selector expected a string');
  }

  return /\./.test(selector) || /^\[class/.test(selector);
}

module.exports = function classPrefix(prefix, options) {
  options = options || {};
  var ignored = options.ignored;

  return function prefixRules(styling) {
    styling.rules.forEach(function(rule) {

      if (rule.rules) {
        return prefixRules(rule);
      }

      if (!rule.selectors) return rule;

      rule.selectors = rule.selectors.map(function(selector) {
        var shouldIgnore = false;

        if (hasClassSelector(selector)) {
          // Ensure that the selector doesn't match the ignored list
          if (isPresent(ignored)) {
            shouldIgnore = ignored.some(function(opt) {
              if (typeof opt == 'string') {
                return selector === opt;
              } else if (opt instanceof RegExp) {
                return opt.exec(selector);
              }
            });
          }

          // match '.icon'
          if (/\./.test(selector)) {
            return shouldIgnore ? selector : selector.split('.').join('.' + prefix);
          }

          // match '[class^="icon-"], [class*=' icon-']'
          if (/^\[class/.test(selector)) {
            var r = selector.split(/\"|\'/)[1].toString().trim();
            var reg = new RegExp(r, "g");
            return selector.replace(reg, prefix + r);
          }

        } else {
          return selector;
        }
      });
    });
  };
};
