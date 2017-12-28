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