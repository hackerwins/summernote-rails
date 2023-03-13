module SummernoteRails
  module Rails
    class Engine < ::Rails::Engine
      initializer 'summernote-rails.assets.precompile' do |app|
        app.config.assets.paths << root.join('vendor', 'assets', 'fonts')

        # fix for: https://github.com/twbs/bootstrap-sass/issues/960
        # regex no longer supported by assets.precompile
        # sprockets-rails 3 tracks down the calls to `font_path` and `image_path`
        # and automatically precompiles the referenced assets.
        if old_sprockets?
          app.config.assets.precompile << /\.(?:eot|woff|ttf)$/
        end
      end

      initializer "summernote-rails.attribute" do
        ActiveSupport.on_load(:active_record) do
          include SummernoteRails::Rails::Attribute
        end
      end

      private

      def old_sprockets?
        defined?(Sprockets::Rails) && !Sprockets::Rails::VERSION.starts_with?('3')
      end
    end
  end
end
