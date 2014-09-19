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
<slider model="{repeat expression}" [step="{step size}"]></slider>
```

`{repeat expression}` is one of:
 - `assignable_exp for val in arrayExpression`
 - `assignable_exp for (key, val) in objectExpression`

where `assignable_exp` is almost always something like `val.propertyName`.

`step` is an optional attribute that locks the values into multiples of `{step size}`.

See the [example](/dist/example.html)

###Style it
The markup generated is a containing `div` (`.slider-control`), a `div` for the actual slider bar (`.slider`, the js sets `position: relative`), and an absolutely-positioned `div` for each handle (`.slider-handle`).  The handles are children of the slider div, and their positioning is a percentage of the slider's width, so the whole thing *should* stretch/shrink to fit its containing element.  For example:

```html
<div class="slider-control ng-isolate-scope" model="otherProbs">
  <div class="slider" style="position: relative;">
    <div class="slider-handle" style="position: absolute; left: 30%; top: -8px;"></div>
    <div class="slider-handle" style="position: absolute; left: 60%; top: -8px;"></div>
  </div>
</div>
```

Todo
------
* Option for labeling ranges?
