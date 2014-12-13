# Summernote::Rails

This gem was built to gemify the assets used in Summernote, the Super Simple WYSIWYG Editor on Bootstrap, for Ruby on Rails version >= 3.1.

If you want to get the detailed information on how to use summernote editor, please click URL link to the website of Summernote.

https://github.com/hackerwins/summernote.


The version of summernote-rails is matched with that of summernote editor.

[![Gem Version](https://badge.fury.io/rb/summernote-rails.png)](http://badge.fury.io/rb/summernote-rails)

> **Notice** : This repository was transferred from rorlab/summernote-rails to summernote/summernote-rails, on December 11, 2014.


## Installation

Add the following gems to your application's Gemfile:

```ruby
gem 'simple_form'

# You'll need to include the following dependencies of Summernote
gem 'bootstrap-sass'
gem "font-awesome-rails"

# This is the right gem to use summernote editor in Rails projects.
gem 'summernote-rails'
gem 'codemirror-rails'

# To solve the problems on the turbolinks
gem 'jquery-turbolinks'
```

And then execute:

```bash
$ bundle install
```

## Usage

First of all, the summernote editor works on Bootstrap and so it is assumed that you have already set it up.


In app/assets/stylesheets/application.css.scss,

```css
// Bootstrap 3
@import "bootstrap";
@import "font-awesome";
@import "summernote";
@import "codemirror";
@import "codemirror/themes/solarized";
@import "posts";
body {padding-top:3em;}
```

In app/assets/javascripts/application.js, you should add the following:

```js
//= require jquery
//= require jquery.turbolinks
//= require jquery_ujs
//= require bootstrap
//= require codemirror
//= require codemirror/modes/ruby
//= require codemirror/modes/sass
//= require codemirror/modes/shell
//= require codemirror/modes/sql
//= require codemirror/modes/slim
//= require codemirror/modes/nginx
//= require codemirror/modes/markdown
//= require codemirror/modes/javascript
//= require codemirror/modes/http
//= require codemirror/modes/htmlmixed
//= require codemirror/modes/haml
//= require codemirror/modes/xml
//= require codemirror/modes/css
//= require codemirror/modes/yaml
//= require codemirror/modes/slim
//= require codemirror/modes/php
//= require summernote
//= require lang/summernote-ko-KR
//= require_tree .
//= require turbolinks
```

For example, if you made a `Post` model using `scaffold generator` of Rails, you would see the `post` form view template in app/views/posts/_form.html.erb.

In that template file, you should add `summernote` class to the textarea input as the following:

```html
<%= simple_form_for(@post) do |f| %>
  <%= f.error_notification %>

  <div class="form-group">
    <%= f.input :title, input_html:{class:'form-control'} %>
  </div>
  <div class="form-group">
    <%= f.input :content, class:'summernote' %>
  </div>

  <div class="form-group">
    <%= f.button :submit, class:'btn btn-default' %>
  </div>
<% end %>
```

And then, in `post`-dedicated coffeescript file, app/assets/javascripts/posts.js.coffee, you should add the following:

```js
$ ->

  # to set summernote object
  # You should change '#post_content' to your textarea input id
  summer_note = $('#post_content')

  # to call summernote editor
  summer_note.summernote
    # to set options
    height:500
    lang: 'ko-KR'
    codemirror:
      lineNumbers: true
      tabSize: 2
      theme: "solarized light"

  # to set code for summernote
  summer_note.code summer_note.val()

  # to get code for summernote
  summer_note.closest('form').submit ->
    # alert $('#post_content').code()
    summer_note.val summer_note.code()
    true
```

It may be necessary to render multiple editors on the same page on multiple instances of the same css class. This can be acheived by modifying the javascript slightly:

```js
$ ->
  $('#post_content').each ->

    $(this).summernote
      # to set options
      height:500
      lang: 'ko-KR'
      codemirror:
        lineNumbers: true
        tabSize: 2
        theme: "solarized light"

    # to set code for summernote
    $(this).code $(this).val()
```

That's it.


## Sample projects

 - Rails 3.2.16 : https://github.com/rorlab/summernote-test-r3
 - Rails 4.1.6 : https://github.com/rorlab/summernote-rails-sample

## Changelogs

 - v0.5.10.2
    * Updated README.md

 - v0.5.10.0
    * Updated with `v0.5.10 Summernote, 2014-10-3`

 - v0.5.9 2014-09-21
    * Dom Editing: insert(Un)OrderedList, indent/outdent
    * History in a line.

 - v0.5.8 2014-08-31
    * Remove autoFormatRange option
    * Fixed onChange issues

 - v0.5.7 ~ v0.5.4 2014-08-29 ~ 2014-08-23
    * Dom editing: insertPara, insertNode

 - v0.5.3 2014-07-25
    * Extract codemirror.autoFormatOnStart option
    * Bug patch (createLink)

 - v0.5.2 2014-07-20
    * Air Mode
    * And bug patch (scroll, createLink, ...)

 - v0.5.1 2014-03-16
    * Support 15 Languages(https://github.com/HackerWins/summernote/tree/master/lang)
    * Add local-server for develop summernote.
    * Font style: Font-Family
    * And Bug patch.

 - v0.5.0   : Support i18n
    * Updated with `v0.5 Summernote, 2013-12-29` as the followings:
      * Support both Font-Awesome 3.x and 4.x
      * CodeMirror as Codeview
      * Insert Video (by cdownie)
      * Support 5 Languages(by hendrismit, tschiela, inomies, cverond)
      * Restructuring: jQuery build pattern

 - v0.4.0   : Support both Bootstrap 3.0 and 2.x
    * Updated with `v0.4 Summernote, 2013-11-01` as the followings:
    * View mode
      * Fullscreen
      * Code view
      * Image upload callback
 - v0.3.0   : Added the resizing bar at the bottom of editor.
    * Updated with `v0.3 Summernote, 2013-09-01` as the followings:
      * `FIXED` bugs(image upload, fontsize, tab, recent color, ...)
      * `ADDED` help dialog(keyboard shortcut)
      * `ADDED` init options(event callbacks, custom toolbar)
      * `ADDED` resize bar
      * `ADDED` support IE8 Beta(some range bugs, can't insert Image)
 - v0.2.1.4 : Enable to customize Toolbar Collection
 - v0.2.1.3 : Added Help button in editor toolbox to popup Hot Key Table
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
