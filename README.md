 Motivating use-case
-----------------------
I needed a slider that could be used to choose choose a list of probabilities that always add up to 1.  
I could have used a text input or slider for each probability and link it up so that changing one would
update the others, but that's a fairly clunky interaction.   This approach isn't perfect, but I think
it's better...

Usage
-------
###Get it

`bower install angular-multirange-slider`

###Include it in your html and your js
```html
<script src="YOUR_BOWER_COMPONENTS/angular-multirange-slider/dist/multirange-slider.js"></script>
```

```
angular.module("YOUR ANGULAR MODULE", ['at.multirange-slider'])
```


###Use it
```html
<slider [step="{step}"]>
  <slider-range model="{assignable_model_value}" ng-repeat="{repeat_expression}">
    <div class="slider-handle">&larr;&rarr;</div>
  </slider-range>
</slider>
```

```html
<slider [step="{step}"]>
  <slider-range model="{assignable_model_value}" ng-repeat="{repeat_expression}">
    <div class="..." slider-handle>&larr;&rarr;</div>
  </slider-range>
</step>
```

`{repeat expression}` a standard [ngRepeat](https://docs.angularjs.org/api/ng/directive/ngRepeat)
comprehension.  Something like `(key,val) in mapObject` or `val in arrayThingy`.

`assignable_model_value` is almost always something like `val.propertyName`.

`step` is an optional attribute that locks the values into multiples of `{step size}`.

The handles are created by the [slider-handle directive](/src/multirange-slider.coffee#L82), which
can be set by class or attribute.

[Examples](/dist/example.html).

###Style it
The markup generated is a containing `div` (`.slider-control`), a `div` for the actual slider bar
(`.slider`) and an inline-block `div` for each slider range (`.slider-range`).
The ranges are children of the slider div, and their positioning is a percentage
of the slider's width, so the whole thing *should* stretch/shrink to fit its containing element.
The handles (`.slider-handle`) are floating right within the `slider-range` divs, with some margin tweaks so that they
sit nicely centered on the border between ranges.

For reference, the resulting markup from the first example:

```html
<div class="at-multirange-slider">
  <div class="slider" ng-transclude="" style="position: relative;">
        <div class="slider-range ng-scope" ng-transclude="" model="val.p"
          ng-repeat="(key,val) in otherProbs"
          style="width: calc(21.4071428571429% - 0px); margin-left: 0px;">
          <div class="slider-handle ng-scope" style="float: right; margin-right: -15.5px;">←→</div>
        </div>
        <div class="slider-range ng-scope" ng-transclude="" model="val.p"
        ng-repeat="(key,val) in otherProbs"
        style="width: calc(35.6785714285714% - 16px); margin-left: 16px;">
          <div class="slider-handle ng-scope" style="float: right; margin-right: -15.5px;">←→</div>
        </div>
        <div class="slider-range ng-scope" ng-transclude="" model="val.p"
        ng-repeat="(key,val) in otherProbs"
        style="width: calc(42.8142857142857% - 15.5px); margin-left: 15.5px;">
          <!-- Notice that this one doesn't have a handle in it, because it's the last. -->
        </div>
      </div>
</div>
```

Todo
------
* Touch events
