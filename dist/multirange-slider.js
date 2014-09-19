angular.module("at.multirange-slider", []);

angular.module("at.multirange-slider").directive("slider", function($parse, $compile) {
  return {
    restrict: "E",
    replace: true,
    scope: true,
    template: "<div class=\"slider-control\">\n</div>",
    compile: function(element, attrs) {
      var collectionExp, match, repeaterExp, valueFn, _ref;
      match = (_ref = attrs.model) != null ? _ref.match(/^\s*([\s\S]+?)\s+for\s+((?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+))$/) : void 0;
      repeaterExp = match[2];
      collectionExp = match[6];
      valueFn = $parse(match[1]);
      console.log(repeaterExp);
      return {
        pre: function(scope, element, attrs, ctrl) {
          var compiled;
          ctrl.valueFn = valueFn;
          compiled = $compile("<div class=\"slider\">\n  <slider-handle ng-repeat=\"" + repeaterExp + "\"></slider-handle>\n</div>")(scope);
          return element.append(compiled);
        },
        post: function(scope, element, attrs, ctrl) {
          element.children().css('position', 'relative');
          return scope.$watch(collectionExp, (function() {
            return ctrl.updatePositions();
          }), true);
        }
      };
    },
    controller: function($scope, $element, $attrs) {
      var get, sliderController;
      return sliderController = {
        handles: [],
        pTotal: function() {
          return this.handles.reduce((function(sum, handle) {
            return sum + handle.proportion();
          }), 0);
        },
        step: ($attrs.step != null) ? (get = $parse($attrs.step), function() {
          return parseFloat(get());
        }) : function() {
          return 0;
        },
        updatePositions: function() {
          var handle, pRunningTotal, _i, _len, _ref, _results;
          pRunningTotal = 0;
          _ref = this.handles;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            handle = _ref[_i];
            pRunningTotal += handle.proportion();
            _results.push(handle.update(pRunningTotal, this.pTotal()));
          }
          return _results;
        }
      };
    }
  };
}).directive("sliderHandle", function($document) {
  return {
    template: "<div class=\"slider-handle\"></div>",
    require: '^slider',
    restrict: 'E',
    replace: true,
    link: function(scope, element, attrs, ctrl) {
      var handle, nextHandle, startPleft, startPright, startX;
      ctrl.handles.push(handle = {
        proportion: function(_) {
          var s;
          if (_ == null) {
            return parseFloat('' + ctrl.valueFn(scope, {}), 10);
          }
          s = ctrl.step();
          if (s > 0) {
            _ = Math.round(_ / s) * s;
          }
          return ctrl.valueFn.assign(scope, _);
        },
        update: function(runningTotal, total) {
          var p, x;
          p = this.proportion();
          x = runningTotal / total * 100;
          element.css({
            left: x + "%",
            top: "-" + element.prop("clientHeight") / 2 + "px"
          });
          return this.proportion();
        }
      });
      nextHandle = function() {
        return ctrl.handles[ctrl.handles.indexOf(handle) + 1];
      };
      startX = 0;
      startPleft = startPright = 0;
      element.css("position", "absolute");
      return element.on("mousedown", function(event) {
        var mousemove, mouseup, _ref;
        if (nextHandle() == null) {
          return;
        }
        mousemove = function(event) {
          return scope.$apply(function() {
            var dp, _ref;
            dp = (event.screenX - startX) / element.parent().prop("clientWidth") * ctrl.pTotal();
            if (dp < -startPleft || dp > startPright) {
              return;
            }
            handle.proportion(startPleft + dp);
            if ((_ref = nextHandle()) != null) {
              _ref.proportion(startPright - dp);
            }
            return ctrl.updatePositions();
          });
        };
        mouseup = function() {
          $document.unbind("mousemove", mousemove);
          return $document.unbind("mouseup", mouseup);
        };
        event.preventDefault();
        startX = event.screenX;
        startPleft = handle.proportion();
        startPright = (_ref = nextHandle()) != null ? _ref.proportion() : void 0;
        $document.on("mousemove", mousemove);
        return $document.on("mouseup", mouseup);
      });
    }
  };
});
