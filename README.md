# Summernote::Rails

This gem was built to package the assets used in Summernote, the Super Simple WYSIWYG Editor on Bootstrap, for Ruby on Rails version >= 3.1.

https://github.com/summernote/summernote-rails.

The version of summernote-rails is matched with that of summernote editor.

[![Gem Version](https://badge.fury.io/rb/summernote-rails.png)](http://badge.fury.io/rb/summernote-rails)

## Installation

Add the following gems to your application's Gemfile:

```ruby
gem 'summernote-rails'
```

And then execute:

```bash
$ bundle install
```

You will also need Bootstrap and FontAwesome. Get them here:

* https://github.com/twbs/bootstrap-sass
* https://github.com/bokmann/font-awesome-rails

## Usage

In app/assets/stylesheets/application.css.scss,

```css
*= require summernote
*= require summernote/bs3

Or if you are using bootstrap 2:
*= require summernote/bs2
```

In app/assets/javascripts/application.js, you should add the following:

```js
//= require summernote
```

Basic Example:
```html
<div id="summernote">Hello Summernote</div>

<script type="text/javascript">
  $(document).ready(function() {
    $('#summernote').summernote();
  });
</script>
```

Ideally, you would do it like this:

```
# This goes into your main javascript file. Customize as you need.

$('[data-provider="summernote"]').each(function(){
  $(this).summernote({ });
})
```

Then, if you are using simple_form, you can use the `:summernote` input type. This input types simply adds the `data-provider="summernote"` to the field.

```
= simple_form_for(:example) do |f|
  = f.input :text, as: :summernote
```

If you are not using simple_form, then simply add the `data-provider="summernote"` to the input field yourself.

## Sample projects

For an example, take a look at the summernote-rails-test folder in this repository.

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
