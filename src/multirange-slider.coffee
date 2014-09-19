angular.module("at.multirange-slider", [])

angular.module("at.multirange-slider")
.directive "slider", ($parse, $compile)->
  restrict: "E"
  replace: true
  scope: true
  template: """
<div class="slider-control">
</div>
  """
  compile: (element, attrs)->
    # coffeelint: disable=max_line_length
    # Following based on https://github.com/angular/angular.js/blob/master/src/ng/directive/select.js#L146
    #                            00011111111110000000002222333333333333333000000000444444444444444000000055555555555555500000000000000066666666662
    match = attrs.model?.match /^\s*([\s\S]+?)\s+for\s+((?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+))$/
    # coffeelint: enable=max_line_length

    repeaterExp = match[2]
    collectionExp = match[6]
    valueFn = $parse(match[1])

    console.log repeaterExp

    pre: (scope, element, attrs, ctrl)->
      ctrl.valueFn = valueFn
      
      compiled = $compile("""
      <div class="slider">
        <slider-handle ng-repeat="#{repeaterExp}"></slider-handle>
      </div>
      """)(scope)
      element.append(compiled)
      
    post: (scope, element, attrs, ctrl)->
      element.children().css('position', 'relative')
      scope.$watch collectionExp, (->ctrl.updatePositions()), true
    
  controller: ($scope, $element, $attrs) -> sliderController =
    handles: []
    pTotal: ->@handles.reduce ((sum, handle)->sum+handle.proportion()), 0
    step: if($attrs.step?)
      get = $parse($attrs.step)
      -> parseFloat(get())
    else
      -> 0
    updatePositions: ->
      pRunningTotal = 0
      for handle in @handles
        pRunningTotal += handle.proportion()
        handle.update(pRunningTotal, @pTotal())



.directive "sliderHandle", ($document)->
  template: """
<div class="slider-handle"></div>
  """
  require: '^slider'
  restrict: 'E'
  replace: true
  
  link: (scope, element, attrs, ctrl)->
    ctrl.handles.push(handle=
      proportion: (_) ->
        if not _? then return parseFloat(''+ctrl.valueFn(scope, {}), 10)
        s = ctrl.step()
        if s > 0
          _ = Math.round(_/s) * s
        ctrl.valueFn.assign(scope, _)
        
      update: (runningTotal, total)->
        p = @proportion()
        x = runningTotal/total * 100 #element.prop("clientWidth")
        element.css
          left: x + "%"
          top: "-" + element.prop("clientHeight")/2 + "px"
        @proportion()
    )
    
    nextHandle = -> ctrl.handles[ctrl.handles.indexOf(handle) + 1]

    startX = 0
    startPleft = startPright = 0

    element.css("position", "absolute")
    element.on "mousedown", (event) ->
      return unless nextHandle()?
      mousemove = (event) -> scope.$apply ()->
        dp = (event.screenX - startX) /
          element.parent().prop("clientWidth") * ctrl.pTotal()
        return if dp < -startPleft or dp > startPright
        handle.proportion(startPleft+dp)
        nextHandle()?.proportion(startPright-dp)
        ctrl.updatePositions()

      mouseup = ->
        $document.unbind "mousemove", mousemove
        $document.unbind "mouseup", mouseup

      # Prevent default dragging of selected content
      event.preventDefault()
      startX = event.screenX
      startPleft = handle.proportion()
      startPright = nextHandle()?.proportion()
      $document.on "mousemove", mousemove
      $document.on "mouseup", mouseup
