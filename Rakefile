require "bundler/gem_tasks"
require 'open-uri'
require "json"

def download_release_file
  url = 'https://api.github.com/repos/summernote/summernote/releases/latest'
  zip_url = JSON.parse(open(url).read)['assets'].first['browser_download_url']

  FileUtils.rm_rf("tmp")
  FileUtils.mkdir_p("tmp")
  File.open("tmp/summernote.zip", "wb") do |saved_file|
    open(zip_url, "rb") do |read_file|
      saved_file.write(read_file.read)
    end
  end

  `unzip -d tmp tmp/summernote.zip`
end

def clean_assets
  `rm -rf vendor/assets/stylesheets`
  `rm -rf vendor/assets/fonts`
  `rm -rf vendor/assets/javascripts/lang`
  `rm -rf vendor/assets/javascripts/plugin`

  FileUtils.mkdir_p("vendor/assets/stylesheets")
  FileUtils.mkdir_p("vendor/assets/fonts")
  FileUtils.mkdir_p("vendor/assets/javascripts/summernote/lang")
  FileUtils.mkdir_p("vendor/assets/javascripts/summernote/plugin")
end

def clean_fonts
  css_paths = [
    "vendor/assets/stylesheets/summernote.css",
    "vendor/assets/stylesheets/summernote-bs4.css",
    "vendor/assets/stylesheets/summernote-lite.css"
  ]

  css_paths.each do |css_path|
    css_file = File.read(css_path)
    css_file = css_file.gsub(/url\(\"\.\/font\/summernote.([a-z]+)\?[0-9a-f]+(#iefix)*\"\)/, 'url(asset-path("summernote.\1\2"))')
    css_file = css_file.gsub(/#iefix/, '?\0')
    File.open(css_path, "w") {|old_css_file| old_css_file.print css_file}
  end
end

def copy_assets
  clean_assets

  `cp tmp/dist/summernote.js vendor/assets/javascripts/summernote/summernote.js`
  `cp tmp/dist/summernote.min.js vendor/assets/javascripts/summernote/summernote.min.js`
  `cp tmp/dist/summernote-bs4.js vendor/assets/javascripts/summernote/summernote-bs4.js`
  `cp tmp/dist/summernote-bs4.min.js vendor/assets/javascripts/summernote/summernote-bs4.min.js`
  `cp tmp/dist/summernote-lite.js vendor/assets/javascripts/summernote/summernote-lite.js`
  `cp tmp/dist/summernote-lite.min.js vendor/assets/javascripts/summernote/summernote-lite.min.js`
  `cp tmp/dist/summernote.css vendor/assets/stylesheets/summernote.css`
  `cp tmp/dist/summernote-bs4.css vendor/assets/stylesheets/summernote-bs4.css`
  `cp tmp/dist/summernote-lite.css vendor/assets/stylesheets/summernote-lite.css`
  `cp -R tmp/dist/plugin/* vendor/assets/javascripts/summernote/plugin`
  `cp -R tmp/dist/lang/* vendor/assets/javascripts/summernote/lang`
  `cp -R tmp/dist/font/* vendor/assets/fonts`
  
  clean_fonts
end

desc "Update assets"
task 'update' do
  download_release_file
  copy_assets
end
