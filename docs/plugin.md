# Plugin

If you want to use a plugin, you have to include the corresponding file.

In `app/assets/javascripts/application.js`, you should add the following:

```javascript
// load hello plugin
//= require summernote/plugin/hello/summernote-ext-hello
```

Then, update Summernote's initialization options:

```javascript
$(function () {
    'use strict';
    $('[data-provider="summernote"]').each(function () {
        $(this).summernote({
          height: 300,
          toolbar : [
            // ...
            ['insert', ['hello']]
          ]
        });
});
```

* [plugin example](https://github.com/summernote/summernote/blob/master/examples/plugin-hello.html)