class SummernoteInput < SimpleForm::Inputs::TextInput
  def input(wrapper_options)
    input_html_options[:data] ||= {}
    input_html_options[:data].merge!({ provider: 'summernote' })
    super
  end
end