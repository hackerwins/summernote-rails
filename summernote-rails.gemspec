# coding: utf-8

require File.expand_path('../lib/summernote-rails/version', __FILE__)

Gem::Specification.new do |spec|
  spec.name          = "summernote-rails"
  spec.version       = SummernoteRails::Rails::VERSION
  spec.authors       = ["Hyo Seong Choi"]
  spec.email         = ["rorlab@gmail.com"]
  spec.description   = %q{This gem packages the editor Summernote for Rails' assets pipeline}
  spec.summary       = %q{Gemify Summernote for Ruby on Rails}
  spec.homepage      = "https://github.com/summernote/summernote-rails"
  spec.license       = "MIT"

  # spec.files         = `git ls-files`.split($/)
  spec.files = Dir["{lib,vendor}/**/*"] + ["LICENSE.txt", "README.md"]
  # spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  # spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_dependency "railties", ">= 3.1"
  spec.add_development_dependency "bundler", "~> 1.3"
  spec.add_development_dependency "rake"
end
