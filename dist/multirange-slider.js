angular.module("at.multirange-slider", []);

angular.module("at.multirange-slider").directive("slider", function($parse, $compile) {
  return {
    restrict: "E",
    replace: true,
    transclude: true,
    template: "<div class=\"at-multirange-slider\">\n  <div class=\"slider\" ng-transclude>\n  </div>\n</div>",
    link: function(scope, element, attrs, ctrl) {
      return element.children().css('position', 'relative');
    },
    controller: function($scope, $element, $attrs) {
      var get;
      this.ranges = [];
      this.handles = [];
      this.pTotal = function() {
        return this.ranges.reduce((function(sum, range) {
          return sum + range.value();
        }), 0);
      };
      this.step = ($attrs.step != null) ? (get = $parse($attrs.step), function() {
        return parseFloat(get());
      }) : function() {
        return 0;
      };
      this._width = 0;
      this.updateRangeWidths = function() {
        var handle, pRunningTotal, range, total, _i, _j, _len, _len1, _ref, _ref1, _results;
        this._width = $element.prop('clientWidth');
        pRunningTotal = 0;
        total = this.pTotal();
        _ref = this.ranges;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          range = _ref[_i];
          pRunningTotal += range.value();
          range.update(pRunningTotal, total);
        }
        _ref1 = this.handles;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          handle = _ref1[_j];
          _results.push(handle.updateWidth());
        }
        return _results;
      };
      return this.elementWidth = function() {
        return this._width - this.handles.reduce(function(sum, handle) {
          return sum + handle.width();
        }, 0);
      };
    }
  };
}).directive("sliderRange", function($parse) {
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
          var range, slider, valueFn;
          slider = _arg[0], range = _arg[1];
          valueFn = $parse(attrs.model);
          slider.ranges.push(range);
          scope.$watch(attrs.model, (function() {
            return slider.updateRangeWidths();
          }));
          return angular.extend(range, {
            widthAdjustment: '0px',
            value: function(_) {
              var s;
              if (_ == null) {
                return parseFloat('' + valueFn(scope, {}), 10);
              }
              s = slider.step();
              if (s > 0) {
                _ = Math.round(_ / s) * s;
              }
              return valueFn.assign(scope, _);
            },
            update: function(runningTotal, total) {
              var rangeWidth, x;
              x = runningTotal / total * 100;
              rangeWidth = this.value() / total * 99.9;
              return element.css({
                width: rangeWidth * slider.elementWidth() / 100 > 1 ? "calc(" + rangeWidth + "% - " + this.widthAdjustment + ")" : '0',
                'margin-left': this.widthAdjustment
              });
            },
            adjustWidth: function(margin) {
              return this.widthAdjustment = margin;
            }
          });
        },
        post: function(scope, element, attrs, _arg) {
          var range, slider;
          slider = _arg[0], range = _arg[1];
          return element.on('$destroy', function() {
            slider.ranges.splice(slider.ranges.indexOf(range), 1);
            return slider.updateRangeWidths();
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
      var handle, nextRange, range, slider, startPleft, startPright, startX;
      slider = _arg[0], range = _arg[1];
      nextRange = function() {
        return slider.ranges[slider.ranges.indexOf(range) + 1];
      };
      slider.handles.push(handle = {
        _width: 0,
        width: function() {
          return this._width;
        },
        updateWidth: function() {
          var _ref;
          this._width = element.prop('clientWidth');
          element.css({
            float: 'right',
            marginRight: -handle.width() / 2 + 'px'
          });
          return (_ref = nextRange()) != null ? _ref.adjustWidth(handle.width() / 2 + 'px') : void 0;
        }
      });
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
