# Summernote::Rails

This gem was built to package the assets used in Summernote, the Super Simple WYSIWYG Editor on Bootstrap, for Ruby on Rails version >= 3.1.

https://github.com/summernote/summernote-rails.

The version of summernote-rails is matched with that of summernote editor.

[![Gem Version](https://badge.fury.io/rb/summernote-rails.png)](http://badge.fury.io/rb/summernote-rails)

## Installation

Add the following gems to your application's Gemfile:

```ruby
gem 'summernote-rails'
gem 'font-awesome-rails' # required
gem 'bootstrap-sass'     # required
```

And then execute:

```bash
$ bundle install
```

## Usage

In app/assets/stylesheets/application.scss,

```css
@import "bootstrap";
@import "font-awesome";
@import "summernote";
```

In app/assets/javascripts/application.js, you should add as follows:

```js
//= require ...
//= require bootstrap
//= require summernote
//= require ...
```

Basic Example:

```html
<div id="summernote">Hello Summernote</div>
```

In app/assets/javascripts/summernote_bootstraped.coffee, you should add the following:

```coffee
$ ->
  $('#summernote').summernote()
```

Ideally, you would do it like this:

```javscript
# This goes into your main javascript file. Customize as you need.

$('[data-provider="summernote"]').each(function(){
  $(this).summernote({ });
})
```

Then, if you are using simple_form, you can use the `:summernote` input type. This input types simply adds the `data-provider="summernote"` to the field.

```haml
= simple_form_for(:example) do |f|
  = f.input :text, as: :summernote
```

If you are not using simple_form, then simply add the `data-provider="summernote"` to the input field yourself.

### i18n Support

If you use i18n, you have to include language files. In `app/assets/javascripts/application.js`, you should add the following:

```javascript
// load all locales
//= require summernote/locales

// or

// load specific locale(ko-KR)
//= require summernote/locales/ko-KR
```

and update summernote option

```html
<div id="summernote">Hello Summernote</div>
```

In app/assets/javascripts/summernote_bootstraped.coffee, you should add as follows:

```coffee
$ ->
  $('#summernote').summernote
    lang: 'ko-KR'
```


### Plugin

If you want to use a plugin, you have to include the corresponding file. In `app/assets/javascripts/application.js`, you should add the following:

```js
// load video plugin
//= require summernote/plugin/summernote-ext-video.js
```

and update summernote option.

```html
<div id="summernote">Hello Summernote</div>
```

In app/assets/javascripts/summernote_bootstraped.coffee, you should add as follows:

```coffee
  $ ->
    $('#summernote').summernote
      toolbar : [
        ...
        [
          'group'
            [ 
              'video' 
            ]
        ]
        ...
      ]
```

* [plugin example](https://github.com/summernote/summernote/blob/develop/examples/plugin-video.html)


## Sample projects

For an example, take a look at the summernote-rails-test folder in this repository.

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
