angular.module("at.multirange-slider", []);

angular.module("at.multirange-slider").directive("slider", function($parse, $compile) {
  return {
    restrict: "E",
    replace: true,
    transclude: true,
    scope: true,
    template: "<div class=\"at-multirange-slider\">\n  <div class=\"slider\">\n    <slider-range ng-repeat=\"REPLACEME\">\n      <div ng-transclude></div>\n    </slider-range>\n\n  </div>\n</div>",
    compile: function(element, attrs, transclude) {
      var collectionExp, match, repeaterExp, valueFn, _ref;
      match = (_ref = attrs.model) != null ? _ref.match(/^\s*([\s\S]+?)\s+for\s+((?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+))$/) : void 0;
      repeaterExp = match[2];
      valueFn = $parse(match[1]);
      collectionExp = match[6];
      element.children().children().attr('ng-repeat', repeaterExp);
      return {
        pre: function(scope, element, attrs, ctrl, transclude) {
          return ctrl.valueFn = valueFn;
        },
        post: function(scope, element, attrs, ctrl) {
          element.children().css('position', 'relative');
          return scope.$watch(collectionExp, (function() {
            return ctrl.updateRangeWidths();
          }), true);
        }
      };
    },
    controller: function($scope, $element, $attrs) {
      var get, sliderController;
      return sliderController = {
        ranges: [],
        pTotal: function() {
          return this.ranges.reduce((function(sum, range) {
            return sum + range.value();
          }), 0);
        },
        step: ($attrs.step != null) ? (get = $parse($attrs.step), function() {
          return parseFloat(get());
        }) : function() {
          return 0;
        },
        updateRangeWidths: function() {
          var pRunningTotal, range, _i, _len, _ref, _results;
          pRunningTotal = 0;
          _ref = this.ranges;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            range = _ref[_i];
            pRunningTotal += range.value();
            _results.push(range.update(pRunningTotal, this.pTotal()));
          }
          return _results;
        },
        elementWidth: function() {
          return $element.prop('clientWidth');
        }
      };
    }
  };
}).directive("sliderRange", function() {
  return {
    template: "<div class=\"slider-range\" ng-transclude>\n</div>",
    require: ['^slider', 'sliderRange'],
    restrict: 'E',
    replace: true,
    transclude: true,
    controller: function($scope) {
      return {};
    },
    compile: function() {
      return {
        pre: function(scope, element, attrs, _arg) {
          var range, slider;
          slider = _arg[0], range = _arg[1];
          slider.ranges.push(range);
          return angular.extend(range, {
            value: function(_) {
              var s;
              if (_ == null) {
                return parseFloat('' + slider.valueFn(scope, {}), 10);
              }
              s = slider.step();
              if (s > 0) {
                _ = Math.round(_ / s) * s;
              }
              return slider.valueFn.assign(scope, _);
            },
            update: function(runningTotal, total) {
              var rangeWidth, x;
              x = runningTotal / total * 100;
              rangeWidth = this.value() / total * 99;
              return element.css({
                width: rangeWidth + "%"
              });
            }
          });
        }
      };
    }
  };
}).directive('sliderHandle', function($document) {
  return {
    replace: false,
    restrict: 'AC',
    require: ['^slider', '^sliderRange'],
    link: function(scope, element, attrs, _arg, transclude) {
      var nextRange, range, slider, startPleft, startPright, startX;
      slider = _arg[0], range = _arg[1];
      nextRange = function() {
        return slider.ranges[slider.ranges.indexOf(range) + 1];
      };
      if (scope.$last) {
        element.remove();
      }
      startX = 0;
      startPleft = startPright = 0;
      return element.on("mousedown", function(event) {
        var mousemove, mouseup, _ref;
        if (nextRange() == null) {
          return;
        }
        mousemove = function(event) {
          return scope.$apply(function() {
            var dp, _ref;
            dp = (event.screenX - startX) / slider.elementWidth() * slider.pTotal();
            console.log(dp);
            if (dp < -startPleft || dp > startPright) {
              return;
            }
            range.value(startPleft + dp);
            if ((_ref = nextRange()) != null) {
              _ref.value(startPright - dp);
            }
            return slider.updateRangeWidths();
          });
        };
        mouseup = function() {
          $document.unbind("mousemove", mousemove);
          return $document.unbind("mouseup", mouseup);
        };
        event.preventDefault();
        startX = event.screenX;
        startPleft = range.value();
        startPright = (_ref = nextRange()) != null ? _ref.value() : void 0;
        $document.on("mousemove", mousemove);
        return $document.on("mouseup", mouseup);
      });
    }
  };
});
