# Summernote Rails

This gem was built to package the assets used in Summernote, the Super Simple WYSIWYG Editor, for Ruby on Rails version >= 3.1.

The version of summernote-rails is matched with that of original summernote editor.

[![Gem Version](https://badge.fury.io/rb/summernote-rails.svg)](https://badge.fury.io/rb/summernote-rails)

> Note: From Rails 6+, webpack is used as the default javascript package (or module) bundler. Therefore, without summernote-rails, you can use the summernote javascript package using webpacker gem in Rails 6+. If you want to know about it more, you can visit [here](https://github.com/luciuschoi/welcome_rails6/tree/features/summernote#5-summernote).

## Installation

Environments:
- Ruby 2.7.5
- Gems :
  - Rails
  - Simple Form *(optional)*
  - Bootstrap *(optional)*

Add the following gems to your application's Gemfile:

```ruby
gem 'rails'
gem 'jquery-rails'
gem 'bootstrap' # optional
gem 'simple_form' # optional
gem 'summernote-rails', '~> 0.8.20.0'
```

And then execute:

```bash
$ bundle install
```

## Import assets

### Lite version (without Bootstrap)

```scss
@import "summernote-lite";
```

In app/assets/javascripts/application.js, you should add as follows:

```javascript
//= require jquery
//= require jquery_ujs
//= require summernote/summernote-lite.min
//= require_tree .
```

### Bootstrap 5 version

```scss
@import "bootstrap";
@import "summernote-bs5";
```

In app/assets/javascripts/application.js, you should add as follows:

```javascript
//= require jquery
//= require jquery_ujs
//= require popper
//= require bootstrap
//= require summernote/summernote-bs5.min
//= require_tree .
```

> **Note**: If you use SimpleForm with Bootstrap, you must execute `rails g simple_form --bootstrap` in Terminal.

## Usage

To use Summernote in a form, add a `data-provider="summernote"` to an input.

```erb
<%= form_for @article do |f| %>
  <div class="field">
    <%= f.label :text %>
    <%= f.text_area :text, data: { provider: 'summernote' } %>
  </div>
<% end %>
```

If you are using simple_form, you can use the `:summernote` input type.

```erb
<%= simple_form_for @article do |f| %>
  <%= f.input :text, as: :summernote %>
<% end %>
```

After creating app/assets/javascripts/application/summernote-init.js, you can write the following code:

```javascript
$(function () {
    'use strict';
    $('[data-provider="summernote"]').each(function () {
        $(this).summernote({
          height: 300
        });
    });
});
```

## Additional documentation

- [I18n](docs/i18n.md)
- [Plugin](docs/plugin.md)

## Sample projects

For an example, take a look at the `example` folder in this repository.
In this example, you can learn how to insert/delete images in summernote editor.

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
