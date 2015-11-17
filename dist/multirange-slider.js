var sliderDirective, sliderHandleDirective, sliderRangeDirective;

angular.module('at.multirange-slider', []);

sliderDirective = function($parse, $compile) {
  var sliderController;
  sliderController = function($scope, $element, $attrs) {
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
      var handle, i, j, len, len1, pRunningTotal, range, ref, ref1, results, total;
      this._width = $element.prop('clientWidth');
      pRunningTotal = 0;
      total = this.pTotal();
      ref = this.ranges;
      for (i = 0, len = ref.length; i < len; i++) {
        range = ref[i];
        pRunningTotal += range.value();
        range.update(pRunningTotal, total);
      }
      ref1 = this.handles;
      results = [];
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        handle = ref1[j];
        results.push(handle.updateWidth());
      }
      return results;
    };
    this.elementWidth = function() {
      return this._width - this.handles.reduce(function(sum, handle) {
        return sum + handle.width();
      }, 0);
    };
    return this;
  };
  sliderController.$inject = ['$scope', '$element', '$attrs'];
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    template: "<div class=\"at-multirange-slider\">\n  <div class=\"slider\" ng-transclude>\n  </div>\n</div>",
    link: function(scope, element, attrs, ctrl) {
      return element.children().css('position', 'relative');
    },
    controller: sliderController
  };
};

sliderRangeDirective = function($parse) {
  var sliderRangeController;
  sliderRangeController = function($scope) {
    return {};
  };
  sliderRangeController.$inject = ["$scope"];
  return {
    template: "<div class=\"slider-range\" ng-transclude>\n</div>",
    require: ['^slider', 'sliderRange'],
    restrict: 'E',
    replace: true,
    transclude: true,
    controller: sliderRangeController,
    compile: function() {
      return {
        pre: function(scope, element, attrs, arg) {
          var range, slider, valueFn;
          slider = arg[0], range = arg[1];
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
        post: function(scope, element, attrs, arg) {
          var range, slider;
          slider = arg[0], range = arg[1];
          return element.on('$destroy', function() {
            slider.ranges.splice(slider.ranges.indexOf(range), 1);
            return slider.updateRangeWidths();
          });
        }
      };
    }
  };
};

sliderHandleDirective = function($document) {
  return {
    replace: false,
    restrict: 'AC',
    require: ['^slider', '^sliderRange'],
    link: function(scope, element, attrs, arg, transclude) {
      var handle, nextRange, range, slider, startPleft, startPright, startX;
      slider = arg[0], range = arg[1];
      nextRange = function() {
        return slider.ranges[slider.ranges.indexOf(range) + 1];
      };
      slider.handles.push(handle = {
        _width: 0,
        width: function() {
          return this._width;
        },
        updateWidth: function() {
          var ref;
          this._width = element.prop('clientWidth');
          element.css({
            float: 'right',
            marginRight: -handle.width() / 2 + 'px'
          });
          return (ref = nextRange()) != null ? ref.adjustWidth(handle.width() / 2 + 'px') : void 0;
        }
      });
      startX = 0;
      startPleft = startPright = 0;
      return element.on('mousedown', function(event) {
        var mousemove, mouseup, ref;
        if (nextRange() == null) {
          return;
        }
        mousemove = function(event) {
          return scope.$apply(function() {
            var dp, ref;
            dp = (event.screenX - startX) / slider.elementWidth() * slider.pTotal();
            if (dp < -startPleft || dp > startPright) {
              return;
            }
            range.value(startPleft + dp);
            if ((ref = nextRange()) != null) {
              ref.value(startPright - dp);
            }
            return slider.updateRangeWidths();
          });
        };
        mouseup = function() {
          $document.unbind('mousemove', mousemove);
          return $document.unbind('mouseup', mouseup);
        };
        event.preventDefault();
        startX = event.screenX;
        startPleft = range.value();
        startPright = (ref = nextRange()) != null ? ref.value() : void 0;
        $document.on('mousemove', mousemove);
        return $document.on('mouseup', mouseup);
      });
    }
  };
};

sliderDirective.$inject = ['$parse', '$compile'];

sliderRangeDirective.$inject = ['$parse'];

sliderHandleDirective.$inject = ['$document'];

angular.module('at.multirange-slider').directive('slider', sliderDirective).directive('sliderRange', sliderRangeDirective).directive('sliderHandle', sliderHandleDirective);
