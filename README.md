# Summernote Rails

This gem was built to package the assets used in Summernote, the Super Simple WYSIWYG Editor on Bootstrap, for Ruby on Rails version >= 3.1.

The version of summernote-rails is matched with that of original summernote editor.

[![Gem Version](https://badge.fury.io/rb/summernote-rails.svg)](https://badge.fury.io/rb/summernote-rails)

> Note: From Rails 6+, webpack is used as the default javascript package(or module) bundler. Therefore, without summernote-rails, you can use the summernote javascript package using webpacker gem in Rails 6+. If you want to know about it more, you can visit [here](https://github.com/luciuschoi/welcome_rails6/tree/features/summernote#5-summernote).

## Installation

Environments:
- Ruby 2.6.5
- Gems :
  - Rails
  - Bootstrap
  - Simple Form

Add the following gems to your application's Gemfile:

```ruby
gem 'rails'
gem 'jquery-rails'
gem 'bootstrap'
gem 'simple_form'
gem 'summernote-rails', '~> 0.8.12'
```

And then execute:

```bash
$ bundle install
```

> **Note**: When you use simple_form with bootstrap, you should execute `rails g simple_form --bootstrap` in terminal. Especially, if you want to use Bootstrap version 4, you should create config/initializers/simple_form_bootstrap4.rb which you can reference in the **example** project in this repository.

## Usage

In app/assets/stylesheets/application.scss,

```scss
@import "bootstrap";
@import "summernote-bs4";
```

In app/assets/javascripts/application.js, you should add as follows:

```js
//= require jquery
//= require jquery_ujs
//= require popper
//= require bootstrap
//= require summernote/summernote-bs4.min
//= require activestorage
//= require turbolinks
//= require_tree .
```

Basic Example:

After creating app/assets/javascripts/summernote-init.coffee, you can write codes as follows:

```coffeescript
$(document).on 'turbolinks:load', ->
  $('[data-provider="summernote"]').each ->
    $(this).summernote
      height: 300
```

And you should require this file in application.js.

```js
//= require jquery
//= require jquery_ujs
//= require popper
//= require bootstrap
//= require summernote/summernote-bs4.min
//= require summernote-init
//= require activestorage
//= require turbolinks
//= require_tree .
```

Then, if you are using simple_form, you can use the `:summernote` input type. This type simply adds the `data-provider="summernote"` to the field.

```erb
<%= simple_form_for :example do | f | %>
  ...
  <%= f.input :text, as: :summernote %>
  ...
<% end %>
```  

Or, if you prefer haml-style,

```haml
= simple_form_for(:example) do | f |
  ...
  = f.input :text, as: :summernote
  ...
```

> **Note**: If you are not using **simple_form** gem, then simply add the `data-provider="summernote"` to the input field yourself.

When you use `form_with` helper,

```erb
<%= form_with(model: post, local: true) do |form| %>
  ・・・
  <div class="field">
    <%= form.label :text %>
    <%= form.text_area :text, 'data-provider': :summernote %>
  </div>
  ・・・
<% end %>
```

Or when you use `form_for` helper,

```erb
<%= form_for(post) do |form| %>
  ・・・
  <div class="field">
    <%= form.label :text %>
    <%= form.text_area :text, 'data-provider': :summernote %>
  </div>
  ・・・
<% end %>  
```

### i18n Support

If you use i18n, you have to include language files. In `app/assets/javascripts/application.js`, you should add the following:

```javascript
// load all locales
//= require summernote/lang

// or

// load specific locale(ko-KR)
//= require summernote/lang/summernote-ko-KR
```

and update summernote option

```coffee
$(document).on 'turbolinks:load', ->
  $('[data-provider="summernote"]').each ->
    $(this).summernote
      lang: 'ko-KR'
      height: 300
```

### Plugin

If you want to use a plugin, you have to include the corresponding file. In `app/assets/javascripts/application.js`, you should add the following:

```js
// load hello plugin
//= require summernote/plugin/hello/summernote-ext-hello
```

and update summernote option.

```coffee
$(document).on 'turbolinks:load', ->
  $('[data-provider="summernote"]').each ->
    $(this).summernote
      lang: 'ko-KR'
      height: 300
      toolbar : [
        ...
        [
          'insert'
            [
              'hello'
            ]
        ]
        ...
      ]
```

* [plugin example](https://github.com/summernote/summernote/blob/master/examples/plugin-hello.html)


## Sample projects

For an example, take a look at the `example` folder in this repository.
In this example, you can learn how to insert/delete images in summernote editor.

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
