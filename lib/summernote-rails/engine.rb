module SummernoteRails
  module Rails
    class Engine < ::Rails::Engine
      initializer 'summernote-rails.assets.precompile' do |app|
        app.config.assets.paths << root.join('vendor', 'assets', 'fonts')
        app.config.assets.precompile << /\.(?:eot|woff|ttf)$/
      end
    end
  end
end
