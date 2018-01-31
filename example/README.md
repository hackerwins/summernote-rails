# Summernote-rails Update(3)

http://bit.ly/summernote-rails-for-fileupload-1 on Jun. 6, 2015, in Korean

http://bit.ly/summernote-rails-for-fileupload_2 on Jan. 2, 2016, in Korean

In my blog, the posts on summernote-rails gem are always the most frequent in daily visit statistics.

About 22 months were passed since last post on summernote. Official published version of summernote-rails is 0.8.3, as of Nov. 13, 2017.

Rails version is bumped up to 5.1.4 and ruby 2.4.2. And, maybe, Bootstrap will be updated to the official verion 4 as soon as possible. Right now, Bootstrap version is **4.0.0.beta2.1**.

But, the edge version of summernote-rails in GitHub repository is 0.8.8.

In this post, I'll update how to use summernote-rails gem and, introduce how to upload and delete image files in the summernote editor.

First of all, my local dev environment is as follows:


```sh
$ ruby -v
ruby 2.4.2p198 (2017-09-14 revision 59899) [x86_64-darwin16]
$ rails -v
Rails 5.1.4
```

Let's get started.

### 1. Create new project

Open your favorite terminal and create new project called "**summernote088**". Of course, we'll use the default serverless database, sqlite3.

```sh
$ rails new summernote088
```

 If you want another database, you can add your favorite database with '-d' option. For example, if you would use mysql or postgresql, you could add an option as follows:

```sh
$ rails new summernote088 -d [mysql|postgresql]
$ cd summernote088
```

### 2. commit initial state

At this time, you can commit the auto-generated source codes to local repository if you want.

```sh
$ git add .
$ git commit -m "initial commit"
```

### 3. create develop branch and checkout

And you can add the ''**develop**" branch to checkout to.

```sh
$ git checkout -b develop
```

### 4. install jquery gem

We'll use **Bootstrap**, which is dependent on **jQuery** library and so you should add **jquery-rails** gem. The reason is why this project is implemented using **Rails 5.1+** which is not any more dependent on **jQuery** and does not include by default in Gemfile. (https://github.com/rails/jquery-rails)

```sh
gem 'jquery-rails', '~> 4.3.1'
```

>  **Note**: From **Rails 5.1**, rails-ujs library substitute everything **jquery_ujs** does. So **jquery_ujs** is not needed any more on using **jquery**.  https://gorails.com/forum/do-i-need-rails-ujs-and-jquery_ujs

After bundling Gemfile, you should add the following code line at the top of the app/assets/javascripts/ **application.js**.

```js
//= require jquery3
```

> **Note**: **jquery3** means jquery version 3. You can use **jquery2** or just **jquery**.

### 5. install bootstrap gem

As of November, 2017, the latest version of Bootstrap is `4.0.0.beta2.1`. (https://github.com/twbs/bootstrap-rubygem)

Next, add the following code line to Gemfile and bundle install

```sh
gem 'bootstrap', '~> 4.0.0.beta2.1'
```

To use Bootstrap fully, you need to rename **application.css** file to **application.scss**. After that, you delete all contents of that file and add the following code line.

```css
@import "bootstrap";
```

Also, update **application.js** as follows:

```js
//= require jquery3
//= require popper
//= require bootstrap
```

>  **Note**: In develop mode, you can replace `//= require bootstrap` with `//= require bootstrap-sprockets`  which provides individual Bootstrap components for ease of debugging.

### 5. install simple_form

We'll use 'simple_form' gem.

```ruby
gem 'simple_form'
```

After running 'bundle install' in terminal, you should install simple_form with '**--bootstrap**' option.

```sh
$ rails generate simple_form:install --bootstrap
```

As of now, Simpe_form v3.5.0, it does not support Bootstrap 4 beta. And so you should fix config/initializers/**simple_form_bootstrap.rb** file as follows:

```ruby
# Reference - https://github.com/printercu/rails_sf_bs4/blob/master/config/initializers/simple_form_bootstrap.rb
# Use this setup block to configure all options available in SimpleForm.
# https://github.com/plataformatec/simple_form/pull/1476
SimpleForm::Inputs::Base.prepend Module.new {
  def merge_wrapper_options(options, wrapper_options)
    if wrapper_options&.key?(:error_class)
      wrapper_options = wrapper_options.dup
      error_class = wrapper_options.delete(:error_class)
      wrapper_options[:class] = "#{wrapper_options[:class]} #{error_class}" if has_errors?
    end
    super(options, wrapper_options)
  end
}

SimpleForm.setup do |config|
  config.error_notification_class = 'alert alert-danger'
  config.button_class = 'btn btn-primary'
  config.boolean_label_class = 'form-check-label'
  config.boolean_style = :nested
  config.item_wrapper_tag = :div
  config.item_wrapper_class = 'form-check'

  # Helpers
  wrapper_options = {class: 'form-group'}
  input_options = {error_class: 'is-invalid'}
  label_class = 'col-form-label'

  horizontal_options = wrapper_options.merge(class: 'form-group row')
  horizontal_label_class = "col-sm-3 #{label_class}"
  horizontal_right_class = 'col-sm-9'
  horizontal_right_offset_class = 'offset-sm-3'

  inline_class = 'mb-2 mr-sm-2 mb-sm-0'

  basic_input = ->(b, type = :basic) do
    b.use :html5
    b.use :placeholder
    break if type == :boolean
    b.optional :maxlength
    b.optional :minlength
    unless type == :file
      b.optional :pattern
      b.optional :min_max
    end
    b.optional :readonly
  end

  error_and_hint = ->(b) do
    b.use :error, wrap_with: {tag: 'span', class: 'invalid-feedback'}
    b.use :hint,  wrap_with: {tag: 'small', class: 'form-text text-muted'}
  end

  # Vertical forms
  config.wrappers :vertical_form, **wrapper_options do |b|
    basic_input.call(b)
    b.use :label, class: label_class
    b.use :input, **input_options, class: 'form-control'
    error_and_hint.call(b)
  end

  config.wrappers :vertical_file_input, **wrapper_options do |b|
    basic_input.call(b, :file)
    b.use :label, class: label_class
    b.use :input, **input_options, class: 'form-control-file'
    error_and_hint.call(b)
  end

  config.wrappers :vertical_boolean, **wrapper_options, class: 'form-check' do |b|
    basic_input.call(b, :boolean)
    b.use :label_input, class: 'form-check-input'
    error_and_hint.call(b)
  end

  config.wrappers :vertical_radio_and_checkboxes, **wrapper_options do |b|
    basic_input.call(b, :boolean)
    b.use :label, class: label_class
    b.use :input, **input_options, class: 'form-check-input'
    error_and_hint.call(b)
  end

  # Horizontal forms
  config.wrappers :horizontal_form, **horizontal_options do |b|
    basic_input.call(b)
    b.use :label, class: horizontal_label_class
    b.wrapper class: horizontal_right_class do |ba|
      ba.use :input, **input_options, class: 'form-control'
      error_and_hint.call(ba)
    end
  end

  config.wrappers :horizontal_file_input, **horizontal_options do |b|
    basic_input.call(b, :file)
    b.use :label, class: horizontal_label_class
    b.wrapper class: horizontal_right_class do |ba|
      ba.use :input, **input_options, class: 'form-control-file'
      error_and_hint.call(ba)
    end
  end

  config.wrappers :horizontal_boolean, **horizontal_options do |b|
    basic_input.call(b, :boolean)
    b.wrapper class: "#{horizontal_right_class} #{horizontal_right_offset_class}" do |wr|
      wr.wrapper class: 'form-check' do |ba|
        ba.use :label_input, class: 'form-check-input'
      end
      error_and_hint.call(wr)
    end
  end

  config.wrappers :horizontal_radio_and_checkboxes, **horizontal_options do |b|
    basic_input.call(b, :boolean)
    b.use :label, class: horizontal_label_class
    b.wrapper class: horizontal_right_class do |ba|
      ba.use :input, **input_options, class: 'form-check-input'
      error_and_hint.call(ba)
    end
  end

  # Inline forms
  config.wrappers :inline_form, class: inline_class do |b|
    basic_input.call(b)
    b.use :label, class: 'sr-only'
    b.use :input, **input_options, class: 'form-control'
    error_and_hint.call(b)
  end

  config.wrappers :inline_boolean, class: "form-check #{inline_class}" do |b|
    basic_input.call(b, :boolean)
    b.use :label_input, class: 'form-check-input'
    error_and_hint.call(b)
  end

  # Multiple selects
  config.wrappers :multi_select, **wrapper_options do |b|
    basic_input.call(b, :boolean)
    b.use :label, class: label_class
    b.wrapper class: 'multi-select d-flex' do |ba|
      ba.use :input, **input_options, class: 'form-control'
    end
    error_and_hint.call(b)
  end

  config.wrappers :horizontal_multi_select, **horizontal_options do |b|
    basic_input.call(b, :boolean)
    b.use :label, class: horizontal_label_class
    b.wrapper class: horizontal_right_class do |wr|
      wr.wrapper class: 'multi-select d-flex' do |ba|
        ba.use :input, **input_options, class: 'form-control'
      end
      error_and_hint.call(wr)
    end
  end

  # Wrappers for forms and inputs using the Bootstrap toolkit.
  # Check the Bootstrap docs (http://getbootstrap.com)
  # to learn about the different styles for forms and inputs,
  # buttons and other elements.
  config.default_wrapper = :vertical_form
  config.wrapper_mappings = {
    check_boxes: :vertical_radio_and_checkboxes,
    radio_buttons: :vertical_radio_and_checkboxes,
    file: :vertical_file_input,
    boolean: :vertical_boolean,
    datetime: :multi_select,
    date: :multi_select,
    time: :multi_select,
  }
end
```

> **Tip**: you just had better replace the original file with the above codebase.

Here, there is one point to update. You need to change`btn btn-default` to `btn btn-primary` because `btn-default` class was deprecated in Bootstrap 4 beta 2.

### 7. install summernote-rails gem

And now, it's time to add summernote-rail gem. Current available version of summernote-rails published in rubygems.org is **0.8.3**. But you can find the edge version **0.8.8** in GitHub repository.

```ruby
gem 'summernote-rails', github: 'summernote/summernote-rails'
```

After bundling, in app/assets/stylesheets/**application.scss**, you should import **summernote** stylesheet for Bootstrap 4. Additionally, you need to customize the editor styles and so to add new "summernote-custom-theme" stylesheet.

```css
@import "bootstrap";
@import "summernote-bs4";
@import "summernote-custom-theme";
```

app/assets/stylesheets/**summernote-custom-theme.scss**,

```css
.note-editor {
  .note-btn {
    background-color: white;
    border-color: #ccc;
  }
  .help-list-item + label {
    display: inline-block;
  }
  .modal-header {
    button.close {
      font-size: 1.2em;
    }
  }
  .modal-footer {
    display: inline-block;
    p:last-child {
      margin-bottom: 0 !important;
    }
    .note-btn {
      background-color: white;
      border-color: #ccc;
    }
  }
}
```

In app/assets/javascripts/**application.js**, you should add as follows:

```js
//= require ...
//= require bootstrap
//= require summernote/summernote-bs4
//= require summernote/locales/ko-KR
//= require ...
```

Additionally, you need create app/assets/javascripts/**summernote-init.coffee** as follows:

```js
$(document).on 'turbolinks:load', ->
  $('[data-provider="summernote"]').each ->
    $(this).summernote
      lang: 'ko-KR'
```

and insert it in **application.js**

```js
//= require ...
//= require bootstrap
//= require summernote/summernote-bs4
//= require summernote/locales/ko-KR
//= require summernote-init
//= require ...
```

### 8. scaffolding Post model

Using the scaffold generator of Rails, generate Post resource.

```sh
$ rails g scaffold Post title content:text
```

**Post** model has two attributes: title and content. Title is string-typed and content text-typed.

On running the above command, the migration file creating posts table is also created. And so you need to run **rails db:create** before **rails db:migrate** in your terminal. Finally, **posts** table will be created physically on your database.

Link tag style of **scaffolds.scss** is ugly and so you need to customize as the follows:

```css
a {
  color: #000;

  &:visited {
    color: rgb(181, 181, 181);
  }

  &:hover {
    columns: #000;
    background-color: #fff;
  }
}
```

And add this stylesheet to application.scss as follows:

```css
@import "bootstrap";
@import "summernote-bs4";
@import "summernote-custom-theme";
@import "scaffolds";
@import "posts";
```

### 9. Set root path

Now that you created the first resource, you can set up **root path** in config/**routes.rb**,

```ruby
root "posts#index"
```

### 10. Modify posts/_form.html.erb

The most important point is that you should add an option (**as: :summernote**) to the following code line.

```erb
<%= f.input :content, as: :summernote %>
```

This option will produce the **data-provider="summernote"** attribute in the following html rendered.

```html
<textarea class="form-control summernote optional" data-provider="summernote" name="post[content]" id="post_content" style="display: none;">
```

### 11. install carrierwave gem

In summernote editor, you can insert an image using editor menu icon (picture) or using drag and drop local image files to the editor. For file uploading, we'll use 'carrierwave' gem. Add the following to Gemfile and run "**bundle install**" in your terminal.

```ruby
gem 'carrierwave'
```

Now, you need create Upload model to store uploaded image information. This model has just one attribute called "image". And generate the uploader for this **Upload** model

```sh
$ rails g model Upload image
$ rails g uploader Image
```

Mount image uploader in **Upload** model class as follows:

```ruby
class Upload < ApplicationRecord
  mount_uploader :image, ImageUploader
end
```

To create and delete uploaded images, you need the controllers for **Upload** model instances as the follows:

```sh
$ rails g controller uploads create destroy
```

Let's write codes in app/controllers/uploads/**uploads_controller.rb** as follows:

```ruby
class UploadsController < ApplicationController

  def create
    @upload = Upload.new(upload_params)
    @upload.save

    respond_to do |format|
      format.json { render :json => { url: @upload.image.url, upload_id: @upload.id } }
    end
  end

  def destroy
    @upload = Upload.find(params[:id])
    @remember_id = @upload.id
    @upload.destroy
    FileUtils.remove_dir("#{Rails.root}/public/uploads/upload/image/#{@remember_id}")
    respond_to do |format|
      format.json { render :json => { status: :ok } }
    end
  end

  private

  def upload_params
    params.require(:upload).permit(:image)
  end
end
```


Also, we need to add resource routing for uploads controller in config/**routes.rb**,

```ruby
resources 'uploads', only: [:create, :destroy]
```

You can code **sendFile** and **deleteFile** function and update app/assets/javascripts/**summernote-init.coffee** as the follows:

```javascript
sendFile = (file, toSummernote) ->
  data = new FormData
  data.append 'upload[image]', file
  $.ajax
    data: data
    type: 'POST'
    url: '/uploads'
    cache: false
    contentType: false
    processData: false
    success: (data) ->
      img = document.createElement('IMG')
      img.src = data.url
      console.log data
      img.setAttribute('id', "sn-image-#{data.upload_id}")
      toSummernote.summernote 'insertNode', img      

deleteFile = (file_id) ->
  $.ajax
    type: 'DELETE'
    url: "/uploads/#{file_id}"
    cache: false
    contentType: false
    processData: false

$(document).on 'turbolinks:load', ->
  $('[data-provider="summernote"]').each ->
    $(this).summernote
      lang: 'ko-KR'
      height: 400
      callbacks:
        onImageUpload: (files) ->
          sendFile files[0], $(this)
        onMediaDelete: (target, editor, editable) ->
          upload_id = target[0].id.split('-').slice(-1)[0]
          console.log upload_id
          if !!upload_id
            deleteFile upload_id
          target.remove()
```

Lastly, you need to add raw() method to @post.content to view html code correctly.

```html
<p>
  <strong>Content:</strong>
  <%=raw @post.content %>
</p>
```

That's it.



> **Source**: https://github.com/luciuschoi/summernote088
