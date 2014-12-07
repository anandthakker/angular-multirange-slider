angular.module("at.multirange-slider", [])

angular.module("at.multirange-slider")
.directive "slider", ($parse, $compile)->
  restrict: "E"
  replace: true
  transclude: true
  template: """
<div class="at-multirange-slider">
  <div class="slider" ng-transclude>
  </div>
</div>
  """
  link: (scope, element, attrs, ctrl)->
    element.children().css('position', 'relative')

  controller: ($scope, $element, $attrs) ->
    @ranges = []
    @handles = []
    @pTotal = ->@ranges.reduce ((sum, range)->sum+range.value()), 0
    @step = if($attrs.step?)
      get = $parse($attrs.step)
      -> parseFloat(get())
    else
      -> 0

    @_width = 0
    @updateRangeWidths = ->
      @_width = $element.prop('clientWidth')

      pRunningTotal = 0
      total = @pTotal()
      for range in @ranges
        pRunningTotal += range.value()
        range.update(pRunningTotal, total)
      handle.updateWidth() for handle in @handles

    @elementWidth = ->
      @_width - @handles.reduce (sum, handle) ->
        sum+handle.width()
      , 0

.directive "sliderRange", ($parse)->
  template: """
<div class="slider-range" ng-transclude>
</div>
  """
  require: ['^slider', 'sliderRange']
  restrict: 'E'
  replace: true
  transclude: true
  controller: ($scope)->
    {} # filled in during pre-link.

  compile: ->
    pre: (scope, element, attrs, [slider, range]) ->
      valueFn = $parse(attrs.model)
      slider.ranges.push(range)
      scope.$watch attrs.model, (->slider.updateRangeWidths())
      angular.extend range,
        widthAdjustment: '0px'
        value: (_) ->
          if not _? then return parseFloat(''+valueFn(scope, {}), 10)
          s = slider.step()
          if s > 0
            _ = Math.round(_/s) * s
          valueFn.assign(scope, _)

        update: (runningTotal, total)->
          x = runningTotal/total * 100
          rangeWidth = @value()/total*99.9
          element.css
            width: if rangeWidth*slider.elementWidth()/100 > 1
              "calc(#{rangeWidth}% - #{@widthAdjustment})"
            else
              '0'
            'margin-left': @widthAdjustment

        adjustWidth: (margin)->
          @widthAdjustment = margin
    
    post: (scope, element, attrs, [slider, range]) ->
      element.on('$destroy', ->
        slider.ranges.splice(slider.ranges.indexOf(range), 1)
        slider.updateRangeWidths()
      )

.directive 'sliderHandle', ($document)->
  replace: false
  restrict: 'AC'
  require: ['^slider', '^sliderRange']
  link: (scope, element, attrs, [slider, range], transclude)->

    nextRange = -> slider.ranges[slider.ranges.indexOf(range) + 1]

    slider.handles.push handle=
      _width: 0
      width: -> @_width
      updateWidth: ->
        @_width = element.prop('clientWidth')
        element.css(
          float: 'right'
          marginRight: - handle.width()/2 + 'px'
        )
        nextRange()?.adjustWidth(handle.width()/2 + 'px')

    startX = 0
    startPleft = startPright = 0

    element.on "mousedown", (event) ->
      return unless nextRange()?
      mousemove = (event) -> scope.$apply ()->
        dp = (event.screenX - startX) / slider.elementWidth() * slider.pTotal()
        return if dp < -startPleft or dp > startPright
        range.value(startPleft+dp)
        nextRange()?.value(startPright-dp)
        slider.updateRangeWidths()

      mouseup = ->
        $document.unbind "mousemove", mousemove
        $document.unbind "mouseup", mouseup

      # Prevent default dragging of selected content
      event.preventDefault()
      startX = event.screenX
      startPleft = range.value()
      startPright = nextRange()?.value()
      $document.on "mousemove", mousemove
      $document.on "mouseup", mouseup
