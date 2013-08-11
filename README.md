# Summernote::Rails

This gem was built to gemify the assets used in Summernote, the Super Simple WYSIWYG Editor on Bootstrap, for Ruby on Rails version >= 3.1.

If you want to get the detailed information of how to use summernote editor, please click the website of Summernote, https://github.com/hackerwins/summernote.

The version of summernote-rails is matched with that of summernote editor.

[![Gem Version](https://badge.fury.io/rb/summernote-rails.png)](http://badge.fury.io/rb/summernote-rails)

## Installation

Add the following gems to your application's Gemfile:

    # for Rails 4.0
    gem 'simple_form', github: 'plataformatec/simple_form', tag: 'v3.0.0.beta1'
    # for Rails 3.x
    gem 'simple_form'

    # You'll need to include the following dependencies.
    gem 'bootstrap-sass'
    gem 'font-awesome-rails'
    gem 'summernote-rails'

And then execute:

    $ bundle

## Usage

First of all, the summernote editor works on Bootstrap and so it is assumed that you have already set it up.

Note that when using font-awesome-rails with bootstrap-sass, both FontAwesome & Glyphicon icons show up, overlapping. So if you have bootstrap_and_override.css.scss file, please add the following two code lines related with bootstrap's glyphicon:

In app/assets/stylesheets/bootstrap_and_override.css.scss, 

```
$iconSpritePath: '';
$iconWhiteSpritePath: '';

@import 'bootstrap';
body {padding-top:3em;}
@import 'bootstrap-responsive';
```

In app/assets/javascripts/application.js, you should add the following:

```
//= require summernote.min
or
//= require summernote  # if you want to require the uncompressed one
```

In app/assets/stylesheets/application.css, you should add the following:

```
*= require font-awesome
*= require summernote
```

For example, if you have a post form, in app/assets/javascripts/posts.js.coffee, you should add the following:

```
$ ->

  # to set summernote object
  # You should change '#post_content' to your textarea input id
  summer_note = $('#post_content')

  # to call summernote editor
  summer_note.summernote
    # to set options
    height:300  

  # to set code for summernote
  summer_note.code summer_note.val()

  # to get code for summernote
  summer_note.closest('form').submit ->
    # alert $('#post_content').code()[0]
    summer_note.val summer_note.code()[0]
    true
```

In app/views/posts/_form.html.erb, you should add 'summernote' class to the textarea input as the following:

```
<%= simple_form_for(@post) do |f| %>
  <%= f.error_notification %>

  <div class="form-inputs">
    <%= f.input :title %>
    <%= f.input :content, class:'summernote' %>
  </div>

  <div class="form-actions">
    <%= f.button :submit %>
  </div>
<% end %>
```

That's it. 


## Examples projects 

 - Rails 3.2.14 : http://github.com/rorlab/summernote-test-r3
 - Rails 4.0 : http://github.com/rorlab/summernote-test

## Changelogs

 - v0.2.1.2 : Added InsertHorizontalRule(Cmd+Enter) in summernote editor / 
              Added summernote.js 
 - v0.2.1.1 : Available for Rails >= 3.1
 - v0.2.1   : Bugfixed file uploading
 - v0.2.0   : Available for Rails v4.0


## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
