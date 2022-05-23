require 'rails'
require 'summernote-rails/version'

autoload :SummernoteInput, 'summernote-rails/simple_form/summernote_input'
autoload :SummernoteCleaner, 'summernote-rails/cleaner'

module SummernoteRails
  module Rails
    if ::Rails.version.to_s < "3.1"
      require "summernote-rails/railtie"
    else
      require "summernote-rails/engine"
    end
  end
end