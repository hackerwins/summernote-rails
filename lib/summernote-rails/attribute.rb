module SummernoteRails
  module Rails
    module Attribute
      extend ActiveSupport::Concern

      class_methods do
        def has_summernote(name)
          before_save :"clean_#{name}_summernote_code"

          # https://dalibornasevic.com/posts/16-ruby-class_eval-__file__-and-__line__-arguments
          class_eval <<-CODE, __FILE__, __LINE__ + 1
            def clean_#{name}_summernote_code
              return if self.#{name}.blank?
              self.#{name} = SummernoteCleaner.clean self.#{name}
            end
          CODE
        end
      end
    end
  end
end