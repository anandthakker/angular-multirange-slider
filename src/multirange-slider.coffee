angular.module("at.multirange-slider", [])

angular.module("at.multirange-slider")
.directive "slider", ($parse, $compile)->
  restrict: "E"
  replace: true
  transclude: true
  scope: true
  template: """
<div class="at-multirange-slider">
  <div class="slider">
    <slider-range ng-repeat="REPLACEME">
      <div ng-transclude></div>
    </slider-range>

  </div>
</div>
  """
  compile: (element, attrs, transclude)->
    # coffeelint: disable=max_line_length
    # Following based on https://github.com/angular/angular.js/blob/master/src/ng/directive/select.js#L146
    #                            00011111111110000000002222333333333333333000000000444444444444444000000055555555555555500000000000000066666666662
    match = attrs.model?.match /^\s*([\s\S]+?)\s+for\s+((?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+))$/
    # coffeelint: enable=max_line_length

    repeaterExp = match[2]
    valueFn = $parse(match[1])
    collectionExp = match[6]
    
    element.children().children().attr('ng-repeat',repeaterExp)

    pre: (scope, element, attrs, ctrl, transclude)->
      ctrl.valueFn = valueFn
    post: (scope, element, attrs, ctrl)->
      element.children().css('position', 'relative')
      scope.$watch collectionExp, (->ctrl.updateRangeWidths()), true
    
  controller: ($scope, $element, $attrs) -> sliderController =
    ranges: []
    pTotal: ->@ranges.reduce ((sum, range)->sum+range.value()), 0
    step: if($attrs.step?)
      get = $parse($attrs.step)
      -> parseFloat(get())
    else
      -> 0
    updateRangeWidths: ->
      pRunningTotal = 0
      for range in @ranges
        pRunningTotal += range.value()
        range.update(pRunningTotal, @pTotal())
        
    elementWidth: ->
      $element.prop('clientWidth')


.directive "sliderRange", ()->
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
      slider.ranges.push(range)
      angular.extend range,
        value: (_) ->
          if not _? then return parseFloat(''+slider.valueFn(scope, {}), 10)
          s = slider.step()
          if s > 0
            _ = Math.round(_/s) * s
          slider.valueFn.assign(scope, _)
          
        update: (runningTotal, total)->
          x = runningTotal/total * 100
          rangeWidth = @value()/total*99
          element.css
            # left: x + "%"
            # top: "-" + element.prop("clientHeight")/2 + "px"
            width: rangeWidth + "%"
      
    # post: (scope, element, attrs, ctrl, transclude)->
    #   element.css("position", "absolute")

.directive 'sliderHandle', ($document)->
  replace: false
  restrict: 'AC'
  require: ['^slider', '^sliderRange']
  link: (scope, element, attrs, [slider, range], transclude)->

    nextRange = -> slider.ranges[slider.ranges.indexOf(range) + 1]
    
    if scope.$last
      element.remove()

    startX = 0
    startPleft = startPright = 0

    element.on "mousedown", (event) ->
      return unless nextRange()?
      mousemove = (event) -> scope.$apply ()->
        dp = (event.screenX - startX) / slider.elementWidth() * slider.pTotal()
        console.log dp
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

  
  
