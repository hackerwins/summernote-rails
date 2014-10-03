# Summernote::Rails

This gem was built to gemify the assets used in Summernote, the Super Simple WYSIWYG Editor on Bootstrap, for Ruby on Rails version >= 3.1.

If you want to get the detailed information on how to use summernote editor, please click URL link to the website of Summernote.

https://github.com/hackerwins/summernote.

The version of summernote-rails is matched with that of summernote editor.

[![Gem Version](https://badge.fury.io/rb/summernote-rails.png)](http://badge.fury.io/rb/summernote-rails)

## Installation

Add the following gems to your application's Gemfile:

    gem 'simple_form'

    # You'll need to include the following dependencies of Summernote
    gem 'bootstrap-sass'
    gem "font-awesome-rails"

    # This is the right gem to use summernote editor in Rails projects.
    gem 'summernote-rails'

    # To solve the problems on the turbolinks
    gem 'jquery-turbolinks'

And then execute:

    $ bundle install

## Usage

First of all, the summernote editor works on Bootstrap and so it is assumed that you have already set it up.


In app/assets/stylesheets/application.css.scss,

```
// Bootstrap 3
@import "bootstrap";
@import "font-awesome";
@import "summernote";
body {padding-top:3em;}
```

In app/assets/javascripts/application.js, you should add the following:

```
//= require jquery
//= require jquery.turbolinks
//= require jquery_ujs
//= require bootstrap
//= require summernote.min
//= require lang/summernote-ko-KR
//= require_tree .
//= require turbolinks
```

For example, if you made a `Post` model using `scaffold generator` of Rails, you would see the `post` form view template in app/views/posts/_form.html.erb.

In that template file, you should add `summernote` class to the textarea input as the following:

```
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

```
$ ->

  # to set summernote object
  # You should change '#post_content' to your textarea input id
  summer_note = $('#post_content')

  # to call summernote editor
  summer_note.summernote
    # to set options
    height:300
    lang: 'ko-KR'
    # toolbar: [
                # ['insert', ['picture', 'link']], // no insert buttons
                # ["table", ["table"]],
                # ["style", ["style"]],
                # ["fontsize", ["fontsize"]],
                # ["color", ["color"]],
                # ["style", ["bold", "italic", "underline", "clear"]],
                # ["para", ["ul", "ol", "paragraph"]],
                # ["height", ["height"]],
                # ["help", ["help"]]
             #]

  # to set code for summernote
  summer_note.code summer_note.val()

  # to get code for summernote
  summer_note.closest('form').submit ->
    # alert $('#post_content').code()
    summer_note.val summer_note.code()
    true
```

That's it.


## Sample projects

 - Rails 3.2.16 : http://github.com/rorlab/summernote-test-r3
 - Rails 4.0.2 : http://github.com/rorlab/summernote-test

## Changelogs

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
